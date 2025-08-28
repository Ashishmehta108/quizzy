import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { createServer } from "http";
import { initSockets } from "./socket";

const PORT = process.env.PORT || 5000;

const server = createServer(app);

initSockets(server);

server.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
