import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        <h1 className="text-3xl font-extrabold text-white select-none cursor-default tracking-wide">
          ImageTools
        </h1>
        <ul className="flex space-x-10 text-gray-300 text-lg font-semibold">
          {[
            { to: "/", label: "Home" },
            { to: "/uploader", label: "Image To PDF" },
            { to: "/cropper", label: "Image Cropper" },
            { to: "/bg-editor", label: "Remove Background" }, // disesuaikan
          ].map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `relative px-3 py-1 transition-colors duration-300 ${
                    isActive
                      ? "text-white font-bold after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-white"
                      : "hover:text-white"
                  }`
                }
                end={to === "/"}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
