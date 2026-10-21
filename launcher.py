"""
Aegis Link Master Launcher

Starts the FastAPI backend and the React frontend together, waits until both
respond, opens the app in the browser, and shuts *both process trees* down
cleanly on Ctrl+C (so no orphaned dev server keeps holding port 3000/8000).

Usage:
    python launcher.py                  # backend + frontend
    python launcher.py --backend-only
    python launcher.py --frontend-only
    python launcher.py --no-browser     # don't open the browser automatically
    python launcher.py --yes            # answer "yes" to prompts (free busy ports, install deps)
"""

from __future__ import annotations

import argparse
import importlib.util
import os
import signal
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser
from typing import List, Optional

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
IS_WINDOWS = os.name == "nt"

BACKEND_PORT = 8000
FRONTEND_PORT = 3000
BACKEND_URL = f"http://localhost:{BACKEND_PORT}"
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"
STARTUP_TIMEOUT_S = 180  # the first CRA compile can be slow


# ── Console helpers ──────────────────────────────────────────────────────

def banner(text: str) -> None:
    print("=" * 62)
    print(f" {text}")
    print("=" * 62)


def info(text: str) -> None:
    print(f"  • {text}")


def warn(text: str) -> None:
    print(f"  ! {text}")


def ask(question: str, assume_yes: bool) -> bool:
    if assume_yes:
        print(f"  ? {question} [y/N] y (--yes)")
        return True
    try:
        return input(f"  ? {question} [y/N] ").strip().lower() in ("y", "yes")
    except EOFError:
        return False


# ── Ports & processes ────────────────────────────────────────────────────

def port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def pids_on_port(port: int) -> List[int]:
    """Best-effort lookup of the PIDs listening on a port."""
    pids: set[int] = set()
    try:
        if IS_WINDOWS:
            out = subprocess.run(["netstat", "-ano", "-p", "TCP"], capture_output=True, text=True).stdout
            for line in out.splitlines():
                parts = line.split()
                if len(parts) >= 5 and parts[3].upper() == "LISTENING" and parts[1].endswith(f":{port}"):
                    pids.add(int(parts[4]))
        else:
            out = subprocess.run(["lsof", "-ti", f"tcp:{port}", "-sTCP:LISTEN"], capture_output=True, text=True).stdout
            pids.update(int(p) for p in out.split() if p.isdigit())
    except (OSError, ValueError):
        pass
    return sorted(pids)


def kill_tree(pid: int) -> None:
    """Terminate a process together with all of its children."""
    try:
        if IS_WINDOWS:
            subprocess.run(["taskkill", "/T", "/F", "/PID", str(pid)], capture_output=True)
        else:
            os.killpg(os.getpgid(pid), signal.SIGTERM)
    except (OSError, ProcessLookupError):
        pass


def free_port(port: int, name: str, assume_yes: bool) -> bool:
    if not port_in_use(port):
        return True
    pids = pids_on_port(port)
    warn(f"Port {port} ({name}) is already in use" + (f" by PID {', '.join(map(str, pids))}." if pids else "."))
    warn("This is often a dev server left running from an earlier session.")
    if pids and ask(f"Stop the process on port {port} and continue?", assume_yes):
        for pid in pids:
            kill_tree(pid)
        for _ in range(20):
            if not port_in_use(port):
                info(f"Port {port} is free.")
                return True
            time.sleep(0.5)
    warn(f"Port {port} is still busy. Stop that process and run the launcher again.")
    return False


def wait_until_up(url: str, proc: subprocess.Popen, name: str, timeout: int = STARTUP_TIMEOUT_S) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if proc.poll() is not None:
            warn(f"{name} exited during startup (code {proc.returncode}). See its output above.")
            return False
        try:
            with urllib.request.urlopen(url, timeout=2):
                return True
        except urllib.error.HTTPError:
            return True  # the server answered, even if not with 200
        except (urllib.error.URLError, ConnectionError, OSError):
            time.sleep(1)
    warn(f"{name} did not respond within {timeout}s.")
    return False


# ── Dependency checks ────────────────────────────────────────────────────

