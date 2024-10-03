import toast from "react-hot-toast";

const MAX_IMAGE_SIZE = 1024 * 5;
const MIN_DIMENSION = 150;

export const validateImage = (file) => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_IMAGE_SIZE * 1024) {
      toast.error("Image size exceeds maximum limit");
      return reject("Size exceeded");
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageElement = new Image();
      imageElement.src = reader.result;

      imageElement.addEventListener("load", () => {
        const { naturalWidth, naturalHeight } = imageElement;
        if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
          toast.error("Image must be at least 150 x 150 pixels.");
          return reject("Dimension too small");
        }
        resolve(reader.result);
      });
    });
    reader.readAsDataURL(file);
  });
};
