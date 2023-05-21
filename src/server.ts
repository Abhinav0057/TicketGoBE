import http from "http";

import { app } from "./app";
import { AppDataSource } from "./database/config";

const server = http.createServer(app);


server.listen(process.env.PORT, async () => {

  try {
    await AppDataSource.initialize();
    console.log("DB connected");
    console.log("connected to server", process.env.PORT);
  } catch (e) {
    console.log("Some Error Occurred", e);
  }
});

process.on("unhandledRejection", (err: any) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...", err);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
