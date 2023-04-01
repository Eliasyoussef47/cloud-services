import express from "express";
import TargetHandler from "@/apiGateway/handlers/targets.js";
import multer from "multer";

export const targetsRouter = express.Router();
const upload = multer({ dest: 'uploads/apiGateway/' });

targetsRouter.route("/targets")
	.post(upload.single("photo"), TargetHandler.store);
