const http = require('http');

const data = JSON.stringify({
  jsonrpc: "2.0",
  id: "test-id-123",
  method: "call_tool",
  params: {
    name: "create_lead",
    arguments: {
      fullName: "Test Lead User",
      email: "test_lead_user@example.com",
      phone: "+15551234567",
      preferredChannel: "sms"
    }
  }
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/sse',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();