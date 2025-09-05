import { io } from "@/server"; // your socket.io instance
import { asyncHandler } from "@/utils/asyncHandler";
import { Router } from "express";

const dummyRouter = Router();

dummyRouter.route("/dummy").post(
  asyncHandler(async (req, res) => {
    // Dummy sequence of events
    const steps = [
      { event: "status", message: "Auth done" },
      { event: "status", message: "Uploaded file" },
      { event: "status", message: "Agent created" },
      { event: "status", message: "Quiz created" },
      { event: "status", message: "Completed" },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        // Broadcast to all connected clients
        io.emit(step.event, { message: step.message, step: index + 1 });
      }, index * 1000); // 1 second apart
    });

    res.json({ success: true, message: "Dummy events triggered" });
  })
);

export default dummyRouter;
