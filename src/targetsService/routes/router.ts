import express from "express";
import { targetsRouter } from "@/targetsService/routes/index.js";
import { rolesAuthorization } from "@/shared/authorization/index.js";

export const authenticatedRouter = express.Router();

authenticatedRouter.use(targetsRouter);
