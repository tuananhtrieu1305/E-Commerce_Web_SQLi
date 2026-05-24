import os
import time
import requests
import mysql.connector
from collections import defaultdict, deque

# Config via env
ADMIN_URL = os.environ.get('ADMIN_URL', 'http://reverse-proxy:8888/admin/ban')
TOKEN = os.environ.get('PROXY_ADMIN_TOKEN', '')
POLL_INTERVAL = int(os.environ.get('POLL_INTERVAL', '10'))
WINDOW_SECONDS = int(os.environ.get('WINDOW_SECONDS', '300'))  # 5 minutes
THRESHOLD = int(os.environ.get('THRESHOLD', '3'))
TTL = int(os.environ.get('BAN_TTL', '3600'))

MYSQL_HOST = os.environ.get('MYSQL_HOST', 'mysql')
MYSQL_PORT = int(os.environ.get('MYSQL_PORT', '3306'))
MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
MYSQL_DATABASE_VULN = os.environ.get('MYSQL_DATABASE_VULNERABLE', 'e_commerce_vulnerable')
MYSQL_DATABASE_SECURE = os.environ.get('MYSQL_DATABASE_SECURE', 'e_commerce_secure')

headers = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}

# maintain events per IP
events = defaultdict(deque)  # ip -> deque of timestamps
already_banned = set()
last_id = { 'vuln': 0, 'secure': 0 }

SEVERITY_WEIGHT = {
    'LOW': 1,
    'MEDIUM': 2,
    'CRITICAL': 3,
}

def ban_ip(ip):
    if not TOKEN:
        print('PROXY_ADMIN_TOKEN not set; cannot ban')
        return False
    if ip in already_banned:
        return False
    payload = {'ip': ip, 'ttl': TTL}
    try:
        r = requests.post(ADMIN_URL, headers=headers, json=payload, timeout=5)
        if r.status_code == 200:
            print(f'Banned {ip}')
            already_banned.add(ip)
            return True
        else:
            print('Ban failed', r.status_code, r.text)
    except Exception as e:
        print('Ban request error', e)
    return False

def get_db_connection():
    return mysql.connector.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD)

def poll_db():
    global last_id
    print('Detector starting; polling DBs', MYSQL_HOST)
    while True:
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            for key, db in (('vuln', MYSQL_DATABASE_VULN), ('secure', MYSQL_DATABASE_SECURE)):
                try:
                    cursor.execute(f"SELECT id, event_time, db_name, ip, severity, payload FROM {db}.security_audit_log WHERE id > %s ORDER BY id ASC", (last_id[key],))
                    rows = cursor.fetchall()
                    for row in rows:
                        rid = row.get('id')
                        ts = row.get('event_time').timestamp() if row.get('event_time') else time.time()
                        ip = row.get('ip') or 'unknown'
                        severity = (row.get('severity') or 'LOW').upper()
                        if ip == 'unknown':
                            # skip if no IP available; could try to extract from payload later
                            continue
                        dq = events[ip]
                        dq.append((ts, SEVERITY_WEIGHT.get(severity, 1)))
                        now = time.time()
                        while dq and dq[0][0] < now - WINDOW_SECONDS:
                            dq.popleft()
                        weighted_score = sum(weight for _, weight in dq)
                        if severity == 'CRITICAL' or weighted_score >= THRESHOLD:
                            ban_ip(ip)
                        last_id[key] = max(last_id[key], rid)
                except mysql.connector.Error as e:
                    print('DB query error for', db, e)
            cursor.close()
            conn.close()
        except Exception as e:
            print('Detector main error', e)
        time.sleep(POLL_INTERVAL)

if __name__ == '__main__':
    # initial last_id may be set to current max to avoid mass processing
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(f"SELECT MAX(id) FROM {MYSQL_DATABASE_VULN}.security_audit_log")
        last_id['vuln'] = cursor.fetchone()[0] or 0
        cursor.execute(f"SELECT MAX(id) FROM {MYSQL_DATABASE_SECURE}.security_audit_log")
        last_id['secure'] = cursor.fetchone()[0] or 0
        cursor.close()
        conn.close()
    except Exception:
        pass
    poll_db()
