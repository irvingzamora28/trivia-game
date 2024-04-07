import React, { useState, useEffect, useRef } from "react";
import QuizOptions from "./QuizOptions";
import ProgressBar from "./ProgressBar";
import { OptionKey, TriviaQuestion } from "../types/trivia";
// Import necessary audio assets
import correctSound from "../assets/audio/correct-short.mp3";
import whooshSound from "../assets/audio/whoosh.mp3";
import whoosh2Sound from "../assets/audio/whoosh2.mp3";
import { motion, AnimatePresence } from "framer-motion";

// Assuming TriviaQuestion type is adjusted to include videoPauseTime and videoURL
interface QuizProps {
    triviaPath: string;
    triviaQuestions: TriviaQuestion[];
}

const answerVariants = {
    initial: {
        scale: 1,
        opacity: 1,
    },
    correct: {
        scale: 1.25,
        opacity: 1,
        x: 0,
        y: 300,
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

const GuessWhatHappensQuiz: React.FC<QuizProps> = ({
    triviaPath,
    triviaQuestions,
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoPaused, setIsVideoPaused] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCheckingAnswer, setIsCheckingAnswer] = useState<boolean>(false);
    const [isProgressBarAnimating, setIsProgressBarAnimating] = useState(false);
    const [isProgressBarVisible, setIsProgressBarVisible] = useState(false);
    const [answerState, setAnswerState] = useState<
        "initial" | "correct" | "incorrect"
    >("initial");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const currentQuestion = triviaQuestions[currentQuestionIndex];
    const timeLimit = 5; // seconds

    // Cleanup timer to avoid memory leaks
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        console.log("currentQuestionIndex", currentQuestionIndex);
        console.log("currentQuestion", currentQuestion);
        console.log("currentQuestion.videoURL", currentQuestion.videoURL);
        console.log("videoRef", videoRef);
        if (videoRef.current && currentQuestion.videoURL) {
            setIsOptionsVisible(false); // Ensure options are hidden at the start
            videoRef.current.src = `videos/${triviaPath}/${currentQuestion.videoURL}`;
            videoRef.current.load();
            videoRef.current.play().then(() => {
                videoRef.current!.ontimeupdate = () => {
                    if (
                        videoRef.current &&
                        videoRef.current.currentTime >=
                            (currentQuestion.videoPauseTime || 0)
                    ) {
                        videoRef.current.pause();
                        videoRef.current.ontimeupdate = null; // Stop checking time update
                        setIsOptionsVisible(true); // Show options immediately after pausing
                        setIsProgressBarAnimating(true);
                        setIsProgressBarVisible(true);
                        setTimeout(() => {
                            // Resume video after time limit or immediately after option selection
                            if (videoRef.current) {
                                videoRef.current.play();
                                setIsProgressBarAnimating(false);
                                setIsProgressBarVisible(false);
                            }
                        }, timeLimit * 1000);
                    }
                };
            });
        }
    }, [currentQuestionIndex, triviaQuestions, triviaPath, timeLimit]);

    // Function to proceed to the next question or loop back to the start
    const goToNextQuestion = () => {
        setIsCheckingAnswer(false);
        setCurrentQuestionIndex((prev) =>
            prev + 1 === triviaQuestions.length ? 0 : prev + 1
        );
    };

    const handleOptionSelect = (optionId: string) => {
        setIsCheckingAnswer(true);
        setSelectedAnswer(optionId);
    };

    return (
        <div className="text-center w-full h-screen flex flex-col items-center justify-center overflow-hidden relative">
            <video
                ref={videoRef}
                width="750"
                controls
                style={{ maxWidth: "100%", maxHeight: "100%" }}
            >
                {/* Video is dynamically loaded */}
            </video>
            {isOptionsVisible &&
                triviaQuestions[currentQuestionIndex].question && (
                    <div
                        className={`grid ${
                            triviaQuestions[currentQuestionIndex].image_question
                                ? "grid-cols-2 gap-x-12 gap-y-12"
                                : "grid-cols-4 gap-x-6 gap-y-6 mt-48"
                        } w-3/4 p-9`}
                    >
                        {triviaQuestions[currentQuestionIndex].options?.map(
                            (option, index) => (
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
                                        option.key ===
                                        triviaQuestions[currentQuestionIndex]
                                            .answer
                                            ? {
                                                  ...answerVariants,
                                                  correct: {
                                                      ...answerVariants.correct,
                                                      x: "-50%",
                                                      y: "-100%",
                                                  },
                                              }
                                            : answerVariants
                                    }
                                    style={
                                        answerState === "correct" &&
                                        selectedAnswer === option.key
                                            ? {
                                                  position: "absolute",
                                                  top: "50%",
                                                  left: "50%",
                                              }
                                            : {}
                                    }
                                >
                                    {/* ... button with letter and option text ... */}
                                    <motion.div
                                        key={option.key}
                                        variants={answerVariants}
                                        initial="initial"
                                        animate={
                                            selectedAnswer === option.key
                                                ? answerState
                                                : "initial"
                                        }
                                        className="relative flex items-center justify-start my-2"
                                    >
                                        <div className="flex flex-col items-center justify-center w-full">
                                            <div className="absolute -left-8 z-10 text-white bg-blue-600 rounded-full w-32 h-32 flex items-center justify-center border-8 border-white shadow-lg">
                                                <span className="text-6xl font-bold text-shadow">
                                                    {option.key}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    !isCheckingAnswer &&
                                                    handleOptionSelect(
                                                        option.key
                                                    )
                                                }
                                                className="pl-36 pr-4 py-3 w-full h-28 text-4xl font-medium text-shadow-sm text-blue-600 bg-white rounded-full transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
                                            >
                                                {option.text}
                                            </button>
                                        </div>

                                        {option.image && (
                                            <div className="absolute -top-6 left-0 z-10 text-white bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-lg">
                                                <span className="text-3xl font-bold">
                                                    {option.key}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                </motion.div>
                            )
                        )}
                    </div>
                )}
            {isProgressBarVisible && (
                <ProgressBar
                    index={currentQuestionIndex}
                    isProgressBarAnimating={isProgressBarAnimating}
                    timeLimit={timeLimit}
                />
            )}
        </div>
    );
};

export default GuessWhatHappensQuiz;
