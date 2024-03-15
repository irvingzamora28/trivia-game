interface StartButtonProps {
  onStart: () => void;
  text: string;
  color?: string; // Color prop is optional and defaults to "red"
}

const StartButton: React.FC<StartButtonProps> = ({ onStart, text, color = "red" }) => {
  // Template string to dynamically change color classes
  const bgColorClass = `bg-${color}-500`;
  const hoverFromColorClass = `hover:from-${color}-500`;
  const hoverToColorClass = `hover:to-${color}-500`;
  const ringColorClass = `hover:ring-${color}-500`;

  return (
    <button
      className={`flex items-center shadow-box justify-center h-24 w-96 drop-shadow-xl rounded-lg px-8 py-4 overflow-hidden group ${bgColorClass} relative hover:bg-gradient-to-r ${hoverFromColorClass} ${hoverToColorClass} text-white hover:ring-2 hover:ring-offset-2 ${ringColorClass} transition-all ease-out duration-300`}
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
