import { useRecoilState } from "recoil";
import { nameAtom } from "../store/atoms";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [name, setName] = useRecoilState(nameAtom);
  const navigate = useNavigate();
  return (
    <div>
      <input type="text" onChange={(e) => setName(e.target.value)} />
      <button onClick={() => navigate(`/room?name=${name}`)}> Join </button>
    </div>
  );
};

export default Landing;
