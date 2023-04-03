import express from "express";
import TargetHandler from "@/targetsService/handlers/targets.js";
import multer from "multer";
import mime from "mime-types";

export const targetsRouter = express.Router();

const storage = multer.diskStorage({
	destination: "uploads/targetsService/",
	filename: function (req, file, cb) {
		const fileExtension = mime.extension(file.mimetype);
		cb(null, `${Date.now()}.${fileExtension}`);
	}
});

const upload = multer({storage});
targetsRouter.route("/")
	.get(TargetHandler.index)
	.post(upload.fields([{name: "photo"}]), TargetHandler.store);

targetsRouter.route("/:id")
	.get(TargetHandler.show)
	.patch(TargetHandler.update)
	.delete(TargetHandler.destroy);
