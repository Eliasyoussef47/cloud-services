import { RequestHandler } from "express-serve-static-core";
import { AsyncRequestHandler } from "@/types/express/index.js";

// TODO: Probably no longer needed.
export const asyncRequestHandlerWrapper = (requestHandler: RequestHandler): AsyncRequestHandler => {
	return async (req, res, next): Promise<void> => {
		return requestHandler(req, res, next);
			// .then((r) => {
			//
			// })
			// .catch((e) => {
			//
			// });
	};
};
