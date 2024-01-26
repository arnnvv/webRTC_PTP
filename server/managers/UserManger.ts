import { Socket } from "socket.io";

export interface User {
  socket: Socket;
  name: string;
}

export class UserManager {
  private users: User[] = [];
  private queue: string[] = [];

  addUser(name: string, socket: Socket) {
    this.users.push({ name, socket });
    this.queue.push(socket.id);
    this.clearQueue();
  }

  removeUser(socketId: string) {
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
  }
}
