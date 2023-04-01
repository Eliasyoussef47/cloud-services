import express from "express";
import { indexRouter } from "@/targetsService/routes/index.js";

export const authenticatedRouter = express.Router();

authenticatedRouter.use(indexRouter);
