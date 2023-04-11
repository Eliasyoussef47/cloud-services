import { RequestHandler, RouteParameters } from "express-serve-static-core";
import { stringWithValueSchema } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import ServicesRegistry from "@/submissionsService/ServiceRegistry.js";
import { SubmissionPersistent } from "@/submissionsService/persistence/ISubmissionRepository.js";

/**
 * Fetches the requested submission from the database and set it in res.locals.submission. This makes it possible for
 * subsequent handlers to get the submission.
 * @param req
 * @param res
 * @param next
 */
export const getSubmission: RequestHandler<RouteParameters<"/:id">> = async (req, res, next) => {
	const submissionIdParam = req.params.id;
	const submissionId = stringWithValueSchema.parse(submissionIdParam);

	let submissionInDb: SubmissionPersistent | null = null;
	try {
		submissionInDb = await ServicesRegistry.getInstance().submissionRepository.get(submissionId);
	} catch (e) {
		console.error("Error while getting a submission.", e);
	}

	if (!submissionInDb) {
		throw createHttpError(404);
	}

	res.locals.submission = submissionInDb.toObject();
	next();
};
