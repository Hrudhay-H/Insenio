"""Runs both guardrail eval suites against the live Databricks Foundation Model
endpoint and prints a report. TRD §2.5 / M10: "even lightweight evals show
intentional safety design" — this is that, not a certified safety benchmark.

Usage (from backend/, with the venv active):
    python -m evals.run_evals
"""

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from app.agents.apply_assist import draft_application
from app.agents.intake_agent import is_in_scope
from evals.apply_assist_cases import APPLY_ASSIST_CASES, check_grounded_mention, check_no_fabrication
from evals.scope_cases import SCOPE_CASES


def run_scope_evals() -> list[dict]:
    results = []
    for case in SCOPE_CASES:
        start = time.time()
        actual = is_in_scope(case["messages"])
        elapsed = time.time() - start
        passed = actual == case["expect_in_scope"]
        results.append(
            {
                "id": case["id"],
                "category": case["category"],
                "expected": case["expect_in_scope"],
                "actual": actual,
                "passed": passed,
                "elapsed_s": round(elapsed, 2),
            }
        )
    return results


def run_apply_assist_evals() -> list[dict]:
    results = []
    for case in APPLY_ASSIST_CASES:
        start = time.time()
        try:
            draft = draft_application(case["profile"], case["lab"])
            error = None
        except Exception as e:
            draft, error = None, str(e)
        elapsed = time.time() - start

        if error:
            passed, detail = False, [f"draft_application raised: {error}"]
        elif case["check"] == "no_fabrication":
            passed, detail = check_no_fabrication(draft, case["forbidden_claims"])
        elif case["check"] == "grounded_mention":
            passed, detail = check_grounded_mention(draft, case["required_terms"])
        else:
            raise ValueError(f"Unknown check type: {case['check']}")

        results.append(
            {
                "id": case["id"],
                "check": case["check"],
                "passed": passed,
                "violations_or_missing": detail,
                "draft": draft,
                "elapsed_s": round(elapsed, 2),
            }
        )
    return results


def _print_scope_report(results: list[dict]) -> None:
    print("\n=== Scope guardrail eval (intake agent) ===")
    for r in results:
        mark = "PASS" if r["passed"] else "FAIL"
        print(f"  [{mark}] {r['id']:38s} category={r['category']:18s} expected={r['expected']!s:5} actual={r['actual']!s:5} ({r['elapsed_s']}s)")
    n_pass = sum(r["passed"] for r in results)
    print(f"  -> {n_pass}/{len(results)} passed ({n_pass / len(results):.0%})")


def _print_apply_assist_report(results: list[dict]) -> None:
    print("\n=== Apply Assist grounding eval ===")
    for r in results:
        mark = "PASS" if r["passed"] else "FAIL"
        print(f"  [{mark}] {r['id']:34s} check={r['check']:17s} ({r['elapsed_s']}s)")
        if not r["passed"]:
            print(f"         violations/missing: {r['violations_or_missing']}")
            if r["draft"]:
                print(f"         message: {r['draft'].get('message', '')[:300]}")
    n_pass = sum(r["passed"] for r in results)
    print(f"  -> {n_pass}/{len(results)} passed ({n_pass / len(results):.0%})")


def main() -> int:
    scope_results = run_scope_evals()
    apply_results = run_apply_assist_evals()

    _print_scope_report(scope_results)
    _print_apply_assist_report(apply_results)

    scope_rate = sum(r["passed"] for r in scope_results) / len(scope_results)
    apply_rate = sum(r["passed"] for r in apply_results) / len(apply_results)
    print(f"\n=== Summary ===\n  scope guardrail:  {scope_rate:.0%}\n  apply-assist grounding: {apply_rate:.0%}")

    out_dir = Path(__file__).parent / "results"
    out_dir.mkdir(exist_ok=True)
    report = {
        "run_at": datetime.now(timezone.utc).isoformat(),
        "scope_pass_rate": scope_rate,
        "apply_assist_pass_rate": apply_rate,
        "scope_results": scope_results,
        "apply_assist_results": apply_results,
    }
    out_path = out_dir / "latest.json"
    out_path.write_text(json.dumps(report, indent=2))
    print(f"\nFull report written to {out_path}")

    return 0 if (scope_rate == 1.0 and apply_rate == 1.0) else 1


if __name__ == "__main__":
    sys.exit(main())
