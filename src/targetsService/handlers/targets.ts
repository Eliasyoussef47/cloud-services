import { RequestHandler } from "express-serve-static-core";
import { ResponseBody } from "@/shared/types/Response.js";
import { storeBodySchema, storeFilesSchema } from "@/shared/validation/targets.js";
import { Environment } from "@/shared/operation/Environment.js";

// TODO: Validation.
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
		// TODO: Better validation is possible.
		const reqBody = storeBodySchema.parse(req.body);
		const uploadedFiles = storeFilesSchema.parse(req.files);
		const uploadedFile = uploadedFiles.photo[0];

		const fileUrl = new URL(uploadedFile.filename, Environment.getInstance().targetUploadsUrl);

		const responseBody = {
			status: "success",
			data: {
				message: "store",
				locationName: reqBody.locationName,
				photo: fileUrl.toString()
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


