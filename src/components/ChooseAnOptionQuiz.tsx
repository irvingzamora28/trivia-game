import React, { useState, useEffect, useRef, useCallback } from "react";
import QuizOptions from "./QuizOptions";
import ProgressBar from "./ProgressBar";
import { OptionKey, TriviaQuestion } from "../types/trivia";
import correctSound from "../assets/audio/correct-short.mp3";

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
          proceedToNextQuestion(); // Move to the next question after the answer audio finishes
        };
      } else {
        proceedToNextQuestion(); // Move to the next question immediately if there's no answer audio
      }
      setIsProgressBarVisible(false);
    };
  };

  const proceedToNextQuestion = () => {
    setTimeout(() => {
      goToNextQuestion();
      setShouldFlip(false);
      setIsProgressBarVisible(true);
    }, 500);
  };

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
    <div className="text-center w-full h-screen flex flex-col items-center justify-center">
      <div className="px-6 py-6 bg-white rounded-full shadow-lg my-8 mx-12 min-w-[50%]">
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
