import React, { useState, useEffect, useCallback, useRef } from "react";
import { OptionKey, TriviaQuestion } from "../types/trivia";
import "../assets/scss/globals.scss";
import { motion } from "framer-motion";
import correctSound from "../assets/audio/correct-short.mp3";
import incorrectSound from "../assets/audio/incorrect.mp3";
import ProgressBar from "./ProgressBar";

const timeLimit = 5;

interface QuizProps {
  triviaPath: string;
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

const answerVariants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  correct: {
    scale: 1.25,
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

const Quiz: React.FC<QuizProps> = ({ triviaPath, triviaQuestions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<TriviaQuestion[]>(triviaQuestions);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionKey | null>(null);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState<boolean>(false);
  const [answerState, setAnswerState] = useState<
    "initial" | "correct" | "incorrect"
  >("initial");
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const timerIdRef = useRef(null); // Use ref for timer ID to ensure stability
  const [isProgressBarAnimating, setIsProgressBarAnimating] = useState(false);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  const proceedToNextQuestion = () => {
    setTimeout(() => {
      goToNextQuestion();
    }, 2000);
  };

  const handleAnswerSelect = (selectedKey: OptionKey, isAutoSelect = false) => {
    setSelectedAnswer(selectedKey);
    setIsCheckingAnswer(true);

    const currentQuestion = triviaQuestions[currentQuestionIndexRef.current];

    const isCorrect = selectedKey === currentQuestion.answer;
    // Play question correctness feedback sound (correct or incorrect)
    const feedbackSound = new Audio(
      isCorrect || isAutoSelect ? correctSound : incorrectSound
    );
    feedbackSound.play();

    setAnswerState(isCorrect ? "correct" : "incorrect");

    // Clear existing timer to prevent double advancement
    if (timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }

    feedbackSound.onended = () => {
      if (isCorrect && currentQuestion.audio_answer) {
        // If the answer is correct and there's an audio_answer, play it after the feedback sound
        const answerSound = new Audio(
          `audio/${triviaPath}/${currentQuestion.audio_answer}`
        );
        answerSound.play();
        answerSound.onended = () => {
          proceedToNextQuestion(); // Move to the next question after the answer audio finishes
        };
      } else {
        proceedToNextQuestion(); // Move to the next question immediately if there's no answer audio
      }
    };
  };

  const goToNextQuestion = useCallback(() => {
    setIsCheckingAnswer(false);
    setSelectedAnswer(null);
    setAnswerState("initial");
    setCurrentQuestionIndex((prev) =>
      prev + 1 === triviaQuestions.length ? 0 : prev + 1
    );
  }, [triviaQuestions.length]);

  // Define startTimer using useRef to ensure it doesn't change between renders
  const startTimer = useRef(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current); // Clear existing timer if any
    }

    timerIdRef.current = setTimeout(() => {
      const currentQuestion = triviaQuestions[currentQuestionIndexRef.current];
      handleAnswerSelect(currentQuestion.answer, true);
    }, timeLimit * 1000) as unknown as null;
  });

  useEffect(() => {
    const audioSrc = triviaQuestions[currentQuestionIndex]?.audio_question;
    if (audioSrc) {
      const questionAudio = new Audio(`audio/${triviaPath}/${audioSrc}`);
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
          <div className="flex items-center justify-start w-full mt-4">
            {/* Index */}
            <div className="bg-gradient-to-b from-red-600 to-red-700 rounded-full w-20 h-20 flex items-center justify-center border-2 border-white shadow-lg text-white font-bold text-6xl ml-10">
              {currentQuestionIndex + 1}
            </div>
            {/* Question */}
            <h2 className="text-6xl font-bold text-white ml-4 text-shadow flex-1 mr-10">
              {questions[currentQuestionIndex].question}
            </h2>
          </div>
          {questions[currentQuestionIndex].image_question && (
            <motion.div
              className="z-10 text-white bg-blue-600 flex items-center justify-center border-4 border-white shadow-lg ml-8 my-4 rounded-lg "
              variants={imageFloatVariants}
              initial="{false}"
              animate="animate"
            >
              <img
                src={`/images/${triviaPath}/${questions[currentQuestionIndex].image_question}.jpg`}
                alt="Trivia"
                className="w-full max-w-lg h-64 object-cover object-center"
              />
            </motion.div>
          )}
          <div className="grid grid-cols-2 gap-x-12 gap-y-12 w-1/2 p-9">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <motion.div
                key={option.key}
                initial="initial"
                animate={
                  selectedAnswer === option.key
                    ? answerState === "correct"
                      ? "correct"
                      : "incorrect"
                    : isCheckingAnswer
                    ? "incorrect"
                    : "floating"
                }
                variants={
                  option.key === questions[currentQuestionIndex].answer
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
                  answerState === "correct" && selectedAnswer === option.key
                    ? { position: "absolute", top: "50%", left: "50%" }
                    : {}
                }
              >
                {/* ... button with letter and option text ... */}
                <motion.div
                  key={option.key}
                  variants={answerVariants}
                  initial="initial"
                  animate={
                    selectedAnswer === option.key ? answerState : "initial"
                  }
                  className="relative flex items-center justify-start my-2"
                >
                  {/* Conditional rendering based on the presence of an image */}
                  {option.image ? (
                    // Option layout when an image is present
                    <button
                      onClick={() =>
                        !isCheckingAnswer && handleAnswerSelect(option.key)
                      }
                      className="flex flex-col items-center justify-center w-full rounded-lg overflow-hidden transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      style={{ minHeight: "10rem" }} // Adjust minHeight to fit content
                    >
                      <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={`images/${triviaPath}/${option.image}.jpg`}
                          alt={option.text}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="pt-4 pb-2 px-4 bg-white w-full">
                        <span className="text-xl font-medium text-blue-600">
                          {option.text}
                        </span>
                      </div>
                    </button>
                  ) : (
                    // Original layout when no image is present
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="absolute -left-8 z-10 text-white bg-blue-600 rounded-full w-32 h-32 flex items-center justify-center border-8 border-white shadow-lg">
                        <span className="text-6xl font-bold text-shadow">
                          {option.key}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          !isCheckingAnswer && handleAnswerSelect(option.key)
                        }
                        className="pl-36 pr-4 py-3 w-full h-28 text-4xl font-medium text-shadow-sm text-blue-600 bg-white rounded-full transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
                      >
                        {option.text}
                      </button>
                    </div>
                  )}

                  {option.image && (
                    <div className="absolute -top-6 left-0 z-10 text-white bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-3xl font-bold">{option.key}</span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
          <ProgressBar
            index={currentQuestionIndex}
            isProgressBarAnimating={isProgressBarAnimating}
            timeLimit={timeLimit}
          />
        </div>
      )}
    </div>
  );
};

export default Quiz;
