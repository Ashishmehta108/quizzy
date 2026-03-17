"use client";
import Timer from "@/components/timer/timer";
const QuizPage = () => {
    const handleTimeUp = () => {
        console.log("Time's up!");
    };

    return (
        <div>
            <h1>Quiz</h1>
            <Timer quizId="test-quiz" duration={300} onTimeUp={handleTimeUp} />
        </div>
    );
};



export default QuizPage