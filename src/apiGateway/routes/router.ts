import express from "express";
import { targetsRouter } from "@/apiGateway/routes/targets.js";
import { authenticationRouter } from "@/apiGateway/routes/authentication.js";

export const nonAuthenticatedRouter = express.Router();

nonAuthenticatedRouter.use(authenticationRouter);

export const authenticatedRouter = express.Router();

authenticatedRouter.use(targetsRouter);
