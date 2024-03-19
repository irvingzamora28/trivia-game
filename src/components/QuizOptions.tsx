import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface OptionType {
  id: string;
  letter: string;
  imagePath: string;
}

interface QuizOptionsProps {
  options: OptionType[];
  onOptionSelected: (optionId: string) => void;
}

const QuizOptions: React.FC<QuizOptionsProps> = ({
  options,
  onOptionSelected,
}) => {
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Agrega un tiempo de espera antes de voltear todas las tarjetas
    const timer = setTimeout(() => {
      setFlippedIndices(new Set(options.map((_, index) => index)));
    }, 3000);

    return () => clearTimeout(timer);
  }, [options]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-8">
        {options.map((option, index) => (
          <motion.div key={option.id}
            initial={false}
            animate={{ rotateY: flippedIndices.has(index) ? 180 : 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="rounded-lg border-2 border-blue-500 shadow-lg cursor-pointer"
            style={{ width: "calc(90vw / 3)", height: "calc(90vw / 3)", position: "relative", transformStyle: "preserve-3d"}}
          >
            {/* Cara frontal de la tarjeta */}
            <div
              className="absolute w-full h-full flex justify-center items-center bg-blue-500 text-white text-4xl font-bold rounded-lg"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(0deg)" }}
            >
              {option.letter}
            </div>
            {/* Cara trasera de la tarjeta */}
            <div
              className="absolute w-full h-full flex justify-center items-center"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute" }}
              onClick={() => onOptionSelected(option.id)}
            >
              <img src={option.imagePath} alt={`Option ${option.letter}`} className="object-cover w-full h-full rounded-lg" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuizOptions;
