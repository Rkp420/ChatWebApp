import "./AddNew.css";
import { TiPlus } from "react-icons/ti";

import { useModel } from "../../provider/ModelProvider";

export default function AddNew({ model }) {
  const { openModel } = useModel();
  return (
    <button
      type="button"
      className="add-button"
      onClick={() => openModel(model)}
    >
      <i className="add">
        <TiPlus />
      </i>
    </button>
  );
}
