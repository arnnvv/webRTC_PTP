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
      if (localAudioTrack) pc.addTrack(localAudioTrack);
      if (localVideoTrack) pc.addTrack(localVideoTrack);
      pc.onicecandidate = async (e) => {
        if (e.candidate)
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
          });
      };

      pc.onnegotiationneeded = async () => {
        const sdp = await pc.createOffer();
        pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(remoteSdp);
      const sdp = await pc.createAnswer();
      pc.setLocalDescription(sdp);
      const stream = new MediaStream();
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      setRemoteMediaStream(stream);

      setReceivingPc(pc);
      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
          });
        }
      };

      pc.ontrack = ({ track, type }) => {
        if (type === "video") {
          remoteVideoRef.current?.srcObject?.addTrack(track);
        } else if (type === "audio") {
          remoteVideoRef.current?.srcObject?.addTrack(track);
        }
        remoteVideoRef.current?.play();
      };
      socket.emit("answer", {
        roomId,
        sdp: sdp,
      });
    });

    socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      setSendingPc((pc) => {
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      });
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      console.log("add ice candidate from remote");
      console.log({ candidate, type });
      if (type == "sender") {
        setReceivingPc((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setReceivingPc((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });

    setSocket(socket);
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
        localVideoRef.current.play();
      }
    }
  }, [localVideoRef]);

  return (
    <div>
      Hi {name}
      <video autoPlay width={400} height={400} ref={localVideoRef} />
      {lobby ? "Waiting to connect you to someone" : null}
      <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
  );
};

export default Room;
