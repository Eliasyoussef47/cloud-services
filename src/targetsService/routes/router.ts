import express from "express";
import { targetsRouter } from "@/targetsService/routes/index.js";

export const authenticatedRouter = express.Router();

authenticatedRouter.use(targetsRouter);
