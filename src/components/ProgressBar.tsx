// ProgressBar.tsx
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface ProgressBarProps {
  index: any;
  isProgressBarAnimating: boolean;
  timeLimit: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  index,
  isProgressBarAnimating,
  timeLimit,
}) => {
  const controls = useAnimation();

  const progressBarVariants = {
    initial: { width: "100%" },
    animate: {
      width: "0%",
      transition: { duration: timeLimit, ease: "linear" },
    },
  };

  useEffect(() => {
    if (isProgressBarAnimating) {
      controls.start("animate");
    } else {
      controls.set("initial");
    }
  }, [isProgressBarAnimating, controls]);

  return (
    <div className="flex flex-row justify-between w-full m-8 px-8">
      <div className="relative w-full h-8 bg-slate-100 border-slate-200 border-2 rounded-full overflow-hidden round-shadow">
        <motion.div
          key={index}
          className="absolute top-0 left-0 h-full bg-red-500 rounded-full shadow-md"
          variants={progressBarVariants}
          initial="initial"
          animate={isProgressBarAnimating ? "animate" : "initial"}
          style={{
            backgroundSize: '200% 100%',
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                rgba(5, 255, 5, 0.7),
                rgba(5, 255, 5, 0.7) 10px,
                rgba(0, 220, 0, 0.7) 10px,
                rgba(0, 220, 0, 0.7) 20px
              )
            `,
            animation: isProgressBarAnimating ? 'moveStripes 50s linear infinite' : 'none', // sync with the bar depletion
          }}
          
        />
      </div>
    </div>
  );
};

export default ProgressBar;
