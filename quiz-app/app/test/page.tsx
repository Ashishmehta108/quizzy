"use client";

import { Button } from "@/components/ui/button";

// // import api from "@/lib/api";
// // import { Quiz } from "@/lib/types";
// // import { Marquee } from "@/components/magicui/marquee";

// // export default function Test() {

// //   return (
// //     <Marquee>
// //       <span>Next.js</span>
// //       <span>React</span>
// //       <span>TypeScript</span>
// //       <span>Tailwind CSS</span>
// //     </Marquee>
// //   );
// // }

// "use client";

// import axios from "axios";
// import { useAuth } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";
// export default function Test() {
//   const { getToken } = useAuth();
//   const sendbackend = async () => {
//     const token = await getToken();
//     console.log(token);
//     const res = await axios.get("http://localhost:5000/user", {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       withCredentials: true,
//     });
//     console.log(res.data);
//   };

//   return (
//     <div>
//       <Button onClick={sendbackend}>Test</Button>
//     </div>
//   );
// }'

// "use client";

// import { useState } from "react";
// import Timer from "@/components/timer/timer";
// import { useSocket } from "@/app/context/socket.context";

// const QuizPage = () => {
//   const { startQuiz, endQuiz, socket } = useSocket();
//   const [quizStarted, setQuizStarted] = useState(false);
//   const quizId = "quiz_001";
//   const duration = 3 * 60; // 3 minutes in seconds

//   const handleStart = () => {
//     startQuiz(quizId, duration);
//     setQuizStarted(true);
//   };

//   const handleEnd = () => {
//     endQuiz(quizId);
//     setQuizStarted(false);
//   };

//   const handleTimeUp = () => {
//     alert("Time is up! Quiz ended.");
//     setQuizStarted(false);
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">3-Minute Quiz Simulation</h1>

//       {!quizStarted && (
//         <button
//           onClick={handleStart}
//           className="px-4 py-2 bg-blue-500 text-white rounded"
//         >
//           Start Quiz
//         </button>
//       )}

//       {quizStarted && (
//         <>
//           <Timer
//             quizId={quizId}
//             duration={duration}
//             onTimeUp={handleTimeUp}
//           />
//           <button
//             onClick={handleEnd}
//             className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
//           >
//             End Quiz
//           </button>
//         </>
//       )}

//       <p className="mt-4">Socket connected: {socket?.connected ? "Yes" : "No"}</p>
//     </div>
//   );
// };

// export default QuizPage;

export default function Test() {
  return (
    <Button
      onClick={async () => {
        const session = await fetch("http://localhost:5000/health", {
          credentials: "include",
        });
        console.log(await session.json());
      }}
    >
      Click me for session check
    </Button>
  );
}
