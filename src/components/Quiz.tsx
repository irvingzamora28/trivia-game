import React, { useState, useEffect } from "react";
import triviaQuestions from "../data/trivia.json";
import { TriviaQuestion } from "../types/trivia";

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
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-r from-blue-400 to-blue-600">
      {questions.length > 0 && currentQuestionIndex < questions.length && (
        <div
          key={questions[currentQuestionIndex].id}
          className="flex flex-col items-center w-full h-full p-4 text-center bg-white bg-opacity-90 rounded-lg shadow-xl"
        >
          <h2 className="text-6xl font-bold text-blue-800 mt-6 mb-4">
            {questions[currentQuestionIndex].question}
          </h2>
          <img
            src={`/images/${questions[currentQuestionIndex].image}`}
            alt="Trivia"
            className="w-full max-w-lg h-64 object-cover object-center rounded-lg my-4"
          />

          <div className="grid grid-cols-2 gap-4 w-full p-4">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <div
                key={option}
                className="relative flex items-center justify-start my-2"
              >
                {/* The colored circle with the letter */}
                <div className="absolute -left-8 z-10 text-white bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-lg ml-8">
                  <span className="text-2xl font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>

                {/* The option button */}
                <button className="pl-12 pr-4 py-3 w-full text-xl font-medium text-blue-800 bg-white rounded-full shadow-md transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300">
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
