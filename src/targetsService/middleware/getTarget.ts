import { RequestHandler, RouteParameters } from "express-serve-static-core";
import { stringWithValueSchema } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import ServicesRegistry from "@/targetsService/ServiceRegistry.js";
import { TargetPersistent } from "@/targetsService/persistence/ITargetRepository.js";

/**
 * Fetches the requested target from the database and set it in res.locals.target. This makes it possible for
 * subsequent handlers to get the target.
 * @param req
 * @param res
 * @param next
 */
export const getTarget: RequestHandler<RouteParameters<"/targets/:id">> = async (req, res, next) => {
	const targetIdParam = req.params.id;
	const targetId = stringWithValueSchema.parse(targetIdParam);

	let targetInDb: TargetPersistent | null = null;
	try {
		targetInDb = await ServicesRegistry.getInstance().targetRepository.get(targetId);
	} catch (e) {
		console.error("Error while getting a target.", e);
	}

	if (!targetInDb) {
		throw createHttpError(404);
	}

	res.locals.target = targetInDb.toObject();
	next();
};
