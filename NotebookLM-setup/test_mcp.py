import asyncio
from notebooklm_tools.mcp.server import mcp

async def test():
    try:
        tools = await mcp.get_tools()
        print(f"Tools: {list(tools.keys())}")
    except AttributeError as e:
        print(f"Error: {e}")
        print(f"Available methods: {[m for m in dir(mcp) if not m.startswith('__')]}")

if __name__ == "__main__":
    asyncio.run(test())
