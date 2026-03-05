import asyncio
from notebooklm_tools.mcp.server import mcp
import inspect

async def main():
    tools = await mcp.get_tools()
    first_tool = list(tools.values())[0]
    print(f"Tool object dir: {dir(first_tool)}")
    if hasattr(first_tool, 'fn'):
        print(f"Function signature: {inspect.signature(first_tool.fn)}")

if __name__ == "__main__":
    asyncio.run(main())
