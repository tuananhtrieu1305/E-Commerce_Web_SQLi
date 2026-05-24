import json
from config import (
    VULNERABLE_BASE_URL,
    PROTECTED_BASE_URL,
    TIMEOUT_SECONDS
)
from runner import send_request
from analyzer import analyze_response
from reporter import write_json, write_csv, print_summary


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    payloads = load_json("payloads.json")
    endpoints = load_json("endpoints.json")

    environments = {
        "vulnerable": VULNERABLE_BASE_URL,
        "protected": PROTECTED_BASE_URL
    }

    results = []

    for endpoint in endpoints:
        payload_group = endpoint["payload_group"]
        group_payloads = payloads[payload_group]

        for payload in group_payloads:
            for environment_name, base_url in environments.items():
                print(
                    f"Running {endpoint['id']} "
                    f"on {environment_name} "
                    f"with payload group {payload_group}"
                )

                response = send_request(
                    base_url=base_url,
                    endpoint=endpoint,
                    payload=payload,
                    timeout=TIMEOUT_SECONDS
                )

                classification = analyze_response(
                    environment=environment_name,
                    endpoint=endpoint,
                    result=response
                )

                results.append({
                    "test_id": endpoint["id"],
                    "test_name": endpoint["name"],
                    "payload_group": payload_group,
                    "environment": environment_name,
                    "payload": payload,
                    "url": response["url"],
                    "status_code": response["status_code"],
                    "response_time": response["response_time"],
                    "body_snippet": response["body_snippet"],
                    "error": response["error"],
                    "classification": classification
                })

    output_dir = "results"

    json_path = write_json(results, output_dir)
    csv_path = write_csv(results, output_dir)

    print_summary(results)

    print(f"JSON report: {json_path}")
    print(f"CSV report: {csv_path}")


if __name__ == "__main__":
    main()
