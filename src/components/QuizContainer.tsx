import React from 'react';
import { motion } from 'framer-motion';
import Quiz from './Quiz';

const QuizContainer: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-screen flex justify-center items-center"
    >
      <Quiz />
    </motion.div>
  );
};

export default QuizContainer;
