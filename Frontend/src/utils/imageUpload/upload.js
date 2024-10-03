import axios from "axios";
import toast from "react-hot-toast";

export const prepareImageFileAndUpload = async (
  canvas,
  type,
  group,
  user,
  setUser,
  setGroup,
  setLoading,
  setImgSrc
) => {
  setLoading(true);
  try {
    // Convert canvas to Blob and then to a File
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const blob = await fetch(dataUrl).then((res) => res.blob());
    const fileType = "image/jpeg"; // This can be made dynamic if needed
    const fileExtension = fileType.split("/")[1];
    const file = new File([blob], `image.${fileExtension}`, { type: fileType });

    // Create FormData object
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user._id);
    formData.append("type", type);
    if (group) {
      formData.append("groupId", group._id);
    }

    // Make the request
    const res = await axios.post("/api/upload", formData);

    // Update user state or Group state
    if (type === "user")
      setUser((prev) => ({ ...prev, profile: res.data.url }));
    if (type === "group") setGroup({ ...group, profile: res.data.url });
    // Success toast notification
    toast.success("Image uploaded successfully");
    setImgSrc("");
  } catch (error) {
    console.error("Error uploading image:", error);

    // Display specific server-side error if available
    toast.error(error.response?.data?.error || "Failed to upload image");
  } finally {
    setLoading(false);
  }
};
