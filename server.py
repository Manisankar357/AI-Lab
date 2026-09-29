"""AI Engineering Lab - local server.

Standard library only. Serves the dashboard from ./web and persists your
learning progress to ./data/progress.json.

Run:  python server.py        then open http://localhost:8765
"""

import json
import os
import tempfile
import threading
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
DATA_DIR = Path(os.environ.get("LAB_DATA_DIR", ROOT / "data"))  # override for testing
PROGRESS_FILE = DATA_DIR / "progress.json"
# Tutor-owned: written only by tools/review.py, never by the browser, so an
# open dashboard tab can't overwrite a review.
REVIEWS_FILE = DATA_DIR / "reviews.json"
TUTOR_KEYS = ("reviews", "completedProjects")
SAVE_LOCK = threading.Lock()
HOST = "127.0.0.1"  # localhost only: your learning data never leaves this machine
PORT = int(os.environ.get("LAB_PORT", "8765"))
MAX_BODY_BYTES = 2_000_000


def read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        # Keep the corrupt file for inspection instead of silently losing it.
        path.replace(path.with_suffix(".corrupt.json"))
        return {}


def write_json(path: Path, data: dict) -> None:
    """Write atomically: temp file first, then rename, so a crash never leaves half a file."""
    DATA_DIR.mkdir(exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=DATA_DIR, suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


def load_progress() -> dict:
    """Learner progress with the tutor's reviews merged in."""
    progress = read_json(PROGRESS_FILE)
    tutor = read_json(REVIEWS_FILE)
    for key in TUTOR_KEYS:
        progress[key] = tutor.get(key, [])
    return progress


def save_progress(progress: dict) -> None:
    write_json(PROGRESS_FILE, {k: v for k, v in progress.items() if k not in TUTOR_KEYS})


class LabHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _send_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/progress":
            self._send_json(load_progress())
        else:
            super().do_GET()

    def do_PUT(self):
        if self.path != "/api/progress":
            self._send_json({"error": "not found"}, HTTPStatus.NOT_FOUND)
            return
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0 or length > MAX_BODY_BYTES:
            self._send_json({"error": "invalid body size"}, HTTPStatus.BAD_REQUEST)
            return
        try:
            progress = json.loads(self.rfile.read(length))
        except json.JSONDecodeError:
            self._send_json({"error": "invalid JSON"}, HTTPStatus.BAD_REQUEST)
            return
        if not isinstance(progress, dict):
            self._send_json({"error": "progress must be an object"}, HTTPStatus.BAD_REQUEST)
            return
        # Optimistic concurrency: each save must be based on the latest copy.
        # A stale tab gets 409 and re-applies its change on top of the latest.
        with SAVE_LOCK:
            current_rev = read_json(PROGRESS_FILE).get("rev", 0)
            # Tabs opened before this check existed send no "rev": accept them.
            if "rev" in progress and progress["rev"] != current_rev:
                self._send_json({"error": "stale", "rev": current_rev}, HTTPStatus.CONFLICT)
                return
            progress["rev"] = current_rev + 1
            save_progress(progress)
        self._send_json({"ok": True, "rev": progress["rev"]})

    def log_message(self, fmt, *args):
        if "/api/" in self.path:
            super().log_message(fmt, *args)


class LabServer(ThreadingHTTPServer):
    # On Windows, SO_REUSEADDR lets a second server silently share the port,
    # so two copies would both answer requests. Refuse instead.
    allow_reuse_address = os.name != "nt"


def main():
    try:
        server = LabServer((HOST, PORT), LabHandler)
    except OSError:
        print(f"The lab is already running at http://localhost:{PORT}: just open that in your browser.")
        print("(To restart it, press Ctrl+C in the terminal where it's running, then run this again.)")
        raise SystemExit(1)
    print(f"AI Engineering Lab running at http://localhost:{PORT}  (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
