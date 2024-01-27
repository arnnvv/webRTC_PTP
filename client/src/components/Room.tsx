import {
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
            roomId,
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
      //ice
      window.pcr = pc;
      pc.ontrack = () => {
        alert("ontrack");
        // console.error("inside ontrack");
        // const {track, type} = e;
        // if (type == 'audio') {
        //     // setRemoteAudioTrack(track);
        //     // @ts-ignore
        //     remoteVideoRef.current.srcObject.addTrack(track)
        // } else {
        //     // setRemoteVideoTrack(track);
        //     // @ts-ignore
        //     remoteVideoRef.current.srcObject.addTrack(track)
        // }
        // //@ts-ignore
        // remoteVideoRef.current.play();
      };

      pc.onicecandidate = async (e) => {
        if (!e.candidate) return;
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };

      socket.emit("answer", {
        roomId,
        sdp: sdp,
      });

      setTimeout(() => {
        const track1 = pc.getTransceivers()[0].receiver.track;
        const track2 = pc.getTransceivers()[1].receiver.track;
        console.log(track1);
        if (track1.kind === "video") {
          setRemoteAudioTrack(track2);
          setRemoteVideoTrack(track1);
        } else {
          setRemoteAudioTrack(track1);
          setRemoteVideoTrack(track2);
        }
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track1);
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track2);
        //@ts-ignore
        remoteVideoRef.current.play();
        // if (type == 'audio') {
        //     // setRemoteAudioTrack(track);
        //     // @ts-ignore
        //     remoteVideoRef.current.srcObject.addTrack(track)
        // } else {
        //     // setRemoteVideoTrack(track);
        //     // @ts-ignore
        //     remoteVideoRef.current.srcObject.addTrack(track)
        // }
        // //@ts-ignore
      }, 5000);
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
