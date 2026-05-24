import time
import json
from urllib import request, parse, error


def build_url(base_url, path, params=None):
    url = base_url.rstrip("/") + "/" + path.lstrip("/")

    if params:
        query_string = parse.urlencode(params)
        url = url + "?" + query_string

    return url


def send_request(base_url, endpoint, payload, timeout=8):
    method = endpoint.get("method", "GET").upper()
    path = endpoint["path"]
    param = endpoint.get("param")

    params = {}
    body = None
    headers = {
        "Accept": "application/json"
    }

    if method == "GET":
        if param:
            params[param] = payload
        url = build_url(base_url, path, params)

    else:
        url = build_url(base_url, path)
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = request.Request(
        url=url,
        data=body,
        headers=headers,
        method=method
    )

    start_time = time.perf_counter()

    try:
        with request.urlopen(req, timeout=timeout) as response:
            response_body = response.read(3000).decode("utf-8", errors="replace")
            elapsed = time.perf_counter() - start_time

            return {
                "url": url,
                "status_code": response.status,
                "response_time": round(elapsed, 3),
                "body_snippet": response_body[:1000],
                "error": None
            }

    except error.HTTPError as e:
        response_body = e.read(3000).decode("utf-8", errors="replace")
        elapsed = time.perf_counter() - start_time

        return {
            "url": url,
            "status_code": e.code,
            "response_time": round(elapsed, 3),
            "body_snippet": response_body[:1000],
            "error": None
        }

    except Exception as e:
        elapsed = time.perf_counter() - start_time

        return {
            "url": url,
            "status_code": None,
            "response_time": round(elapsed, 3),
            "body_snippet": "",
            "error": str(e)
        }
