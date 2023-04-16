import { ErrorRequestHandler, Request, RequestHandler } from "express-serve-static-core";
import { z } from "zod"
import createHttpError, { HttpError } from "http-errors";
import { ResponseBody, toStatusMessage } from "@/shared/types/Response.js";

export const errorSchema = z.object({
	name: z.string(),
	message: z.string(),
	stack: z.string().optional()
});

export const httpErrorSchema = errorSchema.extend({
	status: z.number(),
	statusCode: z.number(),
	expose: z.boolean(),
	headers: z.union([z.record(z.string()), z.undefined()]).optional()
}).passthrough();

export const zodErrorSchema = z.object({
	name: z.literal("ZodError")
}).passthrough();

export function isProd(req?: Request) {
	if (req) {
		return req.app.get("env") === "production";
	}

	return process.env.NODE_ENV === "production";
}

export const notFoundHandler: RequestHandler = () => {
	throw createHttpError(404);
};

export const convertToHttpError: ErrorRequestHandler = (err: Error, req, res, next) => {
	const errorParsingResult = httpErrorSchema.safeParse(err);
	if (errorParsingResult.success) {
		return next(err);
	}

	const zodErrorParsed = zodErrorSchema.safeParse(err);
	if (zodErrorParsed.success) {
		return next(createHttpError(422, { internalError: err }));
	}

	let createdError = createHttpError({ internalError: err });

	return next(createdError);
};

export const httpErrorHandler: ErrorRequestHandler = (err: HttpError, req, res, next) => {
	const errorParsingResult = httpErrorSchema.safeParse(err);
	if (!errorParsingResult.success) {
		next(err);
	}

	if (isProd(req)) {
		delete err.stack;
	}

	const responseBody = {
		status: toStatusMessage(err.statusCode),
		data: err,
	} as ResponseBody;

	res.status(err.statusCode).json(responseBody);
};

export const errorHandler: ErrorRequestHandler = (err: Error, req, res) => {
	if (isProd(req)) {
		delete err.stack;
	}

	// TODO: Define the return type.
	const responseBody = {
		status: "failure",
		data: err,
	} as ResponseBody;

	res.status(500).json(responseBody);
};
