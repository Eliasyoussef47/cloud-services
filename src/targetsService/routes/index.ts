import express from "express";
import TargetHandler from "@/targetsService/handlers/targets.js";
import multer from "multer";

export const targetsRouter = express.Router();

const upload = multer({ dest: 'uploads/targetsService/' });
targetsRouter.route("/")
	.get(TargetHandler.index)
	.post(upload.single("photo"), TargetHandler.store);

targetsRouter.route("/:id")
	.get(TargetHandler.show)
	.patch(TargetHandler.update)
	.delete(TargetHandler.destroy);
