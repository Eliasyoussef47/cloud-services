import express from "express";
import TargetHandler from "@/targetsService/handlers/targets.js";

export const targetsRouter = express.Router();
targetsRouter.route("/targets")
	.get(TargetHandler.index)
	.post(TargetHandler.store);
targetsRouter.route("/targets/:id")
	.get(TargetHandler.show)
	.patch(TargetHandler.update)
	.delete(TargetHandler.destroy);
