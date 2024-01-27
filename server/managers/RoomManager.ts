import { User } from "./UserManger.ts";
let GLOBAL_ROOM_ID: number = 1;

interface Room {
  user1: User;
  user2: User;
}
class RoomManager {
  private rooms: Map<string, Room> = new Map<string, Room>();
  createRoom(user1: User, user2: User) {
    const roomId = this.generate().toString();
    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    });
    user1.socket.emit("send-offer", {
      roomId,
    });

    user2.socket.emit("send-offer", {
      roomId,
    });
  }

  onOffer(roomId: string, sdp: string, senderSocketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    receivingUser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  onAnswer(roomId: string, sdp: string, senderSocketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const receivingUser =
      senderSocketId === room.user1.socket.id ? room.user2 : room.user1;
    receivingUser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }

  onIceCandidate(
    roomId: string,
    candidate: any,
    senderSocketId: string,
    type: "sender" | "receiver",
  ) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    receivingUser?.socket.emit("add-ice-candidate", { candidate, type });
  }

  generate() {
    return GLOBAL_ROOM_ID++;
  }
}

export default RoomManager;
