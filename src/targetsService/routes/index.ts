import { RequestHandler } from "express-serve-static-core";
import { ResponseBody } from "@/shared/types/Response.js";

export const dummy: RequestHandler = (req, res) => {
	const responseBody = {
		status: "success",
		data: null
	} satisfies ResponseBody;

	res.json(responseBody);
};
