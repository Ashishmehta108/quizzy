import { useEffect, useRef } from "react";
import { useSocket } from "@/app/context/socket.context";

interface TimerProps {
    quizId: string;
    duration: number;
    onTimeUp?: () => void;
}

const Timer: React.FC<TimerProps> = ({ quizId, duration, onTimeUp }) => {
    const { timeLeft } = useSocket();
    const hasTimeUpTriggered = useRef(false);

    const remaining = timeLeft[quizId];

    // Call onTimeUp only once when timer actually reaches 0
    useEffect(() => {
        if (remaining === 0 && !hasTimeUpTriggered.current) {
            hasTimeUpTriggered.current = true;
            onTimeUp?.();
        }
    }, [remaining, onTimeUp]);

    // If timer hasn't started yet, show full duration
    const displayTime = remaining === undefined ? duration : remaining;
    const minutes = String(Math.floor(displayTime / 60)).padStart(2, "0");
    const seconds = String(displayTime % 60).padStart(2, "0");

    return <div>{minutes}:{seconds}</div>;
};

export default Timer;
