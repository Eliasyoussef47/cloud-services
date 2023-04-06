import express from "express";
import { submissionRouter } from "@/submissionsService/routes/submissions.js";

export const authenticatedRouter = express.Router();

authenticatedRouter.use(submissionRouter);
