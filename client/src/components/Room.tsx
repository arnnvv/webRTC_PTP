import { nameAtom } from "../store/atoms";
import { useRecoilValue } from "recoil";
const Room = () => {
  const name = useRecoilValue(nameAtom);
  return <>Hi {name}</>;
};

export default Room;
