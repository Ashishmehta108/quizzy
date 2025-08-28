"use client";
import Timer from "@/components/timer/timer";
const QuizPage = () => {
    const handleTimeUp = () => {
        console.log("Time's up!");
    };

    return (
        <div>
            <h1>Quiz</h1>
            <Timer initialTime={300} onTimeUp={handleTimeUp} autoStart />
        </div>
    );
};



export default QuizPage