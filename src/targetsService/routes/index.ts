import { RequestHandler } from "express-serve-static-core";
import { ResponseBody } from "@/shared/types/Response.js";

export const dummyPost: RequestHandler = (req, res) => {
	const responseBody = {
		status: "success",
		data: null
	} satisfies ResponseBody;

	res.json(responseBody);
};
