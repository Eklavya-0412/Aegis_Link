"""
Aegis Link Master Launcher
Launches FastAPI backend and React frontend concurrently with graceful shutdown on Ctrl+C.
"""

import os
import subprocess
import sys
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")

    print("=" * 60)
    print(" Aegis Link Healthcare Platform Launcher")
    print("=" * 60)
    print("\n[1/2] Starting FastAPI Backend (http://localhost:8000)...")
    
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"],
        cwd=backend_dir
    )

    print("[2/2] Starting React Frontend (http://localhost:3000)...")
    frontend_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [frontend_cmd, "start"],
        cwd=root_dir
    )

    print("\n" + "=" * 60)
    print(" Both services are up and running!")
    print("   - Frontend App: http://localhost:3000")
    print("   - Backend API Docs: http://localhost:8000/api/docs")
    print(" Press Ctrl+C at any time to shut down both servers.")
    print("=" * 60 + "\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down Aegis Link servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Shutdown complete.")

if __name__ == "__main__":
    main()
