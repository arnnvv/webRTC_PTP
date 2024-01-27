import { lazy, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import {
  nameAtom,
  joinedLobbyAtom,
  localAudioTrackAtom,
  localVideoTrackAtom,
} from "../store/atoms";
import { useNavigate } from "react-router-dom";
const Room = lazy(() => import("./Room.tsx"));

const Landing = () => {
  const [name, setName] = useRecoilState(nameAtom);
  const [joinedLobby, setJoinedLobby] = useRecoilState(joinedLobbyAtom);
  const [localAudioTrack, setLocalAudioTrack] =
    useRecoilState(localAudioTrackAtom);
  const [localVideoTrack, setLocalVideoTrack] =
    useRecoilState(localVideoTrackAtom);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);
    if (!videoRef.current) return;
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
  };
  useEffect(() => {
    if (videoRef && videoRef.current) getCam();
  }, [videoRef]);
  if (!joinedLobby)
    return (
      <div>
        <video autoPlay ref={videoRef}></video>
        <input
          type="text"
          onChange={(e) => {
            setName(e.target.value);
          }}
        ></input>
        <button
          onClick={() => {
            setJoinedLobby(true);
          }}
        >
          Join
        </button>
      </div>
    );
  return (
    <Room
      name={name}
      localAudioTrack={localAudioTrack}
      localVideoTrack={localVideoTrack}
    />
  );
};

export default Landing;
