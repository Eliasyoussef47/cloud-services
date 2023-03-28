import crypto from "crypto";
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Environment } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";

export interface User {
	id: string;
	customId: string;
	username: string;
	password: string;
}

export interface LoginForm {
	username: string;
	password: string;
}

// TODO: Add expiration date.
export type UserJwtPayload = Pick<JwtPayload, "iat" | "exp" | "sub">

export type GatewayJwtPayload = {
	key: string;
} & Pick<JwtPayload, "iat">;

// TODO: Remove temp database.
const users: Array<User> = [
	{
		id: "420",
		customId: "456",
		username: "elias",
		password: "jeff"
	}
];

export class AuthService {
	static #instance: AuthService | undefined;

	private static readonly _saltSize = 16;

	private static readonly _iterations = 1000;

	private static readonly _keyLength = 64;

	private static readonly _digest = "sha512";

	private static readonly _encoding = "hex";

	private readonly _userJwtOptions: StrategyOptions;

	private readonly _gatewayJwtOptions: StrategyOptions;

	private readonly _authenticateUserStrategy: JwtStrategy;

	private readonly _authenticateGatewayStrategy: JwtStrategy;

	private readonly jwtExpiresIn: number = 10800;

	constructor(userJwtOptions: StrategyOptions, gatewayJwtOptions: StrategyOptions) {
		this.jwtExpiresIn = Environment.getInstance().envFile.JWT_EXPIRES_IN;
		this._userJwtOptions = userJwtOptions;
		this._gatewayJwtOptions = gatewayJwtOptions;

		this._authenticateUserStrategy = new JwtStrategy(this.userJwtOptions, (payload, done) => {
			this.getMatchingUser(payload)
				.then((value) => {
					return done(null, value);
				})
				.catch((e) => {
					done(createHttpError(401, e), false);
				});
		});

		this._authenticateGatewayStrategy = new JwtStrategy(this.gatewayJwtOptions, (payload, done) => {
			const verificationResult = this.verifyGatewayToken(payload);

			if (!verificationResult) {
				done(createHttpError(401), false);
			}
		});
	}

	public get userJwtOptions(): StrategyOptions {
		return this._userJwtOptions;
	}

	public get gatewayJwtOptions(): StrategyOptions {
		return this._gatewayJwtOptions;
	}

	public get authenticateUserStrategy(): JwtStrategy {
		return this._authenticateUserStrategy;
	}

	public get authenticateGatewayStrategy(): JwtStrategy {
		return this._authenticateGatewayStrategy;
	}

	public static getInstance(): AuthService {
		return this.#instance!;
	}

	public static setInstance(value: AuthService) {
		this.#instance = value;
	}

	public static setup() {
		const userJwtOptions = {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: Environment.getInstance().envFile.JWT_USERS_SECRET
		} satisfies StrategyOptions;

		const gatewayJwtOptions = {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: Environment.getInstance().envFile.JWT_GATEWAY_SECRET
		} satisfies StrategyOptions;

		this.setInstance(new AuthService(userJwtOptions, gatewayJwtOptions));
	}

	public static createPassword(suppliedPassword: string) {
		const salt = crypto.randomBytes(this._saltSize).toString(this._encoding);
		const hash = crypto.pbkdf2Sync(suppliedPassword, salt,
			this._iterations, this._keyLength, this._digest).toString(this._encoding);
		return `${hash}.${salt}`;
	}

	public static verifyPassword(storedPassword: string, suppliedPassword: string) {
		const [hashedPassword, salt] = storedPassword.split(".");
		const hashedPasswordBuf = Buffer.from(hashedPassword, this._encoding);
		const suppliedPasswordBuf = crypto.pbkdf2Sync(suppliedPassword,
			salt, this._iterations, this._keyLength, this._digest);
		return crypto.timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
	}

	public verifyGatewayToken(payload: GatewayJwtPayload): boolean {
		return payload.key == Environment.getInstance().envFile.JWT_GATEWAY_SECRET;
	}

	/**
	 *
	 * @param payload
	 * @throws {CustomError}
	 */
	public async getMatchingUser(payload: UserJwtPayload): Promise<User> {
		const foundUser = users.find((value) => {
			return value.customId == payload.sub;
		});

		if (!foundUser) {
			throw new CustomError("Invalid user");
		}

		return foundUser;
	}

	public login(loginForm: LoginForm): string | undefined {
		const foundUser = users.find((value) => {
			return value.username == loginForm.username;
		});

		if (!foundUser) {
			return undefined;
		}

		if (foundUser.password != loginForm.password) {
			return undefined;
		}

		foundUser.customId = crypto.randomUUID();

		return jwt.sign({}, <string> this.userJwtOptions.secretOrKey,
			{
				noTimestamp: false,
				expiresIn: this.jwtExpiresIn,
				subject: foundUser.customId
			});
	}
}
