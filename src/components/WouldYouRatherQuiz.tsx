import React, { useState, useEffect, useCallback, useRef } from "react";
import { Option, OptionKey, TriviaQuestion } from "../types/trivia";
import "../assets/scss/globals.scss";
import { motion } from "framer-motion";
import correctSound from "../assets/audio/correct-short.mp3";
import incorrectSound from "../assets/audio/incorrect.mp3";
import ProgressBar from "./ProgressBar";
import AnswerImage from "./AnswerImage";
import { Options } from "autoprefixer";

const timeLimit = 5;
interface QuizProps {
  triviaPath: string;
  triviaQuestions: TriviaQuestion[];
}

const WouldYouRatherQuiz: React.FC<QuizProps> = ({
  triviaPath,
  triviaQuestions,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<TriviaQuestion[]>(triviaQuestions);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const timerIdRef = useRef(null); // Use ref for timer ID to ensure stability
  const [isProgressBarAnimating, setIsProgressBarAnimating] = useState(false);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);

  // Directly define the animation variants
  const optionAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: (custom: any) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  const renderOptions = (options: Option[] | [], questionIndex: number) => {
    return options.map((option, index) => (
      <motion.div
        key={`${questionIndex}-${option.key}`}
        custom={index}
        variants={optionAnimation}
        initial="hidden"
        animate="visible"
        className="mx-2 flex flex-col items-center"
      >
        <div className="text-center w-4/6">
          {option.image && (
            <img
              src={`/images/${triviaPath}/${option.image}`}
              alt={option.text}
              className="mb-4 w-screen object-cover border-white border-4 rounded-lg shadow-2xl"
            />
          )}
          <button
            className="button-start-shadow text-xl md:text-2xl lg:text-3xl font-bold mt-4 px-6 py-3 w-full border-white border-2 bg-indigo-700 text-white rounded-full shadow-2xl hover:from-blue-700 hover:to-teal-600 transition-colors duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
            onClick={() => handleAnswerSelect(option.key)}
            style={{ minHeight: "64px" }}
          >
            {option.text}
          </button>
        </div>
      </motion.div>
    ));
  };

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  const proceedToNextQuestion = () => {
    setTimeout(() => {
      goToNextQuestion();
    }, 500);
  };

  const handleAnswerSelect = (selectedKey: OptionKey, isAutoSelect = false) => {
    const currentQuestion = triviaQuestions[currentQuestionIndexRef.current];

    const isCorrect = selectedKey === currentQuestion.answer;
    // Play question correctness feedback sound (correct or incorrect)
    const feedbackSound = new Audio(
      isCorrect || isAutoSelect ? correctSound : incorrectSound
    );
    feedbackSound.play();

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
    <div className="flex flex-col h-screen w-4/5">
      <motion.div
        key={currentQuestionIndex}
        className="flex-1 flex justify-center items-center bg-indigo-600 rounded-lg shadow-2xl border-4 border-indigo-700 my-10 w-full self-center p-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 70 }}
      >
        <h2 className="text-center text-xl md:text-2xl lg:text-5xl font-bold text-slate-100 button-start-shadow">
          {questions[currentQuestionIndex]?.question ?? "No question"}
        </h2>
      </motion.div>

      <div className="flex-grow flex justify-center items-center">
        <div className="flex justify-center items-center">
          {renderOptions(
            triviaQuestions[currentQuestionIndex].options ?? [],
            currentQuestionIndex
          )}
        </div>
      </div>

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
