declare module "connect-roles" {
	import { Request, RequestHandler, Response } from "express-serve-static-core";

	export declare type FailureHandler = (req: Request, res: Response, action: string) => void;

	export declare type Options = {
		failureHandler?: FailureHandler;
		async?: boolean;
		userProperty?: string;
		matchRelativePaths?: boolean;
	};

	declare type UseCallback = (req: Request, action?: string) => boolean | null | undefined;

	declare type Use = {
		(fn: UseCallback): void;
		(action: string, fn: UseCallback): void;
	};

	declare interface ConnectRoles {
		functionList: any[];
		failureHandler: FailureHandler;
		async: boolean;
		userProperty: string;
		matchRelativePaths: boolean;
		use: Use;
		middleware: (options?: Options) => RequestHandler;
		can(verb: string): RequestHandler;
		is(verb: string): RequestHandler;
	}

	declare interface ConnectRolesConstructor {
		readonly prototype: ConnectRoles;

		new(options?: Options): ConnectRoles;

		(options?: Options): ConnectRoles;
	}

	declare const ConnectRoles: ConnectRolesConstructor;

	export default ConnectRoles;
}
