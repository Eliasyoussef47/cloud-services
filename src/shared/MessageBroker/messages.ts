import { ResponseBody, ServiceStatus } from "@/shared/types/Response.js";
import { Target } from "@/targetsService/models/Target.js";
import { toZod } from "tozod";
import { z } from "zod";
import { responseBodySchema } from "@/shared/validation/response.js";
import { User } from "@/auth/models/User.js";

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
});

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

export type TargetCreatedBody = Pick<Target, | "customId">;

export const targetCreatedBodySchema: toZod<TargetCreatedBody> = z.object({
	customId: z.string()
});

export type TargetCreatedMessage = MessageBrokerMessageBase<TargetCreatedBody, "created", "Target">;

export const targetCreatedMessageSchema = z.object({
	type: z.literal("Target"),
	status: z.literal("created"),
	data: targetCreatedBodySchema
});

export type MessageBrokerMessage =
	| UserCreatedMessage
	| TargetCreatedMessage
