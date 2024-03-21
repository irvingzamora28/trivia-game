import React, { useState, useEffect, useRef, useCallback } from "react";
import QuizOptions from "./QuizOptions";
import ProgressBar from "./ProgressBar";
import { OptionKey, TriviaQuestion } from "../types/trivia";
import correctSound from "../assets/audio/correct-short.mp3";
import whooshSound from "../assets/audio/whoosh.mp3";
import whoosh2Sound from "../assets/audio/whoosh2.mp3";
import { motion, AnimatePresence } from "framer-motion";

interface QuizProps {
  triviaPath: string;
  triviaQuestions: TriviaQuestion[];
}

const ChooseAnOptionQuiz: React.FC<QuizProps> = ({
  triviaPath,
  triviaQuestions,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isProgressBarAnimating, setIsProgressBarAnimating] = useState(false);
  const [isProgressBarVisible, setIsProgressBarVisible] = useState(true);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [animateBackground, setAnimateBackground] = useState(false);
  const [animationStage, setAnimationStage] = useState("enter");

  const timerIdRef = useRef(null);
  const timeLimit = 3;
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const [shouldFlip, setShouldFlip] = useState(false);
  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) =>
      prev + 1 === triviaQuestions.length ? 0 : prev + 1
    );
  }, [triviaQuestions.length]);

  const startTimer = useRef(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
    }

    timerIdRef.current = setTimeout(() => {
      const currentQuestion = triviaQuestions[currentQuestionIndexRef.current];
      handleAnswerSelect(currentQuestion.answer);
      setShouldFlip(true);
    }, timeLimit * 1000) as unknown as null;
  });

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (selectedKey: OptionKey) => {
    const currentQuestion = triviaQuestions[currentQuestionIndexRef.current];

    const feedbackSound = new Audio(correctSound);
    feedbackSound.play();

    // Clear existing timer to prevent double advancement
    if (timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }

    feedbackSound.onended = () => {
      setIsProgressBarAnimating(false);
      if (currentQuestion.audio_answer) {
        // If the answer is correct and there's an audio_answer, play it after the feedback sound
        const answerSound = new Audio(
          `audio/${triviaPath}/${currentQuestion.audio_answer}`
        );
        answerSound.play();
        answerSound.onended = () => {
          proceedToNextQuestion();
        };
      } else {
        proceedToNextQuestion();
      }
      setIsProgressBarVisible(false);
    };
  };

  const startBackgroundAnimation = () => {
    setAnimateBackground(true);
  };

  const proceedToNextQuestion = useCallback(() => {
    const whooshSoundEffect = new Audio(whoosh2Sound);
    const whooshSoundEffect2 = new Audio(whooshSound);
    setAnimateBackground(true);
    setAnimationStage("enter");
    whooshSoundEffect.play();
    // Start the enter animation
    setTimeout(() => {
      // After the enter animation completes, pause in the center
      setAnimationStage("pause");
      setShouldFlip(false);
      setTimeout(() => {
        // After the pause, proceed with the exit animation
        setAnimationStage("exit");
        whooshSoundEffect2.play();
        goToNextQuestion();

        setTimeout(() => {
          setIsProgressBarVisible(true);
          setAnimateBackground(false);
        }, 1000); // Exit animation duration
      }, 1000); // Pause duration
    }, 500); // Enter animation duration
  }, [triviaQuestions.length]);

  useEffect(() => {
    const audioSrc = triviaQuestions[currentQuestionIndex]?.audio_question;
    if (audioSrc) {
      const questionAudio = new Audio(`audio/${triviaPath}/${audioSrc}`);
      questionAudio.play().then(() => {
        questionAudio.addEventListener("ended", () => {
          setIsProgressBarAnimating(true);
          setIsProgressBarVisible(true);
          startTimer.current();
        });
      });

      return () => {
        questionAudio.removeEventListener("ended", startTimer.current);
        questionAudio.pause();
        if (timerIdRef.current) {
          clearTimeout(timerIdRef.current);
        }
        setIsProgressBarAnimating(false);
      };
    }
  }, [currentQuestionIndex]);

  const handleOptionSelect = (optionId: string) => {};

  return (
    <div className="text-center w-full h-screen flex flex-col items-center justify-center overflow-hidden relative">
      <AnimatePresence>
        {animateBackground && (
          <motion.div
          initial={{ x: '100%', scale: 1.4 }}
          animate={{ x: animationStage === 'enter' || animationStage === 'pause' ? '0%' : '-130%', scale: 1.4 }}
           
            className="absolute top-0 left-0 w-full h-full bg-[url('/src/assets/images/background_transition.png')] bg-cover bg-center z-50"
            key="background"
          />
        )}
      </AnimatePresence>
      <div className="px-6 py-6 bg-white rounded-full shadow-lg my-8 mx-12 min-w-[50%] z-10 relative">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 text-shadow-sm">
          {triviaQuestions[currentQuestionIndex].question}
        </h2>
      </div>
      <QuizOptions
        options={triviaQuestions[currentQuestionIndex].options ?? []}
        shouldFlip={shouldFlip}
        triviaPath={triviaPath}
        onOptionSelected={handleOptionSelect}
      />
      <ProgressBar
        index={1}
        isProgressBarAnimating={isProgressBarAnimating}
        timeLimit={timeLimit}
        isProgressBarVisible={isProgressBarVisible}
      />
    </div>
  );
};

export default ChooseAnOptionQuiz;
