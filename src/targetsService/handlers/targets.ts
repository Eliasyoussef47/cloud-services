import { RequestHandler } from "express-serve-static-core";
import { ResourceFilter, ResponseBody } from "@/shared/types/Response.js";
import { storeBodySchema as baseStoreBodySchema, storeFilesSchema } from "@/shared/validation/targets.js";
import { Environment } from "@/shared/operation/Environment.js";
import { Target } from "@/targetsService/models/Target.js";
import ServicesRegistry from "@/targetsService/ServiceRegistry.js";
import { z } from "zod";
import { toZod } from "tozod";
import crypto from "crypto";
import { promises as fs } from "fs";
import { StoreBody } from "@/shared/types/targetsService/index.js";
import { preferTrue, toDataUrl } from "@/shared/utils/general.js";
import { TargetCreatedBody, TargetDeletedBody } from "@/shared/MessageBroker/messages.js";
import { TargetPersistent } from "@/targetsService/persistence/ITargetRepository.js";
import { ChangeTypes } from "@/shared/types/utility.js";
import { createTargetResourceSchema, PartialTarget } from "@/targetsService/resources/Target.js";
import createHttpError from "http-errors";

const storeBodySchema: toZod<StoreBody> = baseStoreBodySchema.extend({
	userId: z.string()
});

export type StoreResponseBody = Pick<Target, "customId" | "source" | "locationName" | "createdAt">;
export type ShowResponseBody = ResponseBody<{ target: PartialTarget }>;
export type IndexResponseBody = ResponseBody<{ targets: PartialTarget[] }>;

// TODO: Expand to accept searching based on location.
export type ShowQueries = ChangeTypes<Partial<Target>, string>;
export type IndexQueries = ShowQueries & {
	locationNameQ?: string;
}


// TODO: Validation.
export default class TargetHandler {
	public static index: RequestHandler<{}, {}, {}, ShowQueries> = async (req, res) => {
		let targets: TargetPersistent[] = [];

		try {
			targets = await ServicesRegistry.getInstance().targetRepository.getAll();
		} catch (e) {
			console.error("Error while getting a all targets.", e);
			throw e;
		}

		const resourceFilter = {
			customId: preferTrue(req.query.customId),
			userId: preferTrue(req.query.userId),
			source: preferTrue(req.query.source),
			base64Encoded: preferTrue(req.query.base64Encoded),
			locationName: preferTrue(req.query.locationName),
			externalUploadId: preferTrue(req.query.externalUploadId),
			createdAt: preferTrue(req.query.createdAt),
			updatedAt: preferTrue(req.query.updatedAt),
		} satisfies ResourceFilter<PartialTarget>;

		const resourceSchema = createTargetResourceSchema(resourceFilter);
		const resourceArray = z.array(resourceSchema);
		const parseResult = resourceArray.safeParse(targets);

		if (!parseResult.success) {
			console.error("Parsing target failed.", parseResult.error);
			throw createHttpError(500);
		}

		const responseBody = {
			status: "success",
			data: {
				targets: parseResult.data
			}
		} satisfies IndexResponseBody;

		res.json(responseBody);
	};

	public static store: RequestHandler = async (req, res) => {
		const reqBody = storeBodySchema.parse(req.body);
		const uploadedFiles = storeFilesSchema.parse(req.files);
		const uploadedFile = uploadedFiles.photo[0];

		// Read the file again and convert it to base64.
		const readFile = await fs.readFile(uploadedFile.path);
		const fileDataUrl = toDataUrl(uploadedFile.mimetype, readFile);

		const fileUrl = new URL(uploadedFile.filename, Environment.getInstance().targetUploadsUrl);

		let newTarget: TargetPersistent;
		try {
			newTarget = await ServicesRegistry.getInstance().targetRepository.create({
				customId: crypto.randomUUID(),
				userId: reqBody.userId,
				source: fileUrl.toString(),
				base64Encoded: fileDataUrl,
				locationName: reqBody.locationName
			});
		} catch (e) {
			console.error("Error while creating a target.", e);
			throw e;
		}

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

		const messageBody: TargetCreatedBody = {
			customId: newTarget.customId,
			userId: newTarget.userId
		};

		ServicesRegistry.getInstance().targetsServiceMessageBroker.publishTargetCreated(messageBody);
	};

	// TODO: Validate url param.
	public static show: RequestHandler<"/:id", {}, {}, ShowQueries> = async (req, res) => {
		const target = res.locals.target as Target;

		const resourceFilter = {
			customId: preferTrue(req.query.customId),
			userId: preferTrue(req.query.userId),
			source: preferTrue(req.query.source),
			base64Encoded: preferTrue(req.query.base64Encoded),
			locationName: preferTrue(req.query.locationName),
			externalUploadId: preferTrue(req.query.externalUploadId),
			createdAt: preferTrue(req.query.createdAt),
			updatedAt: preferTrue(req.query.updatedAt),
		} satisfies ResourceFilter<PartialTarget>;

		const resourceSchema = createTargetResourceSchema(resourceFilter);
		const parseResult = resourceSchema.safeParse(target);

		if (!parseResult.success) {
			console.error("Parsing target failed.", parseResult.error);
			throw createHttpError(500);
		}

		const responseBody = {
			status: "success",
			data: {
				target: parseResult.data
			}
		} satisfies ShowResponseBody;

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
		let deletionSuccess: boolean = false;
		try {
			deletionSuccess = await ServicesRegistry.getInstance().targetRepository.deleteById(req.params.id);
		} catch (e) {
			console.error("Error while deleting a target.", e);
			throw e;
		}

		const responseBody = {
			status: "success",
			data: {
				success: deletionSuccess
			}
		} satisfies ResponseBody;

		res.json(responseBody);

		const messageBody: TargetDeletedBody = {
			customId: req.params.id
		};

		ServicesRegistry.getInstance().targetsServiceMessageBroker.publishTargetDeleted(messageBody);
	};
}


