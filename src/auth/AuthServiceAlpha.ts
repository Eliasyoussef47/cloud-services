import { Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { JwtPayload } from "jsonwebtoken";
import { Environment } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import { AuthServiceBase } from "@/auth/AuthServiceBase.js";
import { NoUndefinedField, Optional } from "@/shared/types/utility.js";

export interface LoginForm {
	username: string;
	password: string;
}

export type UserJwtPayload = Required<Pick<JwtPayload, "iat" | "exp" | "sub">>;

export type GatewayJwtPayload = {
	key: string;
} & NoUndefinedField<Required<Pick<JwtPayload, "sub" | "iat">>>;

export type GatewayJwtPayloadManual = Optional<GatewayJwtPayload, "iat">;

/**
 * Responsible for authentication in microservices.
 */
export class AuthServiceAlpha extends AuthServiceBase {
	static #instance: AuthServiceAlpha | undefined;

	private readonly _authenticateGatewayStrategy: JwtStrategy;

	constructor(gatewayJwtOptions: StrategyOptions) {
		super(gatewayJwtOptions);

		this._authenticateGatewayStrategy = new JwtStrategy(this.gatewayJwtOptions, (payload, done) => {
			const verificationResult = this.verifyGatewayToken(payload);

			if (!verificationResult) {
				done(createHttpError(401), false);
			}

			done(null, {});
		});
	}

	public get authenticateGatewayStrategy(): JwtStrategy {
		return this._authenticateGatewayStrategy;
	}

	public static getInstance(): AuthServiceAlpha {
		return this.#instance!;
	}

	public static setInstance(value: AuthServiceAlpha) {
		this.#instance = value;
	}

	public static setup() {
		const gatewayJwtOptions = AuthServiceBase.getDefaultGatewayJwtOptions();

		this.setInstance(new AuthServiceAlpha(gatewayJwtOptions));
	}

	public verifyGatewayToken(payload: GatewayJwtPayload): boolean {
		return payload.key == Environment.getInstance().envFile.SERVICES_API_KEY;
	}
}
