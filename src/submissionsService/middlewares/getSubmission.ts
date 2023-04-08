import { RequestHandler, RouteParameters } from "express-serve-static-core";
import { stringWithValueSchema } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import ServicesRegistry from "@/submissionsService/ServiceRegistry.js";

/**
 * Fetches the requested target from the database and set it in res.locals.target. This makes it possible for
 * subsequent handlers to get the target.
 * @param req
 * @param res
 * @param next
 */
export const getSubmission: RequestHandler<RouteParameters<"/:id">> = async (req, res, next) => {
	const submissionIdParam = req.params.id;
	const submissionId = stringWithValueSchema.parse(submissionIdParam);

	const submissionInDb = await ServicesRegistry.getInstance().submissionRepository.get(submissionId);

	if (!submissionInDb) {
		throw createHttpError(404);
	}

	res.locals.submission = submissionInDb.toObject();
	next();
};