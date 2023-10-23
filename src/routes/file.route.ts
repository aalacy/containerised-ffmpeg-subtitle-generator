import express from "express";

import { fileController } from "../controllers/file.controller";

export const fileRouter = express.Router();

// upload media file
fileRouter.post("/upload", fileController.upload);

// generate video file
// fileRouter.post("/save-project", fileController.saveProject);



