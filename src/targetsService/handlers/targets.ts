import { RequestHandler } from "express-serve-static-core";
import { ResponseBody } from "@/shared/types/Response.js";
import { storeBodySchema as baseStoreBodySchema, storeFilesSchema } from "@/shared/validation/targets.js";
import { Environment } from "@/shared/operation/Environment.js";
import { Target } from "@/targetsService/models/Target.js";
import ServicesRegistry from "@/targetsService/ServiceRegistry.js";
import { z } from "zod";
import { toZod } from "tozod";
import crypto from "crypto";
import { promises as fs } from "fs";
import { StoreBody } from "@/shared/types/targetsService/index.js";
import { toDataUrl } from "@/shared/utils/general.js";

const storeBodySchema: toZod<StoreBody> = baseStoreBodySchema.extend({
	userId: z.string()
});

export type StoreResponseBody = Pick<Target, "customId" | "source" | "locationName" | "createdAt">;

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

		// Read the file again and convert it to base64.
		const readFile = await fs.readFile(uploadedFile.path);
		const fileDataUrl = toDataUrl(uploadedFile.mimetype, readFile);

		const fileUrl = new URL(uploadedFile.filename, Environment.getInstance().targetUploadsUrl);
		const newTarget = await ServicesRegistry.getInstance().targetRepository.create({
			customId: crypto.randomUUID(),
			userId: reqBody.userId,
			source: fileUrl.toString(),
			base64Encoded: fileDataUrl,
			locationName: reqBody.locationName
		});

		const responseBody = {
			status: "success",
			data: {
				customId: newTarget.customId,
				source: newTarget.source,
				locationName: newTarget.locationName,
				createdAt: newTarget.createdAt
			}
		} satisfies ResponseBody<StoreResponseBody>;

		res.json(responseBody);

		// TODO: Publish message to message broker.
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


