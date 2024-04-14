import React, { useState, useEffect, useRef } from "react";
import ProgressBar from "./ProgressBar";
import { TriviaQuestion } from "../types/trivia";
import correctSound from "../assets/audio/correct-short.mp3";
import incorrectSound from "../assets/audio/incorrect.mp3";
import { motion } from "framer-motion";
import triviaSound from "../assets/audio/trivia-sound-2.mp3";

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
    const [isVideoCentered, setIsVideoCentered] = useState(true); // State to toggle video position
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCheckingAnswer, setIsCheckingAnswer] = useState<boolean>(false);
    const [isAnswerAudioPlaying, setIsAnswerAudioPlaying] = useState(true);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isProgressBarAnimating, setIsProgressBarAnimating] = useState(false);
    const [isProgressBarVisible, setIsProgressBarVisible] = useState(false);
    const [answerState, setAnswerState] = useState<
        "initial" | "correct" | "incorrect"
    >("initial");
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
    const timerIdRef = useRef(null); // Use ref for timer ID to ensure stability
    const audioTrivia = new Audio(triviaSound);
    audioTrivia.volume = 0.8;
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const currentQuestion = triviaQuestions[currentQuestionIndex];
    const timeLimit = 6; // seconds
    const currentQuestionIndexRef = useRef(currentQuestionIndex);

    useEffect(() => {
        currentQuestionIndexRef.current = currentQuestionIndex;
    }, [currentQuestionIndex]);

    // Define startTimer using useRef to ensure it doesn't change between renders
    const startTimer = useRef(() => {
        if (timerIdRef.current) {
            clearTimeout(timerIdRef.current); // Clear existing timer if any
        }

        timerIdRef.current = setTimeout(() => {
            const currentQuestion =
                triviaQuestions[currentQuestionIndexRef.current];
            handleAnswerSelect(currentQuestion.answer, true);
        }, timeLimit * 1000) as unknown as null;
    });

    useEffect(() => {
        console.log("currentQuestionIndex", currentQuestionIndex);
        console.log("currentQuestion", currentQuestion);
        console.log("currentQuestion.videoURL", currentQuestion.videoURL);
        console.log("videoRef", videoRef);
        if (videoRef.current && currentQuestion.videoURL) {
            setIsOptionsVisible(false); // Ensure options are hidden at the start
            videoRef.current.src = `videos/${triviaPath}/${currentQuestion.videoURL}`;
            videoRef.current.load();
        }
    }, [currentQuestionIndex, triviaQuestions, triviaPath, timeLimit]);

    useEffect(() => {
        const audioSrc = triviaQuestions[currentQuestionIndex]?.audio_question;
        if (audioSrc) {
            const questionAudio = new Audio(`audio/${triviaPath}/${audioSrc}`);
            questionAudio.play().then(() => {
                audioTrivia.play();
                questionAudio.addEventListener("ended", () => {
                    if (videoRef.current) {
                        videoRef.current.play().then(() => {
                            setIsVideoCentered(true);
                            setIsVideoPlaying(true);
                            audioTrivia.pause();
                            videoRef.current!.ontimeupdate = () => {
                                if (
                                    videoRef.current &&
                                    videoRef.current.currentTime >=
                                        (currentQuestion.videoPauseTime || 0)
                                ) {
                                    videoRef.current.pause();
                                    videoRef.current.ontimeupdate = null; // Stop checking time update
                                    setIsVideoCentered(false);
                                    setIsOptionsVisible(true); // Show options immediately after pausing
                                    setIsProgressBarAnimating(true);
                                    setIsProgressBarVisible(true);
                                    setTimeout(() => {
                                        // Resume video after time limit or immediately after option selection
                                        if (videoRef.current) {
                                            videoRef.current.play().then(() => {
                                                audioTrivia.pause();
                                            });
                                            setIsProgressBarAnimating(false);
                                            setIsProgressBarVisible(false);
                                            handleAnswerSelect(
                                                currentQuestion.answer,
                                                true
                                            );
                                        }
                                    }, timeLimit * 1000);
                                }
                            };
                        });
                        videoRef.current.onpause = () => {
                            audioTrivia.play();
                        };
                        videoRef.current.onended = () => {
                            audioTrivia.pause();
                            setIsVideoCentered(true);
                            setIsOptionsVisible(false);
                            setIsVideoPlaying(false);
                            console.log("Video ended");
                            console.log("isVideoPlaying", isVideoPlaying);
                            
                        };
                    }
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

    const proceedToNextQuestion = () => {
        if (!isAnswerAudioPlaying) {
            goToNextQuestion();
        }
    };

    // Function to proceed to the next question or loop back to the start
    const goToNextQuestion = () => {
        setIsCheckingAnswer(false);
        setSelectedAnswer(null);
        setAnswerState("initial");
        setCurrentQuestionIndex((prev) =>
            prev + 1 === triviaQuestions.length ? 0 : prev + 1
        );
    };

    // const checkAndProceed = () => {
    //         console.log("checkAndProceed");
    //         console.log("isAnswerAudioPlaying", isAnswerAudioPlaying);
    //         console.log("isVideoPlaying", isVideoPlaying);
    //     if (!isAnswerAudioPlaying && !isVideoPlaying) {
    //         proceedToNextQuestion();
    //     }
    //   };

    useEffect(() => {
    
            console.log("handleVideoEnd");
            console.log("isAnswerAudioPlaying", isAnswerAudioPlaying);
            console.log("isVideoPlaying", isVideoPlaying);
            
          if (!isAnswerAudioPlaying && !isVideoPlaying) {
            console.log("proceedToNextQuestion");
            
            proceedToNextQuestion();
          }
    
        return () => {
        };
      }, [isAnswerAudioPlaying, isVideoPlaying]);

    const handleAnswerSelect = (selectedKey: string, isAutoSelect = false) => {
        setIsCheckingAnswer(true);
        setSelectedAnswer(selectedKey);
        const currentQuestion =
            triviaQuestions[currentQuestionIndexRef.current];

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
                setIsAnswerAudioPlaying(true);
                // If the answer is correct and there's an audio_answer, play it after the feedback sound
                const answerSound = new Audio(
                    `audio/${triviaPath}/${currentQuestion.audio_answer}`
                );
                answerSound.play();
                answerSound.onended = () => {
                    setIsAnswerAudioPlaying(false);
                    console.log("finish answer");
                    
                };
            }
        };
    };

    return (
        <div className="text-center w-full h-screen flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-start w-full mt-12">
                {/* Index */}
                <div className="bg-gradient-to-b from-red-600 to-red-700 rounded-full w-20 h-20 flex items-center justify-center border-2 border-white shadow-lg text-white font-bold text-6xl ml-24">
                    {currentQuestionIndex + 1}
                </div>
            </div>
            {/* Video Section: Center the video in its designated area */}
            <div
                className={`flex justify-center items-center ${
                    isVideoCentered ? "h-full mt-24" : "h-1/2 -mt-28"
                }`}
            >
                <video
                    ref={videoRef}
                    className="border-8 border-white shadow-lg ml-8 my-2 rounded-lg"
                    style={{
                        maxWidth: "100%",
                        maxHeight: isVideoCentered ? "100%" : "80%", // Adjust size based on centered state
                        transition: "all 0.5s ease-in-out", // Smooth transition for resizing
                    }}
                >
                    {/* Video is dynamically loaded */}
                </video>
            </div>
            {/* Interactive Section: For Quiz Options and ProgressBar */}
            <div
                className="interactive-section flex-1"
                style={{ minHeight: "50%" }}
            >
                {/* Options and ProgressBar Container: Ensure consistent spacing */}
                <div
                    className="options-progress-container flex flex-col justify-between"
                    style={{ height: "100%" }}
                >
                    <div className="options-container grid grid-cols-2 gap-x-6 gap-y-6 w-3/4 p-9 mx-auto">
                        {isOptionsVisible &&
                            triviaQuestions[currentQuestionIndex].question &&
                            triviaQuestions[currentQuestionIndex].options?.map(
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
                                            triviaQuestions[
                                                currentQuestionIndex
                                            ].answer
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
                                            className="relative flex items-center justify-start my-2 mx-6 min-h-52"
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
                                                        handleAnswerSelect(
                                                            option.key
                                                        )
                                                    }
                                                    className="pl-36 pr-4 py-3 w-full min-h-40 text-5xl font-medium text-shadow-sm text-blue-600 bg-white rounded-full transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
                                                >
                                                    {option.text}
                                                </button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )
                            )}
                    </div>

                    <div
                        className="progress-bar-container flex justify-center items-center mb-16"
                        style={{
                            visibility: isProgressBarVisible
                                ? "visible"
                                : "hidden",
                        }}
                    >
                        <ProgressBar
                            index={currentQuestionIndex}
                            isProgressBarAnimating={isProgressBarAnimating}
                            timeLimit={timeLimit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuessWhatHappensQuiz;
