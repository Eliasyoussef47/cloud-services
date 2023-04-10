import { RequestHandler } from "express-serve-static-core";
import { z } from "zod";

export const makeValidatedRouteHandler =
	<TParams, TBody, TQuery>(
		callback: RequestHandler<TParams, any, TBody, TQuery>,
		paramsSchema?: z.Schema<TParams> | null,
		bodySchema?: z.Schema<TBody> | null,
		querySchema?: z.Schema<TQuery> | null
	) => {
		const result: RequestHandler<TParams, any, TBody, TQuery> = async (req, res, next) => {
			await paramsSchema?.parseAsync(req.params);
			await bodySchema?.parseAsync(req.body);
			await querySchema?.parseAsync(req.query);

			return callback(req, res, next);
		};

		return result;
	};
