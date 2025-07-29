import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImageUtils";
import { Trash2, Download, UploadCloud, Eye } from "lucide-react";

export default function ImageCropper() {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef();

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setCroppedImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (!croppedAreaPixels) return;
      setLoading(true);
      const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImg);
    } catch (e) {
      console.error(e);
      alert("Gagal memproses gambar.");
    } finally {
      setLoading(false);
    }
  }, [imageSrc, croppedAreaPixels]);

  const clearAll = () => {
    setImageSrc(null);
    setCroppedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (inputRef.current) inputRef.current.value = null;
  };

  const previewCroppedImage = () => {
    if (!croppedImage) return;
    window.open(croppedImage, "_blank");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Image Cropper</h1>
          <p className="text-gray-400 max-w-xl">
            Crop your images easily with real-time preview and download feature.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-900/30 px-4 py-2 rounded-lg border border-green-500/30">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">
            Easy & Fast
          </span>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-700 p-8">
        <label
          htmlFor="imageCropInput"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-800/50 hover:border-blue-500 hover:bg-gray-800 transition-all duration-300 group"
        >
          <input
            type="file"
            id="imageCropInput"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            ref={inputRef}
          />
          <div className="text-center">
            <UploadCloud
              className="text-blue-400 mb-4 group-hover:scale-110 transition-transform"
              size={48}
            />
            <p className="text-white font-semibold mb-2">Upload an image</p>
            <p className="text-gray-400 text-sm">Supports JPG, PNG, WebP</p>
          </div>
        </label>

        {imageSrc && (
          <>
            <div className="relative w-full h-96 mt-8 rounded-lg overflow-hidden border border-gray-700 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
              />
            </div>

            <div className="flex items-center gap-6 mt-6">
              <label className="flex items-center gap-3 text-white select-none">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-48 accent-blue-600 cursor-pointer"
                />
              </label>

              <button
                onClick={showCroppedImage}
                disabled={loading}
                className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye size={18} />
                    Crop & Preview
                  </>
                )}
              </button>

              <button
                onClick={clearAll}
                className="flex items-center gap-2 bg-red-900/30 px-6 py-3 rounded-lg text-red-400 hover:text-red-300 transition font-semibold"
              >
                <Trash2 size={18} />
                Clear
              </button>
            </div>

            {croppedImage && (
              <div className="mt-8 text-center">
                <h3 className="text-white font-semibold mb-2">
                  Cropped Image Preview
                </h3>
                <img
                  src={croppedImage}
                  alt="Cropped"
                  className="mx-auto rounded-lg shadow-lg max-w-full max-h-96 border border-gray-700"
                />
                <div className="mt-4">
                  <a
                    href={croppedImage}
                    download="cropped-image.png"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-semibold transition"
                  >
                    <Download size={18} />
                    Download Cropped Image
                  </a>
                  <button
                    onClick={previewCroppedImage}
                    className="ml-4 inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg text-white font-semibold transition"
                  >
                    <Eye size={18} />
                    Preview Full Image
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.readAsDataURL(file);
  });
}
