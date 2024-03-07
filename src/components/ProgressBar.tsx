import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface ProgressBarProps {
    index: any;
    isProgressBarAnimating: boolean;
    timeLimit: number;
  }
  
  const ProgressBar: React.FC<ProgressBarProps> = ({ index, isProgressBarAnimating, timeLimit }) => {
   
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
      controls.set("initial"); // Immediately set to initial state without animation
    }
  }, [isProgressBarAnimating, controls]);

  return (
    <div className="flex flex-row justify-between w-full m-16 px-16">
      <motion.div
        key={index} // Reset the progress bar on each question change
        className="h-4 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-full shadow-lg"
        variants={progressBarVariants}
        initial="initial"
        animate={controls}
      />
    </div>
  );
};

export default ProgressBar;
