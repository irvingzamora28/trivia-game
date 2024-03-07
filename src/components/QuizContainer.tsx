import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Quiz from './Quiz';
import StartButton from '../components/ButtonStartQuiz';

const QuizContainer: React.FC = () => {
  const [quizStarted, setQuizStarted] = useState<boolean>(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-screen flex flex-col justify-center items-center"
    >
      {!quizStarted ? (
        <StartButton onStart={() => setQuizStarted(true)} />
      ) : (
        <Quiz />
      )}
    </motion.div>
  );
};

export default QuizContainer;
