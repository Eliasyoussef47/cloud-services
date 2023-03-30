import express from "express";
import TargetHandler from "@/apiGateway/handlers/targets.js";

export const targetsRouter = express.Router();
targetsRouter.route("/targets")
	.post(TargetHandler.post);
