import "./DashBoard.css";
import "react-image-crop/dist/ReactCrop.css";

import MiddlePart from "../../components/middlePart/MiddlePart";
import { useModel } from "../../provider/ModelProvider";
import LeftSideBar from "../../components/leftsidebar/LeftSideBar";
import MessageBox from "../../components/messageBox/MessageBox";

export default function Dashboard() {
  const { currentModel, closModel } = useModel(); // Ensure ModelProvider wraps this component
  return (
    <div className="mainContentContainer">
      {currentModel && (
        <div className="modal" onClick={closModel}>
          {currentModel}
        </div>
      )}
      <LeftSideBar />
      <MiddlePart />
      <MessageBox />
      <div className="rightSideBar">RightSideBar</div>
    </div>
  );
}
