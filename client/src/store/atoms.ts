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

export const lobbyAtom = atom({
  key: "lobbyAtom",
  default: true,
});

export const sendingPcAtom = atom<null | RTCPeerConnection>({
  key: "sendingPcAtom",
  default: null,
});

export const receivingPcAtom = atom<null | RTCPeerConnection>({
  key: "receivingPcAtom",
  default: null,
});

export const remoteVideoTrackAtom = atom<MediaStreamTrack | null>({
  key: "remoteVideoTrackAtom",
  default: null,
});

export const remoteAudioTrackAtom = atom<MediaStreamTrack | null>({
  key: "remoteAudioTrackAtom",
  default: null,
});

export const remoteMediaStreamAtom = atom<MediaStream | null>({
  key: "remoteMediaStreamAtom",
  default: null,
});

export const joinedLobbyAtom = atom({
  key: "joinedLobbyAtom",
  default: false,
});
