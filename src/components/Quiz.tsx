import React, { useState, useEffect, useCallback, useRef } from "react";
import { TriviaQuestion } from "../types/trivia";
import "../assets/scss/globals.scss";
import { motion } from "framer-motion";
import correctSound from "../assets/audio/correct.mp3";
import incorrectSound from "../assets/audio/incorrect.mp3";

const timeLimit = 5;

interface QuizProps {
  triviaQuestions: TriviaQuestion[];
}

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
    opacity: 1,
  },
  correct: {
    scale: 1.5,
    opacity: 1,
    x: 0,
    y: 100,
    transition: {
      scale: {
        duration: 0.5,
        delay: 0.5,
      },
      position: {
        duration: 0.5,
        delay: 0.5,
      },
    },
  },
  incorrect: {
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const Quiz: React.FC<QuizProps> = ({ triviaQuestions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<TriviaQuestion[]>(triviaQuestions);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState<boolean>(false);
  const [answerState, setAnswerState] = useState<
    "initial" | "correct" | "incorrect"
  >("initial");
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const timerIdRef = useRef(null); // Use ref for timer ID to ensure stability
  const triviaQuestionsRef = useRef(triviaQuestions); // Use ref for trivia questions to ensure stability
  const [isProgressBarAnimating, setIsProgressBarAnimating] = useState(false);

  useEffect(() => {
    triviaQuestionsRef.current = triviaQuestions;
  }, [triviaQuestions]);

  const handleAnswerSelect = (option: string, isAutoSelect = false) => {
    setSelectedAnswer(option);
    setIsCheckingAnswer(true);

    // Determine if the answer is correct
    const isCorrect = option === triviaQuestions[currentQuestionIndex].answer;
    // Initialize and play the appropriate sound
    const sound = new Audio(
      isCorrect || isAutoSelect ? correctSound : incorrectSound
    );
    sound.play();
    setAnswerState(isCorrect ? "correct" : "incorrect");

    // Clear existing timer to prevent double advancement
    if (timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }

    setTimeout(() => {
      goToNextQuestion();
    }, 2000);
  };

  const goToNextQuestion = useCallback(() => {
    console.log("goToNextQuestion");

    setIsCheckingAnswer(false);
    setSelectedAnswer(null);
    setAnswerState("initial");
    setCurrentQuestionIndex((prev) =>
      prev + 1 === triviaQuestions.length ? 0 : prev + 1
    );
  }, [triviaQuestions.length]);

  // Define startTimer using useRef to ensure it doesn't change between renders
  const startTimer = useRef(() => {
    console.log("startTimer");

    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current); // Clear existing timer if any
    }

    timerIdRef.current = setTimeout(() => {
      console.log("Set timeout 5000");
      const currentQuestion = triviaQuestionsRef.current[currentQuestionIndex];
      handleAnswerSelect(currentQuestion.answer, true);
    }, timeLimit * 1000) as unknown as null;
  });

  useEffect(() => {
    const audioSrc = triviaQuestions[currentQuestionIndex]?.audio_question;
    if (audioSrc) {
      const questionAudio = new Audio(`audio/${audioSrc}`);
      questionAudio.play().then(() => {
        questionAudio.addEventListener("ended", () => {
          setIsProgressBarAnimating(true); // Start progress bar animation after audio ends
          startTimer.current();
        });
      });

      return () => {
        questionAudio.removeEventListener("ended", startTimer.current);
        questionAudio.pause();
        if (timerIdRef.current) {
          clearTimeout(timerIdRef.current);
        }
        setIsProgressBarAnimating(false); // Reset progress bar animation state
      };
    }
  }, [currentQuestionIndex]);

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
                initial="initial"
                animate={
                  selectedAnswer === option
                    ? answerState === "correct"
                      ? "correct"
                      : "incorrect"
                    : isCheckingAnswer
                    ? "incorrect"
                    : "floating"
                }
                variants={
                  option === questions[currentQuestionIndex].answer
                    ? {
                        ...answerVariants,
                        correct: {
                          ...answerVariants.correct,
                          x: "-50%",
                          y: "-50%",
                        },
                      }
                    : answerVariants
                }
                style={
                  answerState === "correct" && selectedAnswer === option
                    ? { position: "absolute", top: "50%", left: "50%" }
                    : {}
                }
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
                    className="relative flex items-center justify-start my-2 h-28 pl-36 pr-4 py-3 w-full text-4xl font-medium text-shadow-sm text-blue-600 bg-white rounded-full transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {option}
                  </button>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <motion.div
            key={currentQuestionIndex} // Resets the progress bar on each question change
            className="h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full my-16"
            variants={progressBarVariants}
            initial="initial"
            animate={isProgressBarAnimating ? "animate" : "initial"} // Control animation based on state
          />
        </div>
      )}
    </div>
  );
};

export default Quiz;
