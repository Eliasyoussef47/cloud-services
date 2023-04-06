import { RequestHandler } from "express-serve-static-core";
import { ResponseBody } from "@/shared/types/Response.js";
import ServicesRegistry from "@/submissionsService/ServiceRegistry.js";
import { storeFilesSchema } from "@/shared/validation/targets.js";
import { promises as fs } from "fs";
import { toDataUrl } from "@/shared/utils/general.js";
import { Environment } from "@/shared/operation/Environment.js";
import crypto from "crypto";
import { z } from "zod";

const storeBodySchema = z.object({
	userId: z.string()
});

export default class SubmissionHandler {
	public static index: RequestHandler = async (req, res) => {
		// TODO: User based authorization?
		const submissions = await ServicesRegistry.getInstance().submissionRepository.getByTargetId(res.locals.target.customId);

		const responseBody = {
			status: "success",
			data: {
				submissions: submissions
			}
		} satisfies ResponseBody;

		res.json(responseBody);
	};

	public static store: RequestHandler = async (req, res) => {
		const reqBody = storeBodySchema.parse(req.body);
		const uploadedFiles = storeFilesSchema.parse(req.files);
		const uploadedFile = uploadedFiles.photo[0];

		// Read the file again and convert it to base64.
		const readFile = await fs.readFile(uploadedFile.path);
		const fileDataUrl = toDataUrl(uploadedFile.mimetype, readFile);

		const fileUrl = new URL(uploadedFile.filename, Environment.getInstance().submissionUploadsUrl);
		const newSubmission = await ServicesRegistry.getInstance().submissionRepository.create({
			customId: crypto.randomUUID(),
			userId: reqBody.userId,
			targetId: res.locals.target.customId,
			source: fileUrl.toString(),
			base64Encoded: fileDataUrl
		});

		const responseBody = {
			status: "success",
			data: {
				customId: newSubmission.customId,
				source: newSubmission.source,
				createdAt: newSubmission.createdAt
			}
		} satisfies ResponseBody;

		res.json(responseBody);
	};
}
