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
const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) => {
  const name = useRecoilState(nameAtom);
  const [setSocket] = useRecoilState(socketAtom);
  const [lobby, setLobby] = useRecoilState(lobbyAtom);
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
      setLobby(false);
      const pc = new RTCPeerConnection();
      setSendingPc(pc);
      const sdp = await pc.createOffer();
      socket.emit("offer", {
        sdp,
        roomId,
      });
    });

    socket.on("offer", async ({ roomId, offer }) => {
      setLobby(false);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription({ sdp: offer, type: "offer" });
      const sdp = await pc.createAnswer();
      setReceivingPc(pc);
      pc.ontrack = ({ track, type }) => {
        if (type === "video") {
          setRemoteVideoTrack(track);
        } else if (type === "audio") {
          setRemoteAudioTrack(track);
        }
      };
      socket.emit("answer", {
        roomId,
        sdp,
      });
    });

    socket.on("answer", ({ roomId, answer }) => {
      setLobby(false);
      setSendingPc((pc) => {
        pc?.setRemoteDescription({
          type: "answer",
          sdp: answer,
        });
        return pc;
      });
    });

    socket.on("lobby", () => {
      setLobby(true);
    });
    setSocket(socket);
  }, [name]);
  if (lobby) {
    return <div>Waiting for others to join</div>;
  }
  return (
    <div>
      Hi {name}
      <video width={400} height={400} />
      <video width={400} height={400} />
    </div>
  );
};

export default Room;
