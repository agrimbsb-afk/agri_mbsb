const http = require("http");

const server = http.createServer((req, res) => {
    res.end("OK");
});

server.listen(3001, () => {
    console.log("HTTP Listening");
});