import { CustomError } from "@/shared/types/errors/CustomError.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { GatewayJwtPayload, LoginForm, UserJwtPayload } from "@/auth/AuthServiceAlpha.js";
import { Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { Environment } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import { AuthServiceBase } from "@/auth/AuthServiceBase.js";

// TODO: Use database.
export interface User {
	id: string;
	customId: string;
	username: string;
	password: string;
}

// TODO: Use database.
const users: Array<User> = [
	{
		id: "420",
		customId: "456",
		username: "elias",
		password: "jeff"
	}
];

/**
 * Responsible for authentication in the API gateway.
 */
export class AuthServiceBeta extends AuthServiceBase {
	static #instance: AuthServiceBeta | undefined;

	private static readonly _saltSize = 16;

	private static readonly _iterations = 1000;

	private static readonly _keyLength = 64;

	private static readonly _digest = "sha512";

	private static readonly _encoding = "hex";

	private readonly _userJwtOptions: StrategyOptions;

	private readonly _authenticateUserStrategy: JwtStrategy;

	private readonly jwtExpiresIn: number = 10800;

	private readonly _gatewayJwt: string;

	constructor(gatewayJwtOptions: StrategyOptions, userJwtOptions: StrategyOptions) {
		super(gatewayJwtOptions);

		this.jwtExpiresIn = Environment.getInstance().envFile.JWT_EXPIRES_IN;
		this._userJwtOptions = userJwtOptions;

		this._authenticateUserStrategy = new JwtStrategy(this.userJwtOptions, (payload, done) => {
			this.getMatchingUser(payload)
				.then((value) => {
					return done(null, value);
				})
				.catch((e) => {
					done(createHttpError(401, e), false);
				});
		});

		const gatewayJwtPayload: GatewayJwtPayload = {
			key: Environment.getInstance().envFile.SERVICES_API_KEY
		};

		this._gatewayJwt = jwt.sign(gatewayJwtPayload, <string> this.gatewayJwtOptions.secretOrKey);
	}

	public get userJwtOptions(): StrategyOptions {
		return this._userJwtOptions;
	}

	public get authenticateUserStrategy(): JwtStrategy {
		return this._authenticateUserStrategy;
	}

	public get gatewayJwt(): string {
		return this._gatewayJwt;
	}

	public static getInstance(): AuthServiceBeta {
		return this.#instance!;
	}

	public static setInstance(value: AuthServiceBeta) {
		this.#instance = value;
	}

	public static setup() {
		const gatewayJwtOptions = AuthServiceBase.getDefaultGatewayJwtOptions();
		const userJwtOptions = AuthServiceBase.getDefaultUserJwtOptions();

		this.setInstance(new AuthServiceBeta(gatewayJwtOptions, userJwtOptions));
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

	// TODO: Use database.
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

	// TODO: Use database.
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
				expiresIn: this.jwtExpiresIn,
				subject: foundUser.customId
			});
	}
}