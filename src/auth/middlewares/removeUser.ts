import { RequestHandler } from "express-serve-static-core";
import ServicesRegistry from "@/auth/ServicesRegistry.js";

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
