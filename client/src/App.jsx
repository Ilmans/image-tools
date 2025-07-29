import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import { FileText, Scissors, Home as HomeIcon, Droplet } from "lucide-react";

import Header from "./components/layouts/header";
import Footer from "./components/layouts/footer";

import ImageUploader from "./components/imageUploader";
import ImageCropper from "./components/imageCropper";
import ImageBgEditor from "./components/imageBgEditor";

function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-center space-y-8">
      <h2 className="text-5xl font-extrabold tracking-tight">
        Welcome to <span className="text-blue-500">Image Tools</span>
      </h2>
      <p className="text-gray-400 text-lg max-w-3xl mx-auto">
        Discover powerful and easy-to-use image utilities. Upload, convert your
        images to PDF, crop photos, remove backgrounds, and much more — all in
        one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
        <FeatureCard
          title="Image to PDF"
          description="Upload your images and convert them seamlessly into high-quality PDFs."
          icon={<FileText size={36} className="text-blue-500" />}
          link="/uploader"
        />
        <FeatureCard
          title="Image Cropper"
          description="Crop and customize your images quickly and precisely."
          icon={<Scissors size={36} className="text-green-500" />}
          link="/cropper"
        />
        <FeatureCard
          title="Remove & Change Background"
          description="Remove image background easily and replace it with a solid color or your own background image."
          icon={<Droplet size={36} className="text-red-500" />}
          link="/bg-editor"
        />
        <FeatureCard
          title="More Tools Coming Soon"
          description="Stay tuned for upcoming features like image compression, resizing, and filters."
          icon={<HomeIcon size={36} className="text-purple-500" />}
          link="/"
          soon
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon, link, soon }) {
  return (
    <NavLink
      to={link}
      className={({ isActive }) =>
        `group block p-6 rounded-xl bg-gray-800 hover:bg-gray-700 transition-shadow shadow-lg
        border border-gray-700 hover:border-blue-500
        ${soon ? "cursor-default opacity-70" : "cursor-pointer"}`
      }
      onClick={soon ? (e) => e.preventDefault() : undefined}
    >
      <div className="flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
      {soon && (
        <span className="inline-block mt-4 px-2 py-1 text-xs font-bold text-yellow-300 bg-yellow-900 rounded-full">
          Coming Soon
        </span>
      )}
      {!soon && (
        <span className="inline-block mt-4 text-blue-400 group-hover:underline font-semibold text-sm">
          Explore &rarr;
        </span>
      )}
    </NavLink>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/uploader" element={<ImageUploader />} />
            <Route path="/cropper" element={<ImageCropper />} />
            <Route path="/bg-editor" element={<ImageBgEditor />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
