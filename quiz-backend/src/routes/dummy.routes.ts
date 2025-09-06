import { io } from "../server";
import { asyncHandler } from "../utils/asyncHandler";
import { Router } from "express";

const dummyRouter = Router();

dummyRouter.route("/dummy").post(
  asyncHandler(async (req, res) => {
    const steps = [
      { event: "status", message: "Auth done" },
      { event: "status", message: "Uploaded file" },
      { event: "status", message: "Agent created" },
      { event: "status", message: "Quiz created" },
      { event: "status", message: "Completed" },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        io.emit(step.event, { message: step.message, step: index + 1 });
      }, index * 1000);
    });

    res.json({ success: true, message: "Dummy events triggered" });
  })
);

export default dummyRouter;
