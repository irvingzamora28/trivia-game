import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { log } from "console";

interface ProgressBarProps {
  index: any;
  isProgressBarAnimating: boolean;
  timeLimit: number;
  isProgressBarVisible?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  index,
  isProgressBarAnimating,
  timeLimit,
  isProgressBarVisible,
}) => {
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(true);

  const progressBarVariants = {
    initial: { width: "100%" },
    animate: {
      width: "0%",
      transition: { duration: timeLimit, ease: "linear" },
    },
  };
  useEffect(() => {
    let timerId: any;

    if (isProgressBarAnimating) {
      controls.start("animate");
      setIsVisible(true);
      // Clear existing timer if there is one
      if (timerId) {
        clearTimeout(timerId);
      }
      // Set a timer to match the duration of the progress bar animation
      timerId = setTimeout(() => {
        setIsVisible(false);
      }, timeLimit * 1000); // Convert timeLimit to milliseconds
    } else {
      // Immediately make the progress bar visible if not animating
      if (isProgressBarVisible != undefined && isProgressBarVisible) {
        setIsVisible(true);
      } else if (isProgressBarVisible != undefined && !isProgressBarVisible) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isProgressBarAnimating, isProgressBarVisible, controls, timeLimit]);

  return (
    <div className="flex flex-row justify-between w-3/4 m-8 px-8">
      <div
        className={`relative w-full h-8 bg-slate-100 border-slate-200 border-2 rounded-full overflow-hidden shadow ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transition: "opacity 0.5s ease-out" }}
      >
        <motion.div
          key={index}
          className="absolute top-0 left-0 h-full bg-red-500 rounded-full shadow-md"
          variants={progressBarVariants}
          initial="initial"
          animate={isProgressBarAnimating ? "animate" : "initial"}
          style={{
            backgroundSize: "200% 100%",
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                rgba(5, 255, 5, 0.7),
                rgba(5, 255, 5, 0.7) 10px,
                rgba(0, 220, 0, 0.7) 10px,
                rgba(0, 220, 0, 0.7) 20px
              )
            `,
            animation: isProgressBarAnimating
              ? "moveStripes 50s linear infinite"
              : "none",
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
