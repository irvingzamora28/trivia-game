import React, { useState, useEffect, useCallback, useRef } from "react";
import { OptionKey, TriviaQuestion } from "../types/trivia";
import "../assets/scss/globals.scss";
import { motion } from "framer-motion";
import correctSound from "../assets/audio/correct-short.mp3";
import incorrectSound from "../assets/audio/incorrect.mp3";
import ProgressBar from "./ProgressBar";
import AnswerImage from "./AnswerImage";

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

const WouldYouRatherQuiz: React.FC<QuizProps> = ({ triviaPath, triviaQuestions }) => {
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
  const [showAnswerImage, setShowAnswerImage] = useState<boolean>(false);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  const proceedToNextQuestion = () => {
    setTimeout(() => {
      goToNextQuestion();
    }, 500);
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

    setShowAnswerImage(true);
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
    setShowAnswerImage(false);
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
    <div className="flex flex-col h-screen">
      <motion.div
        className="flex-1 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center text-2xl">
          {questions[currentQuestionIndex]?.question ?? "No question"}
        </h2>
      </motion.div>

      <motion.div
        className="flex-1 flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-1 flex justify-center items-center border-r-2">
          <button
            className="text-xl"
            onClick={() =>
              handleAnswerSelect(
                questions[currentQuestionIndex]?.options?.[0].key ?? "A"
              )
            }
          >
            {questions[currentQuestionIndex]?.options?.[0].text ?? "No text"}
          </button>
        </div>

        <div className="flex-1 flex justify-center items-center">
          <button
            className="text-xl"
            onClick={() =>
              handleAnswerSelect(
                questions[currentQuestionIndex]?.options?.[1].key ?? "B"
              )
            }
          >
            {questions[currentQuestionIndex]?.options?.[1].text ?? "No text"}
          </button>
        </div>
      </motion.div>

      <motion.div
        className="flex-1 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Here we would include the ProgressBar component, passing the required props */}
        <ProgressBar
          index={currentQuestionIndex}
          isProgressBarAnimating={isProgressBarAnimating}
          timeLimit={timeLimit}
        />
      </motion.div>
    </div>
  );
};

export default WouldYouRatherQuiz;
