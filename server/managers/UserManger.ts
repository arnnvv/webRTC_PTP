import { Socket } from "socket.io";
import RoomManager from "./RoomManager.ts";

export interface User {
  socket: Socket;
  name: string;
}

class UserManager {
  private users: User[] = [];
  private queue: string[] = [];
  private roomManager: RoomManager = new RoomManager();

  addUser(name: string, socket: Socket) {
    this.users.push({ name, socket });
    this.queue.push(socket.id);
    socket.emit("lobby");
    this.clearQueue();
    this.initHandlers(socket);
  }

  removeUser(socketId: string) {
    const user = this.users.find((x) => x.socket.id === socketId);

    this.users = this.users.filter((user) => user.socket.id !== socketId);
    this.queue = this.queue.filter((id) => id === socketId);
  }

  clearQueue() {
    if (this.queue.length < 2) return;
    const user1 = this.users.find(
      (user) => user.socket.id === this.queue.pop(),
    );
    const user2 = this.users.find(
      (user) => user.socket.id === this.queue.pop(),
    );
    if (!user1 || !user2) return;

    this.roomManager.createRoom(user1, user2);
    this.clearQueue();
  }

  initHandlers(socket: Socket) {
    socket.on("offer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.roomManager.onOffer(roomId, sdp, socket.id);
    });
    socket.on("answer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.roomManager.onAnswer(roomId, sdp, socket.id);
    });
    socket.on(
      "add-ice-candidate",
      ({
        candidate,
        roomId,
        type,
      }: {
        candidate: any;
        roomId: string;
        type: "sender" | "receiver";
      }) => {
        this.roomManager.onIceCandidate(roomId, candidate, socket.id, type);
      },
    );
  }
}

export default UserManager;
