/**
 * Fetches the requested target from the database and set it in res.locals.target. This makes it possible for
 * subsequent handlers to get the target.
 * @param req
 * @param res
 * @param next
 */
import { RequestHandler, RouteParameters } from "express-serve-static-core";
import { stringWithValueSchema } from "@/shared/operation/Environment.js";
import ServicesRegistry from "@/submissionsService/ServiceRegistry.js";
import createHttpError from "http-errors";

export const getTarget: RequestHandler<RouteParameters<"/targets/:targetId/submissions">> = async (req, res, next) => {
	const targetIdParam = req.params.targetId;
	const targetId = stringWithValueSchema.parse(targetIdParam);

	const targetInDb = await ServicesRegistry.getInstance().targetRepository.get(targetId);

	if (!targetInDb) {
		throw createHttpError(404);
	}

	res.locals.target = targetInDb.toObject();
	next();
};
