import express from "express";
import multer from "multer";
import SubmissionHandler from "@/apiGateway/handlers/submissions.js";
import { getTargetsSubmissionsRoute } from "@/submissionsService/routes/submissions.js";

const getRouter = () => {
	const submissionsRouter = express.Router();

	const upload = multer();
	const handler = new SubmissionHandler();

	submissionsRouter.route("/submissions/:id")
		.get(handler.show)
		.delete(handler.destroy);

	// "/targets/:targetId/submissions"
	submissionsRouter.route(getTargetsSubmissionsRoute(":targetId"))
		.get(handler.index)
		.post(upload.fields([{ name: "photo" }]), handler.store);

	return submissionsRouter;
};

export default getRouter;
