import { createClient } from "redis";

const redisclient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  },
});

const connectRedis = async () => {
  try {
    await redisclient.connect();
  } catch (error) {
    console.error("Redis connection error:", error);
  }
};

connectRedis();
export { redisclient };
