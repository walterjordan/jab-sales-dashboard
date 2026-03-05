import os
import asyncio
import inspect
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
from notebooklm_tools.mcp.server import mcp
import uvicorn
import json

app = FastAPI(title="NotebookLM MCP Bridge")

# Global tools registry
tools = {}

@app.on_event("startup")
async def startup_event():
    global tools
    print("Starting up NotebookLM MCP Bridge...")
    try:
        if hasattr(mcp, "get_tools"):
            res = mcp.get_tools()
            tools = await res if inspect.isawaitable(res) else res
        elif hasattr(mcp, "list_tools"):
            res = mcp.list_tools()
            tools_list = await res if inspect.isawaitable(res) else res
            tools = {t.name: t for t in tools_list} if isinstance(tools_list, list) else tools_list
        elif hasattr(mcp, "_list_tools"):
            res = mcp._list_tools()
            tools_list = await res if inspect.isawaitable(res) else res
            tools = {t.name: t for t in tools_list} if isinstance(tools_list, list) else tools_list
            
        if isinstance(tools, list):
            tools = {t.name: t for t in tools}
            
    except Exception as e:
        print(f"Error loading tools: {e}")
        
    print(f"Loaded {len(tools)} tools")

# GET /sse just returns a dummy stream to satisfy the initial handshake
@app.get("/sse")
async def sse_handshake():
    def event_stream():
        yield "data: connected\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")

# Stateless MCP Handler (for OpenAI Hosted MCP)
# MUST BE BEFORE /{tool_name} to avoid matching as a tool named 'sse'
@app.post("/sse")
async def mcp_handler(request: Request):
    data = await request.json()
    method = data.get("method")
    id = data.get("id")
    params = data.get("params", {})
    
    print(f"[MCP] Method: {method}")
    
    try:
        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "notebooklm-mcp", "version": "1.0.0"}
                }
            }
        
        if method in ["list_tools", "tools/list"]:
            if not tools: await startup_event()
            tools_mcp = []
            for name, tool in tools.items():
                schema = {}
                if hasattr(tool, "input_model"):
                    schema = tool.input_model.schema()
                elif hasattr(tool, "parameters"):
                    schema = tool.parameters
                
                tools_mcp.append({
                    "name": name,
                    "description": getattr(tool, "description", ""),
                    "inputSchema": schema
                })
            return {
                "jsonrpc": "2.0",
                "id": id,
                "result": {"tools": tools_mcp}
            }
            
        if method in ["call_tool", "tools/call"]:
            tool_name = params.get("name")
            args = params.get("arguments", {})
            if tool_name not in tools:
                return {"jsonrpc": "2.0", "id": id, "error": {"code": -32601, "message": f"Tool {tool_name} not found"}}
            
            tool = tools[tool_name]
            fn = getattr(tool, "fn", tool)
            result = await fn(**args) if inspect.iscoroutinefunction(fn) else fn(**args)
            
            return {
                "jsonrpc": "2.0",
                "id": id,
                "result": {
                    "content": [{"type": "text", "text": str(result)}]
                }
            }
            
    except Exception as e:
        return {"jsonrpc": "2.0", "id": id, "error": {"code": -32603, "message": str(e)}}

    return {"jsonrpc": "2.0", "id": id, "error": {"code": -32601, "message": "Method not found"}}

# Standard Tool Endpoints (for OpenAI Actions)
@app.post("/{tool_name}")
async def call_tool_http(tool_name: str, request: Request):
    if tool_name not in tools:
        if not tools: await startup_event()
        if tool_name not in tools:
            raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
    
    arguments = await request.json()
    try:
        tool = tools[tool_name]
        fn = getattr(tool, "fn", tool)
        result = await fn(**arguments) if inspect.iscoroutinefunction(fn) else fn(**arguments)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy", "tools_loaded": len(tools)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
