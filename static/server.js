"use strict";

import http from 'http';
import { storeHandler } from "./routes/getDate.js";
import { searchHandler } from "./routes/writeFile.js";

const HOST = "127.0.0.1";
const PORT = parseInt(process.env.PORT || "3003}, 10");

function send(res, status, content, type = "text/html") {
    res.writeHead(status, { "Content-Type": type });
    res.end(content);
};

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const { pathname } = url;

        if (pathname === "/" || pathname === "/store/") {
            return storeHandler(url, res);
        }

        if (pathname === "/search/") {
            return searchHandler(url, res);
        }

        return send(res, 404, "404 Not Found", "text/plain");

    } catch (err) {
        console.error(err);
        return send(res, 500, "500 Internal Server Error", "text/plain");
    }
});

server.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}/`);
});