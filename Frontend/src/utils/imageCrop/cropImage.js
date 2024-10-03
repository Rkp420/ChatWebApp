import { centerCrop, makeAspectCrop } from "react-image-crop";

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

export const handleCrop = (imageElement, setCrop) => {
  const { width, height } = imageElement;
  const cropWidthInPercent = (MIN_DIMENSION / width) * 100;
  const crop = makeAspectCrop(
    { unit: "%", width: cropWidthInPercent },
    ASPECT_RATIO,
    width,
    height
  );
  const centeredCrop = centerCrop(crop, width, height);
  setCrop(centeredCrop);
};
