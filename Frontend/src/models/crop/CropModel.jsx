
export default function CropModel() {
  
  /** Cropping Image Related All Stuff */
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState();

  useEffect(() => {
    if (imgSrc) setImgSrc(imgSrc);
  }, [imgSrc]);

  return;
  <>
    {imgSrc && (
      <div className="land">
        <div className="mainEditContainer">
          <button
            type="button"
            className="closeButton"
            onClick={() => setImgSrc("")}
          >
            <i className="close">
              <IoMdCloseCircle />
            </i>
          </button>
          <div className="imageCropper">
            <ReactCrop
              crop={crop}
              onChange={(percentCrop) => setCrop(percentCrop)}
              circularCrop
              keepSelection
              aspect={ASPECT_RATIO}
              minWidth={MIN_DIMENSION}
            >
              <img
                src={imgSrc}
                ref={imgRef}
                style={{ maxHeight: "60vh" }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
            <button
              className="cropImageButton"
              onClick={() => {
                setCanvasPreview(
                  imgRef.current,
                  previewCanvasRef.current,
                  convertToPixelCrop(
                    crop,
                    imgRef.current.width,
                    imgRef.current.height
                  )
                );
                handleNewProfile();
                setImgSrc("");
              }}
            >
              Crop Image
            </button>
            {crop && (
              <canvas
                ref={previewCanvasRef}
                className="mt-4"
                style={{
                  display: "none",
                  border: "1px solid black",
                  objectFit: "contain",
                  width: 150,
                  height: 150,
                }}
              />
            )}
          </div>
        </div>
      </div>
    )}
  </>;
}
