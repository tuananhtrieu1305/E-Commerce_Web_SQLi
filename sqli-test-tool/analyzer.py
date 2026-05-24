from config import SLOW_RESPONSE_THRESHOLD


SQL_ERROR_KEYWORDS = [
    "sql syntax",
    "mysql",
    "jdbc",
    "hibernate",
    "syntax error",
    "unknown column",
    "stack trace",
    "sqlexception"
]


def analyze_response(environment, endpoint, result):
    status_code = result.get("status_code")
    body = (result.get("body_snippet") or "").lower()
    response_time = result.get("response_time") or 0

    if result.get("error"):
        return "CONNECTION_ERROR"

    if endpoint["payload_group"] == "normal":
        if status_code and 200 <= status_code < 300:
            return "PASS_NORMAL"
        return "FALSE_POSITIVE"

    if status_code in [400, 403, 406, 429]:
        return "BLOCKED"

    for keyword in SQL_ERROR_KEYWORDS:
        if keyword in body:
            return "ERROR_LEAK"

    if response_time >= SLOW_RESPONSE_THRESHOLD:
        return "SLOW_RESPONSE"

    if environment == "protected" and status_code and 200 <= status_code < 300:
        return "SAFE_OR_LITERAL"

    if environment == "vulnerable" and status_code and 200 <= status_code < 500:
        return "NOT_BLOCKED"

    return "CHECK_MANUALLY"
