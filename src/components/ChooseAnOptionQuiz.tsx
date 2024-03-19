import React, { useState, useEffect } from "react";
import QuizOptions from "./QuizOptions";
import { TriviaQuestion } from "../types/trivia";

interface QuizProps {
  triviaPath: string;
  triviaQuestions: TriviaQuestion[];
}

const ChooseAnOptionQuiz: React.FC<QuizProps> = ({
  triviaPath,
  triviaQuestions,
}) => {
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TriviaQuestion[]>(triviaQuestions);
  const question = "Elije tu auto";
  const options = [
    {
      id: "1",
      letter: "A",
      imagePath: "/images/11_choose_an_option/1_car_1.jpeg",
    },
    {
      id: "2",
      letter: "B",
      imagePath: "/images/11_choose_an_option/1_car_2.jpeg",
    },
    {
      id: "3",
      letter: "C",
      imagePath: "/images/11_choose_an_option/1_car_3.jpeg",
    },
  ];

  const handleOptionSelect = (optionId: string) => {
    setUserChoice(optionId);
  };

  return (
    <div className="text-center w-full h-screen flex flex-col items-center justify-center">
      <div className="px-6 py-4 bg-white rounded-full shadow-lg my-8 min-w-[50%]">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black text-shadow-sm">
          {question}
        </h2>
      </div>
      <QuizOptions options={options} onOptionSelected={handleOptionSelect} />
    </div>
  );
};

export default ChooseAnOptionQuiz;
