"""GitPulse MCP Server CLI Runner.

Usage:
    python backend/run_mcp.py [--transport stdio|sse|streamable-http]
"""

import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.mcp.server import run_mcp_server

if __name__ == "__main__":
    transport = "stdio"
    if len(sys.argv) > 1 and sys.argv[1].startswith("--transport="):
        transport = sys.argv[1].split("=")[1]
    elif len(sys.argv) > 2 and sys.argv[1] == "--transport":
        transport = sys.argv[2]
        
    run_mcp_server(transport=transport)
