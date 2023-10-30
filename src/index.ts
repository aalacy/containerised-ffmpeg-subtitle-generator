import express from "express";
import compression from "compression";
import cors from "cors";
import createError from "http-errors";

import { setupSocket } from "./setup";
import { JOB_FILE_UPLOAD, JOB_GENERATE_VIDEO } from "./utils";
import fileUploader from "./jobs/file-uploader";
import videoGenerator from "./jobs/video-generator";

const app = express();

// Enable gzip compression
app.use(compression());
app.use(cors());
app.use(express.json());

const [socket, server] = setupSocket(app);

app.get("/", (req, res) => {
  res.json({ message: "hello" });
});

app.post("/file", async (req, res, next) => {
  try {
    const { job } = req.body;
    if (job === JOB_FILE_UPLOAD) {
      await fileUploader(req, socket);
    } else if (job === JOB_GENERATE_VIDEO) {
      await videoGenerator(req, socket);
    }
    res.json({ message: "Uploading a file..." });
  } catch (error) {
    console.log("[error][upload]", error);
    if (error) {
      next(error);
    }
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});
app.use(async (req, res, next) => {
  next(createError.NotFound("Route not Found"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: false,
    message: err.message,
  });
});

server.listen(8000, () => {
  console.log(`server running on port 8000`);
});
