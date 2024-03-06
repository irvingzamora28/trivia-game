import React, { useState, useEffect } from "react";
import triviaQuestions from "../data/trivia.json";
import { TriviaQuestion } from "../types/trivia";
import "../assets/scss/globals.scss";
import { motion } from "framer-motion";
import correctSound from "../assets/audio/correct.mp3";
import incorrectSound from "../assets/audio/incorrect.mp3";

const timeLimit = 5;
// Define the floating animation as a variant
const optionFloatVariants = {
  floating: {
    y: ["-5%", "0%", "-5%"],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as "reverse" | "loop" | "mirror" | undefined,
      ease: "easeInOut",
    },
  },
};

const imageFloatVariants = {
  animate: {
    x: ["-2%", "2%"],
    rotate: [-2, 2],
    transition: {
      x: {
        yoyo: Infinity,
        duration: 4,
        ease: "easeInOut",
      },
      rotate: {
        yoyo: Infinity,
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse" as "reverse" | "loop" | "mirror" | undefined,
        ease: "easeInOut",
      },
    },
  },
};

const progressBarVariants = {
  initial: { width: "100%" },
  animate: {
    width: "0%",
    transition: { duration: timeLimit, ease: "linear" },
  },
};

const answerVariants = {
  initial: {
    scale: 1,
  },
  correct: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.5,
      yoyo: Infinity,
    },
  },
  incorrect: {
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
    },
  },
};

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<TriviaQuestion[]>(
    triviaQuestions as TriviaQuestion[]
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState<boolean>(false);
  const [answerState, setAnswerState] = useState<
    "initial" | "correct" | "incorrect"
  >("initial");

  const handleAnswerSelect = (option: string) => {
    setSelectedAnswer(option);
    setIsCheckingAnswer(true);

    // Initialize audio elements
    const correctAudio = new Audio(correctSound);
    const incorrectAudio = new Audio(incorrectSound);

    const isCorrect = option === questions[currentQuestionIndex].answer;

    // Play the correct sound if the answer is correct, otherwise play the incorrect sound
    if (isCorrect) {
      correctAudio.play();
    } else {
      incorrectAudio.play();
    }

    setAnswerState(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      goToNextQuestion();
    }, 2000); // Adjust timing based on your animation and sound length
  };

  const goToNextQuestion = () => {
    setIsCheckingAnswer(false);
    setSelectedAnswer(null);
    setAnswerState("initial");
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex + 1 === questions.length ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentQuestionIndex((prevIndex) =>
        prevIndex + 1 === questions.length ? 0 : prevIndex + 1
      );
    }, timeLimit * 1000);

    return () => clearTimeout(timer);
  }, [currentQuestionIndex, questions.length]);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      {questions.length > 0 && currentQuestionIndex < questions.length && (
        <div
          key={questions[currentQuestionIndex].id}
          className="flex flex-col items-center w-full h-full text-center rounded-lg"
        >
          <div className="absolute -left-8 z-10 text-white bg-gradient-to-b from-red-600 to-red-700 rounded-full w-20 h-20 flex items-center justify-center border-2 border-white round-shadow ml-20 m-6">
            <span className="text-6xl font-bold text-shadow">
              {currentQuestionIndex + 1}
            </span>
          </div>
          <h2 className="text-6xl font-bold text-white mt-6 mb-4 text-shadow">
            {questions[currentQuestionIndex].question}
          </h2>
          <motion.div
            className="z-10 text-white bg-blue-600 flex items-center justify-center border-4 border-white shadow-lg ml-8 my-4 rounded-lg "
            variants={imageFloatVariants}
            initial="{false}"
            animate="animate"
          >
            <img
              src={`/images/${questions[currentQuestionIndex].image}`}
              alt="Trivia"
              className="w-full max-w-lg h-64 object-cover object-center"
            />
          </motion.div>
          <div className="grid grid-cols-2 gap-4 w-full p-4">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <motion.div
                key={option}
                variants={optionFloatVariants}
                initial="{false}"
                animate="floating"
              >
                {/* ... button with letter and option text ... */}
                <motion.div
                  key={option}
                  variants={answerVariants}
                  initial="initial"
                  animate={selectedAnswer === option ? answerState : "initial"}
                  className="relative flex items-center justify-start my-2 h-28"
                >
                  <div className="absolute -left-8 z-10 text-white bg-blue-600 rounded-full w-32 h-32 flex items-center justify-center border-8 border-white shadow-lg ml-8">
                    <span className="text-6xl font-bold text-shadow">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      !isCheckingAnswer && handleAnswerSelect(option)
                    }
                    className="pl-12 pr-4 py-3 w-full h-full text-4xl font-medium text-shadow-sm text-blue-600 bg-white rounded-full transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {option}
                  </button>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <motion.div
            key={currentQuestionIndex} // Resets the progress bar on each question change
            className="h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full my-8"
            variants={progressBarVariants}
            initial="initial"
            animate="animate"
          />
        </div>
      )}
    </div>
  );
};

export default Quiz;
