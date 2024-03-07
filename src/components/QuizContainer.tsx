import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Quiz from './Quiz';
import StartButton from '../components/ButtonStartQuiz';
import triviaSound from "../assets/audio/trivia-sound.mp3";
import triviaQuestions from "../data/trivia.json";

const QuizContainer: React.FC = () => {
  const [quizStarted, setQuizStarted] = useState<boolean>(false);

  // Play audio when the trivia starts
  useEffect(() => {
    if (quizStarted) {
      const audio = new Audio(triviaSound);
      audio.volume = 0.1;
      audio.play().catch(error => console.error("Error playing the audio", error));
    }
  }, [quizStarted]); // This effect depends on quizStarted

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
        <Quiz triviaQuestions={triviaQuestions} />
      )}
    </motion.div>
  );
};

export default QuizContainer;
