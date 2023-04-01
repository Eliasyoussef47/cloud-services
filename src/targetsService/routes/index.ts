import express from "express";
import TargetHandler from "@/targetsService/handlers/targets.js";
import multer from "multer";
import mime from "mime-types";

export const targetsRouter = express.Router();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/targetsService/");
	},
	filename: function (req, file, cb) {
		const fileExtension = mime.extension(file.mimetype);
		cb(null, `${Date.now()}.${fileExtension}`);
	}
});

const upload = multer({ storage: storage });
targetsRouter.route("/targets")
	.get(TargetHandler.index)
	.post(upload.single("photo"), TargetHandler.store);

targetsRouter.route("/targets/:id")
	.get(TargetHandler.show)
	.patch(TargetHandler.update)
	.delete(TargetHandler.destroy);
