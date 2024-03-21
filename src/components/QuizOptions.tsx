import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Option } from "../types/trivia";

interface QuizOptionsProps {
  options: Option[];
  shouldFlip: boolean;
  triviaPath: string;
  onOptionSelected: (optionId: string) => void;
}

const QuizOptions: React.FC<QuizOptionsProps> = ({
  options,
  shouldFlip,
  triviaPath,
  onOptionSelected,
}) => {
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [showOptionText, setShowOptionText] = useState(false);

  useEffect(() => {
    if (!shouldFlip) {
      setFlippedIndices(new Set());
      setShowOptionText(false);
    } else {
      setFlippedIndices(new Set(options.map((_, index) => index)));
      setTimeout(() => {
        setShowOptionText(true);
      }, 800);
    }
  }, [options, shouldFlip]); // Responde a los cambios en shouldFlip y options

  const cardVariants = {
    initial: {
      y: ["-20px", "20px"],
      rotate: [-2, 2],
      scale: [1, 1.01, 1],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as "reverse" | "loop" | "mirror" | undefined,
      },
    },
    flipped: {
      rotateY: 180,
      y: ["-20px", "20px"],
      rotate: [-2, 2],
      scale: [1, 1.02, 1],
      transition: {
        duration: 1,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-8">
        {options.map((option, index) => (
          <>
            <motion.div
              key={option.key}
              variants={cardVariants}
              initial="initial"
              animate={
                flippedIndices.has(index) && shouldFlip ? "flipped" : "initial"
              }
              className="rounded-lg border-8 border-blue-300 shadow-lg cursor-pointer"
              style={{
                width: "calc(90vw / 3)",
                height: "calc(90vw / 3)",
                position: "relative",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="absolute w-full h-full flex justify-center items-center bg-gradient-to-b from-blue-700 to-blue-800 text-white text-shadow text-4xl font-bold"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(0deg)",
                  fontSize: "13rem",
                }}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <div
                className="absolute w-full h-full flex justify-center items-center"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
                onClick={() => onOptionSelected(option.key)}
              >
                <img
                  src={`/images/${triviaPath}/${option.image}`}
                  alt={`Option ${option.key}`}
                  className="object-cover w-full h-full"
                />
              </div>
              {showOptionText && (
                <div className="flex flex-col items-center justify-end w-full absolute -bottom-20 left-0 right-0 px-2 py-2 bg-white rounded-full shadow-lg">
                  <span
                    className="text-6xl font-bold text-slate-900 text-shadow"
                    style={{
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {option.text}
                  </span>
                </div>
              )}
            </motion.div>
          </>
        ))}
      </div>
    </div>
  );
};

export default QuizOptions;
