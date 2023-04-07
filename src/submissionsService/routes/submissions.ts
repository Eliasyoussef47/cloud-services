import express from "express";
import multer from "multer";
import mime from "mime-types";
import SubmissionHandler from "@/submissionsService/handlers/submissions.js";
import { getTarget } from "@/submissionsService/middlewares/getTarget.js";

export const submissionRouter = express.Router();

const storage = multer.diskStorage({
	destination: "uploads/submissionsService/",
	filename: function (req, file, cb) {
		const fileExtension = mime.extension(file.mimetype);
		cb(null, `${Date.now()}.${fileExtension}`);
	}
});

export type SubmissionsRoute<T extends string = "targetId"> = `/targets/${T}/submissions`;

export function getSubmissionsRoute<T extends string>(param: T): SubmissionsRoute<T> {
	return `/targets/${param}/submissions`;
}

const upload = multer({ storage });
submissionRouter.route(getSubmissionsRoute(":targetId"))
	.all(getTarget)
	.get(SubmissionHandler.index)
	.post(upload.fields([{ name: "photo" }]), SubmissionHandler.store);

// submissionRouter.route("/:id")
// 	.get(TargetHandler.show)
// 	.patch(TargetHandler.update)
// 	.delete(TargetHandler.destroy);
