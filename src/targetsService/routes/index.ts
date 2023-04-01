import express from "express";
import TargetHandler from "@/targetsService/handlers/targets.js";
import multer from "multer";

export const indexRouter = express.Router();

// const upload = multer({ dest: 'uploads/targetsService/' });
indexRouter.route("/targets")
	.get(TargetHandler.index)
	.post(TargetHandler.store);

indexRouter.route("/targets/:id")
	.get(TargetHandler.show)
	.patch(TargetHandler.update)
	.delete(TargetHandler.destroy);
