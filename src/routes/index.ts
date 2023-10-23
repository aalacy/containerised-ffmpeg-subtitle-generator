import express from "express";
import createError from "http-errors";

import { fileRouter } from "./file.route";

export const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Hello World!" });
});

router.use("/file", fileRouter);

router.use(async (req, res, next) => {
    next(createError.NotFound("Route not Found"));
  });
  
  router.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      status: false,
      message: err.message,
    });
  });