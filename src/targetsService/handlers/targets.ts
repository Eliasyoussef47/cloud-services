import { RequestHandler } from "express-serve-static-core";
import { ResponseBody } from "@/shared/types/Response.js";

export default class TargetHandler {
	public static index: RequestHandler = async (req, res) => {
		const responseBody = {
			status: "success",
			data: {
				message: "index"
			}
		} satisfies ResponseBody;

		res.json(responseBody);
	};

	public static store: RequestHandler = async (req, res) => {
		const responseBody = {
			status: "success",
			data: {
				message: "store",
				locationName: req.body["locationName"]
			}
		} satisfies ResponseBody;

		res.json(responseBody);
	};

	public static show: RequestHandler = async (req, res) => {
		const responseBody = {
			status: "success",
			data: {
				message: "show"
			}
		} satisfies ResponseBody;

		res.json(responseBody);
	};

	public static update: RequestHandler = async (req, res) => {
		const responseBody = {
			status: "success",
			data: {
				message: "update"
			}
		} satisfies ResponseBody;

		res.json(responseBody);
	};

	public static destroy: RequestHandler = async (req, res) => {
		const responseBody = {
			status: "success",
			data: {
				message: "destroy"
			}
		} satisfies ResponseBody;

		res.json(responseBody);
	};
}


