import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Quiz from "./Quiz";
import StartButton from "../components/ButtonStartQuiz";
import triviaSound from "../assets/audio/trivia-sound.mp3";
import trivia from "../data/1_squid_game_2.json";
import { TriviaQuestion } from "../types/trivia";
import WouldYouRatherQuiz from "./WouldYouRatherQuiz";

const QuizContainer: React.FC = () => {
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [wyrStarted, setWyrStarted] = useState<boolean>(false);

  // Play audio when the trivia starts
  useEffect(() => {
    if (quizStarted) {
      const audio = new Audio(triviaSound);
      audio.volume = 0.1;
      audio
        .play()
        .catch((error) => console.error("Error playing the audio", error));
    }
  }, [quizStarted]); // This effect depends on quizStarted

  const handleStart = (type: string) => {
    // 2-second delay before starting the quiz
    setTimeout(() => {
      if (type === "quiz") {
        setQuizStarted(true);
      } else if (type === "wyr") {
        setWyrStarted(true);
      }
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-screen flex flex-col justify-center items-center gap-4"
    >
      <div className="flex flex-col items-center space-y-4">
        {" "}
        {/* Container with spacing */}
        {!quizStarted ? (
          <StartButton
            onStart={() => handleStart("quiz")}
            text="Start Trivia"
          />
        ) : (
          <Quiz
            triviaPath={trivia.data.file_path}
            triviaQuestions={trivia.questions as TriviaQuestion[]}
          />
        )}
        {!wyrStarted ? (
          <StartButton
            onStart={() => handleStart("wyr")}
            text="Start Would You Rather"
            color="lime"
          />
        ) : (
          <WouldYouRatherQuiz
            triviaPath={trivia.data.file_path}
            triviaQuestions={trivia.questions as TriviaQuestion[]}
          />
        )}
      </div>
    </motion.div>
  );
};

export default QuizContainer;
