import React from "react";

const Hero: React.FC = () => {
  return (
    <section
      className="h-96 bg-cover bg-center flex flex-col justify-center items-center text-white relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 text-center p-4">
        <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">
          Secure Your Network with AI
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-200 drop-shadow-md max-w-2xl mx-auto">
          Next-generation Cybersecurity Agents at your fingertips, providing
          real-time threat analysis and automated defense.
        </p>
        <div className="mt-8 space-x-4">
          <a
            href="#agents"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg font-semibold transition-transform transform hover:scale-105"
          >
            View Agents
          </a>
          <a
            href="#chat"
            className="px-8 py-3 bg-white text-gray-800 hover:bg-gray-100 rounded-lg shadow-lg font-semibold transition-transform transform hover:scale-105"
          >
            AI Chat
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
