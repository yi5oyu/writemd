import uvicorn
from starlette.applications import Starlette
from starlette.routing import Mount

from mcp_tools import mcp

# uv venv
# .venv\Scripts\activate
# uv run server.py

def start_server(host="0.0.0.0", port=9889):
    """MCP 서버를 시작합니다."""
    app = Starlette(
        routes=[
            Mount('/', app=mcp.sse_app()),
        ]
    )
    
    print(f"MCP 서버를 {host}:{port} 에서 SSE 모드로 실행합니다.")
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    start_server()