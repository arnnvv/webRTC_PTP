import { Server, Socket } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(http);
const port: number = 3000;

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
