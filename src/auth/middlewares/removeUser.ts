import { RequestHandler } from "express-serve-static-core";
import ServicesRegistry from "@/auth/ServicesRegistry.js";

/**
 * Removes the user from ServicesRegistry after the request is sent. This is done to prevent old users staying in the
 * memory.
 * @param req
 * @param res
 * @param next
 */
export const removeUser: RequestHandler = (req, res, next) => {
	function afterResponse() {
		res.removeListener('finish', afterResponse);
		res.removeListener('close', afterResponse);

		ServicesRegistry.getInstance().user = undefined;
	}

	res.on('finish', afterResponse);
	res.on('close', afterResponse);

	next();
};
