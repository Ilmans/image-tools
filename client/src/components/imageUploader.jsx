// client/src/components/ImageUploader.jsx
import { useState } from "react";
import axios from "axios";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Trash2,
  Download,
  UploadCloud,
  Zap,
  Eye,
  FileText,
  Trash,
} from "lucide-react";

function SortableImage({ file, index, id, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className="relative group"
    >
      {/* Hanya div ini yang draggable */}
      <div {...listeners} className="cursor-move select-none">
        <img
          src={URL.createObjectURL(file)}
          alt={`preview-${index}`}
          className="h-32 object-cover rounded-md border border-gray-700"
        />
      </div>

      {/* Tombol delete di pojok kanan atas dengan opacity saat hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(id);
          }}
          className="bg-red-600 p-1 rounded hover:bg-red-700"
          title="Delete image"
        >
          <Trash />
        </button>
      </div>
    </div>
  );
}

export default function ImageUploader() {
  const [images, setImages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  // Setup sensor drag
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDrop = (e) => {
    const droppedFiles = Array.from(e.target.files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
    }));
    setImages((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      setImages((items) => arrayMove(items, oldIndex, newIndex));
    }
  };
  const handleConvert = async () => {
    if (!images.length) return;
    setLoading(true);
    setProcessingStep("Uploading images...");

    try {
      const formData = new FormData();
      images.forEach((img) => formData.append("images", img.file));

      // Simulasi delay 1 detik sebelum request ke backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await axios.post(
        "http://localhost:3100/api/convert",
        formData,
        {
          responseType: "blob",
        }
      );

      setProcessingStep("Generating PDF...");

      // Simulasi delay 1 detik setelah response sebelum set url
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const url = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      setPdfUrl(url);
      setProcessingStep("");
    } catch (err) {
      alert("Gagal mengonversi file PDF.");
      setProcessingStep("");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (id) => {
    setImages((imgs) => imgs.filter((img) => img.id !== id));
  };

  // Fungsi untuk buka preview gambar di tab baru
  const previewImage = () => {
    if (!images.length) return;
    images.forEach((img) => {
      const url = URL.createObjectURL(img.file);
      window.open(url, "_blank");
    });
  };

  // Fungsi untuk buka preview PDF di tab baru
  const previewPDF = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">PDF Converter</h1>
          <p className="text-gray-400">
            Convert your images to professional PDFs
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-900/30 px-4 py-2 rounded-lg border border-green-500/30">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">AI Powered</span>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-700 p-8">
        <label
          htmlFor="dropzone"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-800/50 hover:border-blue-500 hover:bg-gray-800 transition-all duration-300 group"
        >
          <input
            type="file"
            id="dropzone"
            multiple
            accept="image/*"
            onChange={handleDrop}
            className="hidden"
          />
          <div className="text-center">
            <UploadCloud
              className="text-blue-400 mb-4 group-hover:scale-110 transition-transform"
              size={48}
            />
            <p className="text-white font-semibold mb-2">
              Drop your images here
            </p>
            <p className="text-gray-400 text-sm">
              or click to browse • Supports JPG, PNG, WebP
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <Zap size={12} />
              <span>Auto-optimization enabled</span>
            </div>
          </div>
        </label>

        {images.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Images ({images.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={previewPDF}
                  disabled={!pdfUrl || loading}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition
    ${
      pdfUrl && !loading
        ? "bg-gray-800 text-gray-300 hover:text-white cursor-pointer"
        : "bg-gray-700 text-gray-500 cursor-not-allowed"
    }`}
                >
                  <Eye size={14} />
                  Preview
                </button>

                <button
                  onClick={() => setImages([])}
                  className="flex items-center gap-2 bg-red-900/30 px-3 py-1 rounded-lg text-red-400 hover:text-red-300 transition text-sm"
                >
                  <Trash2 size={14} />
                  Clear All
                </button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map((img) => img.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((img, idx) => (
                    <SortableImage
                      key={img.id}
                      id={img.id}
                      index={idx}
                      file={img.file}
                      onRemove={removeImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex items-center justify-between p-6 bg-gray-800 rounded-xl border border-gray-700">
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Ready to convert?</h4>
                <p className="text-gray-400 text-sm">
                  High-quality PDF generation with AI optimization
                </p>
                {loading && processingStep && (
                  <p className="text-blue-400 text-sm font-medium">
                    {processingStep}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    download="converted.pdf"
                    className="flex items-center gap-2 text-green-400 hover:text-green-300 transition font-medium"
                  >
                    <Download size={18} />
                    Download PDF
                  </a>
                )}

                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Convert to PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
