import json
import csv
from pathlib import Path


def ensure_output_dir(output_dir):
    Path(output_dir).mkdir(parents=True, exist_ok=True)


def write_json(results, output_dir):
    ensure_output_dir(output_dir)

    output_path = Path(output_dir) / "sqli_test_results.json"

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    return output_path


def write_csv(results, output_dir):
    ensure_output_dir(output_dir)

    output_path = Path(output_dir) / "sqli_test_results.csv"

    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)

        writer.writerow([
            "test_id",
            "test_name",
            "payload_group",
            "environment",
            "url",
            "status_code",
            "response_time",
            "classification"
        ])

        for item in results:
            writer.writerow([
                item["test_id"],
                item["test_name"],
                item["payload_group"],
                item["environment"],
                item["url"],
                item["status_code"],
                item["response_time"],
                item["classification"]
            ])

    return output_path


def print_summary(results):
    print("\n===== SQL Injection Test Summary =====")

    total = len(results)
    print(f"Total requests: {total}")

    summary = {}

    for item in results:
        label = item["classification"]
        summary[label] = summary.get(label, 0) + 1

    for label, count in summary.items():
        print(f"{label}: {count}")

    print("======================================\n")
