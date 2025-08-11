import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2024 Cyber Agents • Built with React &amp; Gemini API
      </footer>
    </div>
  );
};

export default Layout;
