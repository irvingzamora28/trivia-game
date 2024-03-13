import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Define an interface for the component's props
interface AnswerImageProps {
  imagePath: string;
}

const AnswerImage: React.FC<AnswerImageProps> = ({ imagePath }) => {
  const [imgClasses, setImgClasses] = useState(
    "object-cover object-center w-96 h-full rounded-lg shadow-lg"
  );

  // Event handler for image load
  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    console.log(naturalWidth, naturalHeight);
    
    // Determine classes based on the image's natural dimensions
    const determinedClasses =
      naturalWidth > naturalHeight
        ? "object-containt object-center w-full h-96 rounded-lg shadow-lg border-slate-50 border-2" // Wide image
        : "object-cover object-center w-96 h-full rounded-lg shadow-lg border-slate-50 border-2"; // Tall image or square

    setImgClasses(determinedClasses);
  };

  return (
    <>
      <motion.div
        className="flex items-center justify-center w-full max-w-xl mx-auto h-3/4" 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={`${imagePath}`}
          alt="Movie"
          onLoad={handleImageLoad}
          className={imgClasses}
        />
      </motion.div>
    </>
  );
};

export default AnswerImage;
