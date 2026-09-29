"""Record a tutor review into data/reviews.json.

Used by the tutor (Claude Code) after actually reviewing your workspace files.
A "mastered" verdict is the only thing that marks a lesson mastered and starts
its spaced-revision schedule (the dashboard derives both from this file).

Examples:
  python tools/review.py L01 revise   --notes "Task 4 prediction missing..."
  python tools/review.py L01 mastered --notes "Clear trace; strong on compile vs run."
  python tools/review.py --project P00 --notes "System Info CLI reviewed"
"""

import argparse
import sys
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from server import REVIEWS_FILE, read_json, write_json  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("lesson", nargs="?", help="Lesson id, e.g. L01")
    parser.add_argument("verdict", nargs="?", choices=["mastered", "revise"])
    parser.add_argument("--notes", required=True, help="Review feedback shown in the dashboard")
    parser.add_argument("--project", help="Mark a project id (e.g. P00) as completed")
    args = parser.parse_args()
    if not args.project and not (args.lesson and args.verdict):
        parser.error("give LESSON VERDICT, or --project")

    tutor = read_json(REVIEWS_FILE)
    reviews = tutor.setdefault("reviews", [])
    today = date.today().isoformat()
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    if args.lesson:
        reviews.append({"lessonId": args.lesson, "date": today, "at": now, "verdict": args.verdict, "notes": args.notes})
        print(f"{args.lesson}: recorded '{args.verdict}' review")
    if args.project:
        done = tutor.setdefault("completedProjects", [])
        if args.project not in done:
            done.append(args.project)
        reviews.append({"lessonId": args.project, "date": today, "at": now, "verdict": "project-complete", "notes": args.notes})
        print(f"{args.project}: marked complete")

    write_json(REVIEWS_FILE, tutor)


if __name__ == "__main__":
    main()
