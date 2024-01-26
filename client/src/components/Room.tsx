import { nameAtom, socketAtom } from "../store/atoms";
import { useRecoilState } from "recoil";
import { useEffect } from "react";
import { Socket, io } from "socket.io-client";

const URL: string = "http://localhost:3000";
const Room = () => {
  const name = useRecoilState(nameAtom);
  const [socket, setSocket] = useRecoilState(socketAtom);
  useEffect(() => {
    const socket = io(URL, {
      autoConnect: false,
    });
    socket.on("send-offer", () => {
      alert(`Send Offer Plz`);
    });
    setSocket(socket);
  }, [name, setSocket]);
  return <>Hi {name}</>;
};

export default Room;
