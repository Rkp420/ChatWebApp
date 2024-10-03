import { createContext, useContext, useMemo, useState } from "react";
import AddFriend from "../models/addFriend/AddFriend";
import AreYouSure from "../models/areYouSure/AreYouSure";
import CreateGroup from "../models/createGroup/CreateGroup";
import CropModel from "../models/crop/CropModel";
import SeeDpModel from "../models/seeDp/SeeDpModel";
import ProfileViewModel from "../models/profileViewModel/ProfileViewModel";

const ModelContext = createContext();

export const ModelProvider = ({ children }) => {
  const [currentModel, setCurrentModel] = useState(null);
  const openModel = (modelName) => {
    switch (modelName) {
      case "AddFriend":
        setCurrentModel(<AddFriend />);
        break;
      case "AreYouSure":
        setCurrentModel(<AreYouSure />);
        break;
      case "CreateGroup":
        setCurrentModel(<CreateGroup />);
        break;
      case "CropModel":
        setCurrentModel(<CropModel />);
        break;
      case "SeeDp":
        setCurrentModel(<SeeDpModel />);
        break;
      case "ProfileViewModel":
        setCurrentModel(<ProfileViewModel />);
        break;
      default:
        setCurrentModel(null);
        break;
    }
  };
  const closeModel = () => {
    setCurrentModel(null);
  };
  const contextValue = useMemo(
    () => ({
      openModel,
      closeModel,
      currentModel,
      setCurrentModel,
    }),
    [currentModel]
  );
  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  return useContext(ModelContext);
};
