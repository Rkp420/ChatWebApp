import "./CloseModel.css";
import { useModel } from "../../provider/ModelProvider";
import { IoMdCloseCircle } from "react-icons/io";
export default function CloseModel() {
  const { closeModel } = useModel();
  return (
    <button type="button" className="closeButton" onClick={closeModel}>
      <i className="close">
        <IoMdCloseCircle />
      </i>
    </button>
  );
}
