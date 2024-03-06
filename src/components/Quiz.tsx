import React, { useState, useEffect } from "react";
import triviaQuestions from "../data/trivia.json";
import { TriviaQuestion } from "../types/trivia";
import "../assets/scss/globals.scss";
const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<TriviaQuestion[]>(
    triviaQuestions as TriviaQuestion[]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentQuestionIndex((prevIndex) =>
        prevIndex + 1 === questions.length ? 0 : prevIndex + 1
      );
    }, 500000); // Change the question every 5 seconds

    return () => clearTimeout(timer); // Cleanup on component unmount
  }, [currentQuestionIndex, questions.length]);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      {questions.length > 0 && currentQuestionIndex < questions.length && (
        <div
          key={questions[currentQuestionIndex].id}
        className="flex flex-col items-center w-full h-full text-center rounded-lg"
        >
          <h2 className="text-6xl font-bold text-white mt-6 mb-4 text-shadow">
            {questions[currentQuestionIndex].question}
          </h2>
          <div className="z-10 text-white bg-blue-600 flex items-center justify-center border-4 border-white shadow-lg ml-8 my-4 rounded-lg ">
            <img
              src={`/images/${questions[currentQuestionIndex].image}`}
              alt="Trivia"
              className="w-full max-w-lg h-64 object-cover object-center"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 w-full p-4">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <div
                key={option}
                className="relative flex items-center justify-start my-2 h-28"
              >
                {/* The colored circle with the letter */}
                <div className="absolute -left-8 z-10 text-white bg-blue-600 rounded-full w-32 h-32 flex items-center justify-center border-8 border-white shadow-lg ml-8">
                  <span className="text-6xl font-bold text-shadow">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>

                {/* The option button */}
                <button className="pl-12 pr-4 py-3 w-full h-full text-4xl font-medium text-blue-600 bg-white rounded-full transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300">
                  {option}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
