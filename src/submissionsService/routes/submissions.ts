import express from "express";
import multer from "multer";
import mime from "mime-types";
import TargetHandler from "@/submissionsService/handlers/targets.js";
import SubmissionHandler from "@/submissionsService/handlers/submissions.js";

export const submissionRouter = express.Router();

const storage = multer.diskStorage({
	destination: "uploads/submissionsService/",
	filename: function (req, file, cb) {
		const fileExtension = mime.extension(file.mimetype);
		cb(null, `${Date.now()}.${fileExtension}`);
	}
});

const upload = multer({storage});
submissionRouter.route("/targets/:targetId/submissions")
	.all(TargetHandler.getTarget)
	.get(SubmissionHandler.index)
	.post(upload.fields([{name: "photo"}]), SubmissionHandler.store);

// submissionRouter.route("/:id")
// 	.get(TargetHandler.show)
// 	.patch(TargetHandler.update)
// 	.delete(TargetHandler.destroy);
