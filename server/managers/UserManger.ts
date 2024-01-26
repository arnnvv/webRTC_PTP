import { Socket } from "socket.io";
import { RoomMAnager } from "./RoomManager.ts";
let GLOBAL_ROOM_ID: number = 1;

export interface User {
  socket: Socket;
  name: string;
}

export class UserManager {
  private users: User[] = [];
  private queue: string[] = [];
  private RoomManager: RoomMAnager = new RoomMAnager();

  addUser(name: string, socket: Socket) {
    this.users.push({ name, socket });
    this.queue.push(socket.id);
    this.clearQueue();
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

    const room = this.RoomManager.createRoom(user1, user2);
    this.clearQueue();
  }

  initHandlers(socket: Socket) {
    socket.on("offer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.RoomManager.onOffer(roomId, sdp, socket.id);
    });
    socket.on("answer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.RoomManager.onAnswer(roomId, sdp, socket.id);
    });
  }
}
