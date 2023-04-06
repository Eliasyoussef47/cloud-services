import { Submission } from "@/submissionsService/models/Submission.js";
import { Target } from "@/targetsService/models/Target.js";
import z from "zod";
import { toZod } from "tozod";

interface RequestLine {
	method: string;
	requestUri: string;
}

export interface RpcRequest<BodyT extends object | null = null> {
	request: RequestLine;
	body: BodyT;
}

interface StatusLine {
	statusCode: number;
	statusText: string;
}

export interface RpcResponse<BodyT extends object | null = null> {
	status: StatusLine;
	body: BodyT;
}

export type TargetRpcRequest = RpcRequest<Submission>;

export const requestLineSchema: toZod<RequestLine> = z.object({
	method: z.string(),
	requestUri: z.string()
});

export const rpcRequestSchema = z.object({
	request: requestLineSchema,
	body: z.object({}).passthrough().nullable()
});

export const customSubmissionBodySchema = z.custom<Submission>((val) => {
	return z.object({}).passthrough().nullable().safeParse(val).success
});

export const targetRpcRequestSchema = rpcRequestSchema.extend({
	// Fake validation.
	body: customSubmissionBodySchema
}).passthrough();

export const statusLineSchema: toZod<StatusLine> = z.object({
	statusCode: z.number(),
	statusText: z.string()
});

export const rpcResponseSchema = z.object({
	status: statusLineSchema,
	body: z.object({}).passthrough().nullable()
});

export type TargetRpcResponseBody = {
	target: Target;
	submission: Submission;
};

export type TargetRpcResponse = RpcResponse<TargetRpcResponseBody>;
