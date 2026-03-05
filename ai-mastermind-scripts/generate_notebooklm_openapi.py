import asyncio
import json
import inspect
from notebooklm_tools.mcp.server import mcp

def python_type_to_json_schema(annotation):
    # Handle typing.Optional, typing.List, etc if needed
    # For simplicity, map basic types
    if annotation == str:
        return {"type": "string"}
    elif annotation == int:
        return {"type": "integer"}
    elif annotation == float:
        return {"type": "number"}
    elif annotation == bool:
        return {"type": "boolean"}
    else:
        # Default fallback or check for Union/Optional
        s_type = str(annotation)
        if "int" in s_type: return {"type": "integer"}
        if "float" in s_type: return {"type": "number"}
        if "bool" in s_type: return {"type": "boolean"}
        return {"type": "string"}

async def generate_openapi():
    tools = await mcp.get_tools()
    paths = {}
    
    for name, tool in tools.items():
        path = f"/{name}"
        
        # Get parameters from function signature
        sig = inspect.signature(tool.fn)
        properties = {}
        required = []
        
        for param_name, param in sig.parameters.items():
            if param_name in ["ctx", "self"]: continue
            
            schema = python_type_to_json_schema(param.annotation)
            properties[param_name] = schema
            
            if param.default == inspect.Parameter.empty:
                required.append(param_name)
                
        # Construct OpenAPI operation
        paths[path] = {
            "post": {
                "operationId": name,
                "summary": tool.description.split('\n')[0] if tool.description else name,
                "description": tool.description or "",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": properties,
                                "required": required
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "content": {
                            "application/json": {
                                "schema": {"type": "object"}
                            }
                        }
                    }
                }
            }
        }

    openapi_spec = {
        "openapi": "3.1.0",
        "info": {
            "title": "NotebookLM MCP API",
            "description": "API for interacting with Google NotebookLM via MCP. Generated for OpenAI Agent Builder.",
            "version": "1.0.0"
        },
        "servers": [
            {"url": "https://<YOUR_PUBLIC_URL>"} 
        ],
        "paths": paths
    }
    
    return json.dumps(openapi_spec, indent=2)

if __name__ == "__main__":
    print(asyncio.run(generate_openapi()))