def ensure_frontend_deps(assume_yes: bool) -> bool:
    if os.path.isdir(os.path.join(ROOT_DIR, "node_modules")):
        return True
    warn("Frontend dependencies are not installed (node_modules is missing).")
    if not ask("Run `npm install` now?", assume_yes):
        return False
    npm = "npm.cmd" if IS_WINDOWS else "npm"
    return subprocess.run([npm, "install"], cwd=ROOT_DIR).returncode == 0


def ensure_backend_deps(assume_yes: bool) -> bool:
    missing = [m for m in ("fastapi", "uvicorn") if importlib.util.find_spec(m) is None]
    if not missing:
        return True
    warn(f"Backend packages missing for {sys.executable}: {', '.join(missing)}.")
    if not ask("Install backend requirements (pip install -r backend/requirements.txt)?", assume_yes):
        return False
    req = os.path.join(BACKEND_DIR, "requirements.txt")
    return subprocess.run([sys.executable, "-m", "pip", "install", "-r", req]).returncode == 0


# ── Process management ───────────────────────────────────────────────────

def start(cmd: List[str], cwd: str, env: Optional[dict] = None) -> subprocess.Popen:
    kwargs: dict = {"cwd": cwd, "env": env}
    if IS_WINDOWS:
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["start_new_session"] = True  # own process group so killpg reaches children
    return subprocess.Popen(cmd, **kwargs)


def main() -> int:
    parser = argparse.ArgumentParser(description="Launch the Aegis Link backend and frontend.")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--backend-only", action="store_true")
    group.add_argument("--frontend-only", action="store_true")
    parser.add_argument("--no-browser", action="store_true", help="don't open the app in a browser")
    parser.add_argument("--yes", "-y", action="store_true", help="answer yes to all prompts")
    args = parser.parse_args()

    run_backend = not args.frontend_only
    run_frontend = not args.backend_only

    banner("Aegis Link · Coordinated Care Platform")
    print("\nChecking your environment…")

    if run_backend and not (ensure_backend_deps(args.yes) and free_port(BACKEND_PORT, "backend", args.yes)):
        return 1
    if run_frontend and not (ensure_frontend_deps(args.yes) and free_port(FRONTEND_PORT, "frontend", args.yes)):
        return 1

    procs: List[tuple[str, subprocess.Popen]] = []

    def shutdown() -> None:
        print("\nShutting down Aegis Link…")
        for name, proc in procs:
            if proc.poll() is None:
                kill_tree(proc.pid)
                info(f"Stopped {name}.")
        print("Goodbye — take care.")

    try:
        if run_backend:
            print(f"\nStarting backend  → {BACKEND_URL}")
            procs.append(("backend", start(
                [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", str(BACKEND_PORT)],
                BACKEND_DIR,
            )))

        if run_frontend:
            print(f"Starting frontend → {FRONTEND_URL}")
            env = dict(os.environ, BROWSER="none", PORT=str(FRONTEND_PORT))  # the launcher opens the browser itself
            npm = "npm.cmd" if IS_WINDOWS else "npm"
            procs.append(("frontend", start([npm, "start"], ROOT_DIR, env)))

        print("\nWaiting for the servers to respond (the first frontend build can take a minute)…")
        ok = True
        if run_backend:
            ok &= wait_until_up(f"{BACKEND_URL}/api/docs", dict(procs)["backend"], "Backend")
        if run_frontend:
            ok &= wait_until_up(FRONTEND_URL, dict(procs)["frontend"], "Frontend")
        if not ok:
            shutdown()
            return 1

        print()
        banner("Aegis Link is running")
        if run_frontend:
            info(f"App:      {FRONTEND_URL}")
        if run_backend:
            info(f"API docs: {BACKEND_URL}/api/docs")
        print("  Press Ctrl+C to stop everything.\n")

        if run_frontend and not args.no_browser:
            webbrowser.open(FRONTEND_URL)

        # Watch both processes; if one dies, stop the other so nothing is left half-running.
        while True:
            for name, proc in procs:
                if proc.poll() is not None:
                    warn(f"The {name} stopped unexpectedly (code {proc.returncode}).")
                    shutdown()
                    return 1
            time.sleep(1)
    except KeyboardInterrupt:
        shutdown()
        return 0


if __name__ == "__main__":
    sys.exit(main())
