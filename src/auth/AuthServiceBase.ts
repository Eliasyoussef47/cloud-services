import { ExtractJwt, StrategyOptions } from "passport-jwt";
import { Environment } from "@/shared/operation/Environment.js";

export class AuthServiceBase {
	protected readonly _gatewayJwtOptions: StrategyOptions;

	constructor(gatewayJwtOptions: StrategyOptions) {
		this._gatewayJwtOptions = gatewayJwtOptions;
	}

	public get gatewayJwtOptions(): StrategyOptions {
		return this._gatewayJwtOptions;
	}

	public static getDefaultUserJwtOptions() {
		return {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: Environment.getInstance().envFile.JWT_USERS_SECRET
		} satisfies StrategyOptions;
	}

	public static getDefaultGatewayJwtOptions() {
		return {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: Environment.getInstance().envFile.JWT_GATEWAY_SECRET
		} satisfies StrategyOptions;
	}
}
