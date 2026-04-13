import os
import uvicorn
from fastapi import FastAPI, Request
from mcp_tools import mcp

app = FastAPI(title="Writemd MCP Server")

# middleware: 모든 HTTP 요청 필터링
@app.middleware("http")
async def bypass_host_validation(request: Request, call_next):
    # 헤더 덮어쓰기
    request.scope["headers"] = [
        (b"host", b"localhost:9889") if key.lower() == b"host" else (key, val)
        for key, val in request.scope["headers"]
    ]
    return await call_next(request)

app.mount("/", mcp.sse_app())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9889, proxy_headers=True)