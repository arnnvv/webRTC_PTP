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

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
