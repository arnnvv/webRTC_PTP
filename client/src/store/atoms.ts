import { atom } from "recoil";
import { Socket } from "socket.io-client";

export const nameAtom = atom({
  key: "nameAtom",
  default: "",
});

export const socketAtom = atom<Socket | null>({
  key: "socketAtom",
  default: null,
});
