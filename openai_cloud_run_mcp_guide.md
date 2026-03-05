# Connecting OpenAI Agent Builder to Google Cloud Run via MCP

**The Problem: The "No Active Transport" Error**

When attempting to connect OpenAI's Agent Builder (specifically the "Hosted MCP Server" tool) to a Node.js MCP server hosted on Google Cloud Run, you will frequently encounter connection failures and `404` or `400` errors (often citing "No active transport" in the server logs).

**Why this happens:**
1. **Stateful SDK vs. Stateless Infrastructure:** The standard `@modelcontextprotocol/sdk` for Node.js uses `SSEServerTransport`, which is highly stateful. It requires a `GET /sse` request to establish a persistent stream, and then all subsequent `POST` requests must somehow route back to that exact same instance and stream object.
2. **OpenAI's Client Behavior:** OpenAI's client often sends the `GET` and `POST` requests rapidly, sometimes seemingly out of order or from different IP addresses within their IP pool.
3. **Cloud Run Routing:** Google Cloud Run is a serverless environment. By default, it routes requests across multiple instances. Even with Session Affinity enabled, if the `GET` and `POST` come from different IPs (as OpenAI's often do), they will be routed to different instances. The instance receiving the `POST` will reject it because it never saw the initial `GET`.

**The Solution: The Stateless JSON-RPC Handler**

To successfully integrate OpenAI Agent Builder with a Cloud Run-hosted MCP server, you must abandon the stateful `SSEServerTransport` provided by the official Node.js SDK.

Instead, you must write a **Stateless Handler** that directly parses the JSON-RPC payload sent by OpenAI to the `POST` endpoint. 

This approach works reliably because:
- Every `POST` request is fully self-contained.
- It does not matter which Cloud Run instance receives the request.
- It entirely bypasses the race conditions caused by OpenAI's asynchronous connection handshakes.

### Implementation Guide (Express.js Example)

Here is the exact pattern required to make this work, which was successfully implemented in the `jab-sales-tools-mcp` service.

```typescript
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Define your tools according to the MCP specification
const TOOLS = [
  {
    name: "example_tool",
    description: "An example tool",
    inputSchema: {
      type: "object",
      properties: { param: { type: "string" } },
      required: ["param"],
    },
  }
];

// THE STATELESS POST HANDLER (CRITICAL)
app.post("/sse", async (req, res) => {
  const { method, params, id } = req.body;

  try {
    switch (method) {
      case "initialize":
        // 1. Handle Initialization
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "my-stateless-mcp", version: "1.0.0" }
          }
        });

      case "list_tools":
      case "tools/list":
        // 2. Provide the Tool List
        return res.json({
          jsonrpc: "2.0",
          id,
          result: { tools: TOOLS }
        });

      case "call_tool":
      case "tools/call":
        // 3. Execute the Tool
        const { name, arguments: args } = params;
        let toolResult = "";

        if (name === "example_tool") {
            toolResult = `Executed tool with param: ${args.param}`;
        }

        return res.json({
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: toolResult }] }
        });

      default:
        return res.status(404).json({ error: "Method not found" });
    }
  } catch (err: any) {
    return res.status(500).json({ jsonrpc: "2.0", id, error: { message: err.message } });
  }
});

// DUMMY GET HANDLER
// OpenAI still expects to open a stream. We give it one, but we don't care about it.
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write("data: connected

");
});

app.listen(8080, () => console.log("Stateless MCP live."));
```

### Key Takeaways for Deployment
1. **Authentication:** When configuring the connection in OpenAI Agent Builder, set Authentication to **"None"**. The Agent Builder client often strips custom headers (like `x-api-key` or `Authorization`) during the initial `GET` handshake, which will cause the connection to fail if your server strictly requires them on that endpoint. If you must secure it, secure only the `POST` route or use query parameters.
2. **Concurrency:** Because the server is now completely stateless, you can safely scale Cloud Run horizontally with standard concurrency settings (e.g., 80) without worrying about Session Affinity.