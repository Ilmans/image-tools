import { useState, useRef, useEffect } from "react";
import { Trash, UploadCloud } from "lucide-react";

export default function ImageBgEditor() {
  const [imageFile, setImageFile] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bgColor, setBgColor] = useState("transparent");
  const [bgType, setBgType] = useState("color");
  const [bgImageFile, setBgImageFile] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const inputImageRef = useRef();
  const inputBgImageRef = useRef();
  const canvasRef = useRef();

  const REMOVE_BG_API_KEY = "aknnfZEsdkpi8y643iskb7XC";

  // Toast helper
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    setResultUrl(null);
  };

  const handleBgImageChange = (e) => {
    setBgImageFile(e.target.files[0]);
    setBgType("image");
  };

  const resetAll = () => {
    setImageFile(null);
    setResultUrl(null);
    setBgImageFile(null);
    setBgType("color");
    setBgColor("transparent");
  };

  const removeBgFromImage = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image_file", file);
      formData.append("size", "auto");

      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.errors?.[0]?.title || "Remove.bg API error");
      }

      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      showToast(
        "Terjadi kesalahan, sepertinya gambar tidak memiliki foreground"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const composeImage = async (fgUrl, bgType, bgValue) => {
    if (!fgUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const fgImg = new Image();
    fgImg.crossOrigin = "anonymous";

    fgImg.onload = () => {
      canvas.width = fgImg.width;
      canvas.height = fgImg.height;

      if (bgType === "color") {
        if (bgValue === "transparent") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = bgValue;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else if (bgType === "image" && bgImageFile) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);
          setResultUrl(canvas.toDataURL("image/png"));
        };
        bgImg.src = URL.createObjectURL(bgImageFile);
        return;
      }

      ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);
      setResultUrl(canvas.toDataURL("image/png"));
    };

    fgImg.src = fgUrl;
  };

  useEffect(() => {
    if (!imageFile) return;

    (async () => {
      const fgUrl = await removeBgFromImage(imageFile);
      if (fgUrl) {
        await composeImage(fgUrl, bgType, bgColor);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile, bgType, bgColor, bgImageFile]);

  return (
    <>
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          Remove Background & Change Background
        </h1>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Upload Main Image */}
          <div className="flex-1 flex flex-col space-y-2 max-h-[320px]">
            <label
              htmlFor="upload-main-image"
              className="flex items-center justify-center cursor-pointer rounded-lg border-2 border-dashed border-gray-600 bg-gray-800 h-40 text-gray-500 hover:border-blue-500 hover:text-blue-400 transition"
            >
              {imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="uploaded"
                  className="object-contain max-h-full"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={40} />
                  <span className="mt-1 text-sm">Upload Image</span>
                </div>
              )}
              <input
                type="file"
                id="upload-main-image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                ref={inputImageRef}
              />
            </label>
            {imageFile && (
              <button
                className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm"
                onClick={resetAll}
              >
                <Trash size={16} /> Reset
              </button>
            )}
          </div>

          {/* Background Settings */}
          <div className="flex-1 space-y-3 max-h-[320px] overflow-auto">
            <div>
              <h2 className="text-white font-semibold mb-1 text-sm">
                Background Type
              </h2>
              <div className="flex gap-3">
                <button
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    bgType === "color"
                      ? "border-blue-500 bg-blue-600"
                      : "border-gray-600"
                  }`}
                  onClick={() => setBgType("color")}
                >
                  Solid Color
                </button>
                <button
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    bgType === "image"
                      ? "border-blue-500 bg-blue-600"
                      : "border-gray-600"
                  }`}
                  onClick={() => {
                    setBgType("image");
                    if (!bgImageFile) inputBgImageRef.current?.click();
                  }}
                >
                  Upload Background
                </button>
              </div>
            </div>

            {bgType === "color" && (
              <div>
                <label className="text-white font-semibold mb-1 block text-sm">
                  Pick Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor === "transparent" ? "#000000" : bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer border border-gray-600"
                    disabled={bgColor === "transparent"}
                  />
                  <button
                    onClick={() => setBgColor("transparent")}
                    className="px-2 py-1 rounded bg-gray-700 text-white text-xs"
                    title="Set Transparent Background"
                  >
                    Transparent
                  </button>
                  {bgColor === "transparent" && (
                    <button
                      onClick={() => setBgColor("#000000")}
                      className="px-2 py-1 rounded bg-gray-700 text-white text-xs"
                      title="Reset Color"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {bgType === "image" && (
              <div>
                <label
                  htmlFor="upload-bg-image"
                  className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-blue-400 text-sm"
                >
                  <UploadCloud size={16} />
                  <span>
                    {bgImageFile ? bgImageFile.name : "Upload Background Image"}
                  </span>
                </label>
                <input
                  type="file"
                  id="upload-bg-image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBgImageChange}
                  ref={inputBgImageRef}
                />
                {bgImageFile && (
                  <>
                    <img
                      src={URL.createObjectURL(bgImageFile)}
                      alt="bg preview"
                      className="mt-2 max-h-24 object-contain rounded-lg border border-gray-700"
                    />
                    <button
                      className="flex items-center gap-2 text-red-500 hover:text-red-400 mt-1 text-sm"
                      onClick={() => setBgImageFile(null)}
                    >
                      <Trash size={14} /> Remove Background Image
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Result Preview */}
        {loading && (
          <p className="text-center text-blue-400 font-medium text-sm">
            Processing...
          </p>
        )}
        {resultUrl && (
          <div className="text-center space-y-2">
            <h2 className="text-white font-semibold text-lg">Result Preview</h2>
            <img
              src={resultUrl}
              alt="result"
              className="mx-auto max-w-full max-h-64 rounded-lg border border-gray-700"
            />
            <a
              href={resultUrl}
              download="image-with-bg.png"
              className="inline-block mt-1 px-5 py-1.5 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 transition text-sm"
            >
              Download Result
            </a>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* Toast */}
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded shadow-lg select-none animate-fade-in-out"
          style={{
            animation: "fadeInOut 3s forwards",
            zIndex: 9999,
          }}
        >
          {toastMsg}
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% {opacity: 0; transform: translateY(10px);}
          10%, 90% {opacity: 1; transform: translateY(0);}
          100% {opacity: 0; transform: translateY(10px);}
        }
      `}</style>
    </>
  );
}
