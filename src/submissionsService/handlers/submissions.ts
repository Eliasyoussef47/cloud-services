import { RequestHandler, RouteParameters } from "express-serve-static-core";
import { ResponseBody } from "@/shared/types/Response.js";
import ServicesRegistry from "@/submissionsService/ServiceRegistry.js";
import { storeFilesSchema } from "@/shared/validation/targets.js";
import { promises as fs } from "fs";
import { toDataUrl } from "@/shared/utils/general.js";
import { Environment } from "@/shared/operation/Environment.js";
import crypto from "crypto";
import { z } from "zod";
import { Submission } from "@/submissionsService/models/Submission.js";
import { SubmissionPersistent } from "@/submissionsService/persistence/ISubmissionRepository.js";
import { GatewayJwtUser } from "@/auth/AuthServiceAlpha.js";
import { Target } from "@/submissionsService/models/Target.js";

export type RouteParams = Pick<Submission, "targetId">;

const storeBodySchema = z.object({
	userId: z.string()
});

export default class SubmissionHandler {
	public static index: RequestHandler = async (req, res) => {
		const user = req.user as GatewayJwtUser;
		const target = res.locals.target as Target;

		let submissions: SubmissionPersistent[];

		// TODO: The admin check can be replaced with a mongoose model method. Or simply a method in a plain old Javascript object.
		if (user.role == "admin" || user.customId == target.userId) {
			try {
				submissions = await ServicesRegistry.getInstance().submissionRepository.getByTargetId(target.customId);
			} catch (e) {
				console.error("Error while getting submissions.", e);
				throw e;
			}
		} else {
			const filter: Partial<Submission> = {
				userId: user.customId,
				targetId: target.customId
			};
			try {
				submissions = await ServicesRegistry.getInstance().submissionRepository.getByFiltered(filter);
			} catch (e) {
				console.error("Error while getting submissions.", e);
				throw e;
			}
		}

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

		let newSubmission: SubmissionPersistent;

		try {
			newSubmission = await ServicesRegistry.getInstance().submissionRepository.create({
				customId: crypto.randomUUID(),
				userId: reqBody.userId,
				targetId: res.locals.target.customId,
				source: fileUrl.toString(),
				base64Encoded: fileDataUrl
			});
		} catch (e) {
			console.error("Error while creating a submission.", e);
			throw e;
		}

		const responseBody = {
			status: "success",
			data: {
				customId: newSubmission.customId,
				source: newSubmission.source,
				createdAt: newSubmission.createdAt
			}
		} satisfies ResponseBody;

		res.json(responseBody);

		ServicesRegistry.getInstance().submissionsServiceMessageBroker.publishSubmissionTargetRequest(newSubmission.toObject());
	};

	public static show: RequestHandler<RouteParameters<"/submissions/:id">> = async (req, res) => {
		// TODO: Validate url params.

		const responseBody = {
			status: "success",
			data: {
				submission: res.locals.submission
			}
		} satisfies ResponseBody;

		res.json(responseBody);
	};

	public static destroy: RequestHandler<RouteParameters<"/submissions/:id">> = async (req, res) => {
		let deletionSuccess: boolean;
		try {
			deletionSuccess = await ServicesRegistry.getInstance().submissionRepository.deleteById(req.params.id);
		} catch (e) {
			console.error("Error while deleting a submission.", e);
			throw e;
		}

		const responseBody = {
			status: "success",
			data: {
				success: deletionSuccess
			}
		} satisfies ResponseBody;

		res.json(responseBody);
	};
}
