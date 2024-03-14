import React from "react";

interface StartButtonProps {
  onStart: () => void;
  text: string;
}

const StartButton: React.FC<StartButtonProps> = ({ onStart, text }) => {
  return (
    <button
      className="flex items-center shadow-box justify-center h-24 w-64 drop-shadow-xl rounded-lg px-8 py-4 overflow-hidden group bg-red-500 relative hover:bg-gradient-to-r hover:from-red-500 hover:to-red-500 text-white hover:ring-2 hover:ring-offset-2 hover:ring-red-500 transition-all ease-out duration-300"
      onClick={onStart}
    >
      <span className="absolute right-0 w-12 h-44 -mt-12 transition-all duration-1000 transform translate-x-16 bg-white opacity-10 rotate-12 group-hover:-translate-x-72 ease"></span>
      <span className="relative button-start-shadow text-4xl font-bold">
        {text}
      </span>
    </button>
  );
};

export default StartButton;
