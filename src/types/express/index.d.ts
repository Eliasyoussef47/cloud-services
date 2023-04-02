import { NextFunction, ParamsDictionary, RequestHandler } from "express-serve-static-core";
import { ParsedQs } from "qs";

export type AsyncRequestHandler<
	P = ParamsDictionary,
	ResBody = any,
	ReqBody = any,
	ReqQuery = ParsedQs,
	LocalsObj extends Record<string, any> = Record<string, any>
> = RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj> & {
	(
		req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
		res: Response<ResBody, LocalsObj>,
		next: NextFunction,
	): Promise<void>;
};
