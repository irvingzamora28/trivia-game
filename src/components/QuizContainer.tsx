import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Quiz from "./Quiz";
import StartButton from "../components/ButtonStartQuiz";
import triviaSound from "../assets/audio/trivia-sound.mp3";
import trivia from "../data/14_guess_happens_funny.json";
import { TriviaQuestion } from "../types/trivia";
import WouldYouRatherQuiz from "./WouldYouRatherQuiz";
import ChooseAnOptionQuiz from "./ChooseAnOptionQuiz";
import GuessWhatHappensQuiz from "./GuessWhatHappensQuiz";

const QuizContainer: React.FC = () => {
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [chooseAnOptionQuizStarted, setChooseAnOptionQuizStarted] = useState<boolean>(false);
  const [wyrStarted, setWyrStarted] = useState<boolean>(false);
  const [guessWhatStarted, setGuessWhatStarted] = useState<boolean>(false);

  useEffect(() => {
    if (quizStarted || wyrStarted) {
      const audio = new Audio(triviaSound);
      audio.volume = 0.1;
      audio.play().catch((error) => console.error("Error playing the audio", error));
    }
  }, [quizStarted, wyrStarted]); // This effect now depends on both quizStarted and wyrStarted

  const handleStart = (type: string) => {
    setTimeout(() => {
      if (type === "quiz") {
        setQuizStarted(true);
        setWyrStarted(false);
      } else if (type === "wyr") {
        setWyrStarted(true);
        setQuizStarted(false);
      } else if (type === "chao") {
        setWyrStarted(false);
        setQuizStarted(false);
        setChooseAnOptionQuizStarted(true);
      } else if (type === "guess") {
        setWyrStarted(false);
        setQuizStarted(false);
        setChooseAnOptionQuizStarted(false);
        setGuessWhatStarted(true);
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
      <div className="flex flex-col items-center space-y-4 w-full">
        {!quizStarted && !wyrStarted && !chooseAnOptionQuizStarted && !guessWhatStarted && ( // Only show buttons if neither quiz has started
          <>
            <StartButton onStart={() => handleStart("quiz")} text="Start Trivia" />
            <StartButton onStart={() => handleStart("wyr")} text="Start Would You Rather" color="lime" />
            <StartButton onStart={() => handleStart("chao")} text="Start Choose An Option" color="pink" />
            <StartButton onStart={() => handleStart("guess")} text="Guess What Happens" color="emerald" />
          </>
        )}

        {quizStarted && ( // Show Quiz if it's started
          <Quiz
            triviaPath={trivia.data.file_path}
            triviaQuestions={trivia.questions as TriviaQuestion[]}
          />
        )}
        {wyrStarted && ( // Show WouldYouRatherQuiz if it's started
          <WouldYouRatherQuiz
            triviaPath={trivia.data.file_path}
            triviaQuestions={trivia.questions as TriviaQuestion[]}
          />
        )}
        {chooseAnOptionQuizStarted && (
          <ChooseAnOptionQuiz
            triviaPath={trivia.data.file_path}
            triviaQuestions={trivia.questions as TriviaQuestion[]}
          />
        )}
        {guessWhatStarted && (
          <GuessWhatHappensQuiz
            triviaPath={trivia.data.file_path}
            triviaQuestions={trivia.questions as TriviaQuestion[]}
          />
        )}
      </div>
    </motion.div>
  );
};

export default QuizContainer;
