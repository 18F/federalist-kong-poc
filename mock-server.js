const http = require('http');

const PORT = process.env.MOCK_PORT || 4000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Hello from localhost:${PORT}!\nYou have reached path: ${req.url || '/'}`);
});

server.listen(PORT);

console.log(`Mock Server listening on port: ${PORT}`);
