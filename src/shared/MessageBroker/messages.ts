import { ResponseBody, ServiceStatus } from "@/shared/types/Response.js";
import { Target } from "@/targetsService/models/Target.js";
import { toZod } from "tozod";
import { z } from "zod";
import { responseBodySchema } from "@/shared/validation/response.js";
import { User } from "@/auth/models/User.js";
import { Submission } from "@/submissionsService/models/Submission.js";

export const resourceTypes = ["User", "Target", "Submission"] as const;
export type ResourceType = typeof resourceTypes[number];

const isResourceTypeValidator = (val: unknown) => {
	let valString: string;
	try {
		let valStringTemp = val?.toString();
		if (!valStringTemp) {
			return false;
		}
		valString = valStringTemp;
	} catch (e) {
		return false;
	}
	return resourceTypes.includes(<ResourceType> valString);
};

const resourceTypeSchema = z.custom<ResourceType>(() => {
	return z.string().refine(isResourceTypeValidator);
}) satisfies z.Schema<ResourceType>;

// TODO: Status isn't enforced.
export interface MessageBrokerMessageBase<DataT extends object | null, TStatus extends ServiceStatus, TResource extends ResourceType> extends ResponseBody<DataT> {
	type: TResource;
}

export const messageBrokerMessageBaseSchema = responseBodySchema.extend({
	type: resourceTypeSchema
}).passthrough();

export type UserCreatedBody = Pick<User, | "customId">;

export const userCreatedBodySchema: toZod<UserCreatedBody> = z.object({
	customId: z.string()
});

export type UserCreatedMessage = MessageBrokerMessageBase<UserCreatedBody, "created", "User">;

export const userCreatedMessageSchema = responseBodySchema.extend({
	type: z.literal("User"),
	status: z.literal("created"),
	data: userCreatedBodySchema
});

export type TargetCreatedBody = Pick<Target, | "customId" | "userId">;

export const targetCreatedBodySchema: toZod<TargetCreatedBody> = z.object({
	customId: z.string(),
	userId: z.string()
});

export type TargetCreatedMessage = MessageBrokerMessageBase<TargetCreatedBody, "created", "Target">;

export const targetCreatedMessageSchema = responseBodySchema.extend({
	type: z.literal("Target"),
	status: z.literal("created"),
	data: targetCreatedBodySchema
});

export type TargetDeletedBody = Pick<Target, "customId">

export const targetDeletedBodySchema: toZod<TargetDeletedBody> = z.object({
	customId: z.string()
});

export type TargetDeletedMessage = MessageBrokerMessageBase<TargetDeletedBody, "deleted", "Target">;

export const targetDeletedMessageSchema = responseBodySchema.extend({
	type: z.literal("Target"),
	status: z.literal("deleted"),
	data: targetDeletedBodySchema
});

export type MessageBrokerMessage =
	| UserCreatedMessage
	| TargetCreatedMessage
	| TargetDeletedMessage;

export interface ScoreCalculationRequest {
	submission: Submission,
	target: Target
}

export type ScoreCalculationRequestMessage = MessageBrokerMessageBase<ScoreCalculationRequest, "scoreCalculationRequested", "Submission">;

export interface ScoreCalculationResponse {
	submission: Pick<Submission, "customId" | "score">,
	target: Pick<Target, "customId">
}

export type ScoreCalculationResponseMessage = MessageBrokerMessageBase<ScoreCalculationResponse, "scoreCalculated", "Submission">;

export const scoreCalculatedBodySchema: toZod<ScoreCalculationResponse> = z.object({
	submission: z.object({
		customId: z.string(),
		score: z.number().nullable()
	}),
	target: z.object({
		customId: z.string()
	})
});

export const scoreCalculationResponseSchema = responseBodySchema.extend({
	type: z.literal("Submission"),
	status: z.literal("scoreCalculated"),
	data: scoreCalculatedBodySchema
});
