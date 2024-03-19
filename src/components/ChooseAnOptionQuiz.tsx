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
    // Aquí puedes implementar cualquier otra lógica que necesites tras seleccionar una opción
  };

  return (
    <div className="text-center w-full h-screen flex flex-col items-center justify-center">
      <h2 className="question text-8xl">{question}</h2>
      <QuizOptions options={options} onOptionSelected={handleOptionSelect} />
      {/* Puedes añadir lógica adicional aquí, por ejemplo, para mostrar feedback basado en la opción elegida */}
    </div>

  );
};

export default ChooseAnOptionQuiz;
