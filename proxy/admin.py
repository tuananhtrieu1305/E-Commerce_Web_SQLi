import os
import subprocess
import threading
import time
from flask import Flask, request, jsonify
import redis

ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN') or os.environ.get('PROXY_ADMIN_TOKEN')
BLACKLIST_FILE = '/etc/nginx/blocked_ips.conf'
REDIS_HOST = os.environ.get('REDIS_HOST', 'redis')
REDIS_PORT = int(os.environ.get('REDIS_PORT', '6379'))

try:
    rds = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
except Exception:
    rds = None

app = Flask(__name__)

if not ADMIN_TOKEN:
    print('Warning: ADMIN_TOKEN not set. Admin API will reject requests.')

lock = threading.Lock()

bans = {}  # ip -> expiry timestamp

def nginx_reload():
    try:
        subprocess.run(['nginx', '-s', 'reload'], check=True)
    except Exception as e:
        app.logger.error('nginx reload failed: %s', e)

def write_blacklist(lines):
    with open(BLACKLIST_FILE, 'w') as f:
        f.write('# runtime blacklist: add lines like\n')
        for l in lines:
            f.write(l + '\n')

def read_blacklist_lines():
    try:
        with open(BLACKLIST_FILE, 'r') as f:
            return [ln.strip() for ln in f.readlines() if ln.strip() and not ln.strip().startswith('#')]
    except FileNotFoundError:
        return []

def schedule_unban(ip, ttl):
    def _unban():
        time.sleep(ttl)
        with lock:
            # remove ban
            lines = read_blacklist_lines()
            deny = f"deny {ip};"
            new = [l for l in lines if l != deny]
            write_blacklist(new)
            bans.pop(ip, None)
            # remove from redis as well
            if rds:
                try:
                    rds.delete(f"ban:{ip}")
                except Exception:
                    pass
        nginx_reload()
    t = threading.Thread(target=_unban, daemon=True)
    t.start()

def check_auth(req):
    auth = req.headers.get('Authorization', '')
    if not ADMIN_TOKEN:
        return False
    if not auth.startswith('Bearer '):
        return False
    token = auth.split(' ', 1)[1].strip()
    return token == ADMIN_TOKEN

@app.route('/admin/ban', methods=['POST'])
def ban():
    if not check_auth(request):
        return jsonify({'error': 'unauthorized'}), 401
    data = request.get_json() or {}
    ip = data.get('ip')
    ttl = int(data.get('ttl', 3600))
    if not ip:
        return jsonify({'error': 'ip required'}), 400
    deny = f"deny {ip};"
    with lock:
        lines = read_blacklist_lines()
        if deny not in lines:
            lines.append(deny)
            write_blacklist(lines)
            bans[ip] = time.time() + ttl
            schedule_unban(ip, ttl)
            # write to redis
            if rds:
                try:
                    rds.setex(f"ban:{ip}", ttl, '1')
                except Exception as e:
                    app.logger.error('redis set failed: %s', e)
            nginx_reload()
    return jsonify({'status': 'banned', 'ip': ip, 'ttl': ttl})

@app.route('/admin/unban', methods=['POST'])
def unban():
    if not check_auth(request):
        return jsonify({'error': 'unauthorized'}), 401
    data = request.get_json() or {}
    ip = data.get('ip')
    if not ip:
        return jsonify({'error': 'ip required'}), 400
    deny = f"deny {ip};"
    with lock:
        lines = read_blacklist_lines()
        new = [l for l in lines if l != deny]
        write_blacklist(new)
        bans.pop(ip, None)
        if rds:
            try:
                rds.delete(f"ban:{ip}")
            except Exception:
                pass
    nginx_reload()
    return jsonify({'status': 'unbanned', 'ip': ip})

@app.route('/admin/list', methods=['GET'])
def list_bans():
    if not check_auth(request):
        return jsonify({'error': 'unauthorized'}), 401
    with lock:
        now = time.time()
        result = [{'ip': ip, 'expires_at': int(exp)} for ip, exp in bans.items()]
    return jsonify({'bans': result})

if __name__ == '__main__':
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(('0.0.0.0', 8888))
        s.close()
        app.run(host='0.0.0.0', port=8888)
    except OSError:
        print('[admin.py] Port 8888 already in use, exiting.')
        s.close()
