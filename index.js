const { wisp } = require('@mercuryworkshop/wisp-server-node');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Starlight Wisp Server is online!');
});

server.on('upgrade', (request, socket, head) => {
    wisp(request, socket, head);
});

// Render assigns a dynamic port using process.env.PORT
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Wisp server running on port ${PORT}`);
});
