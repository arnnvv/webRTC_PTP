import {
  nameAtom,
  socketAtom,
  lobbyAtom,
  sendingPcAtom,
  receivingPcAtom,
  remoteVideoTrackAtom,
  remoteAudioTrackAtom,
  remoteMediaStreamAtom,
} from "../store/atoms";
import { useRecoilState } from "recoil";
import { useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";

const URL: string = "http://localhost:3000";
const Room = () => {
  const name = useRecoilState(nameAtom);
  const [setSocket] = useRecoilState(socketAtom);
  const [setLobby] = useRecoilState(lobbyAtom);
  const [sendingPc, setSendingPc] = useRecoilState(sendingPcAtom);
  const [receivingPc, setReceivingPc] = useRecoilState(receivingPcAtom);
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useRecoilState(remoteVideoTrackAtom);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useRecoilState(remoteAudioTrackAtom);
  const [remoteMediaStream, setRemoteMediaStream] = useRecoilState(
    remoteMediaStreamAtom,
  );
  const remoteVideoRef = useRef<HTMLVideoElement>();
  const localVideoRef = useRef<HTMLVideoElement>();
  useEffect(() => {
    const socket: Socket = io(URL);
    socket.on("send-offer", async ({ roomId }) => {
      alert(`Send Offer Plz`);
      setLobby(false);
      const pc = new RTCPeerConnection();
      setSendingPc(pc);
      socket.emit("offer", {
        sdp: "",
        roomId,
      });
    });

    socket.on("offer", ({ roomId, offer }) => {
      alert(`Send Answer Plz`);
      socket.emit("answer", {
        roomId,
        sdp: "",
      });
    });

    socket.on("answer", ({ roomId, answer }) => {
      alert(`Connected`);
    });

    socket.on("lobby", () => {
      setLobby(true);
    });
    setSocket(socket);
  }, [name]);
  return <>Hi {name}</>;
};

export default Room;
