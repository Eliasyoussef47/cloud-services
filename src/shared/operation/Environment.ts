import * as process from "process";
import { toZod } from "tozod";
import z from "zod";

export interface Env {
	JWT_USERS_SECRET: string;
	JWT_GATEWAY_SECRET: string;
	SERVICES_API_KEY: string;
	IMAGGA_API_KEY: string;
	IMAGGA_API_SECRET: string;
	MESSAGE_BROKER_URL: string;
	API_GATEWAY_URL: string;
	TARGETS_SERVICE_URL: string;
	SUBMISSIONS_SERVICE_URL: string;
	IMAGE_RECOGNITION_SERVICE_URL: string;
}

export const stringWithValueSchema = z.string().min(1);

export const envFileSchema: toZod<Env> = z.object({
	JWT_USERS_SECRET: stringWithValueSchema,
	JWT_GATEWAY_SECRET: stringWithValueSchema,
	SERVICES_API_KEY: stringWithValueSchema,
	IMAGGA_API_KEY: stringWithValueSchema,
	IMAGGA_API_SECRET: stringWithValueSchema,
	MESSAGE_BROKER_URL: stringWithValueSchema.url(),
	API_GATEWAY_URL: stringWithValueSchema.url(),
	TARGETS_SERVICE_URL: stringWithValueSchema.url(),
	SUBMISSIONS_SERVICE_URL: stringWithValueSchema.url(),
	IMAGE_RECOGNITION_SERVICE_URL: stringWithValueSchema.url(),
});

export class Environment {
	static #instance: Environment | undefined;
	readonly #envFile: Env;

	constructor(envFile: Env) {
		this.#envFile = envFile;
	}

	public get apiGatewayUrl(): URL {
		return new URL(this.#envFile.API_GATEWAY_URL);
	}

	public get targetServiceUrl(): URL {
		return new URL(this.#envFile.TARGETS_SERVICE_URL);
	}

	public get envFile(): Env {
		return this.#envFile;
	}

	public static getInstance(): Environment {
		return this.#instance!;
	}

	public static setInstance(value: Environment) {
		this.#instance = value;
	}

	public static getInstanceUndefined(): Environment | undefined {
		return this.#instance;
	}

	public static setup() {
		const envFile: Env = {
			JWT_USERS_SECRET: process.env.JWT_USERS_SECRET || "",
			JWT_GATEWAY_SECRET: process.env.JWT_SERVICES_SECRET || "",
			SERVICES_API_KEY: process.env.SERVICES_API_KEY || "",
			IMAGGA_API_KEY: process.env.IMAGGA_API_KEY || "",
			IMAGGA_API_SECRET: process.env.IMAGGA_API_SECRET || "",
			MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL || "",
			API_GATEWAY_URL: process.env.API_GATEWAY_URL || "",
			TARGETS_SERVICE_URL: process.env.TARGETS_SERVICE_URL || "",
			SUBMISSIONS_SERVICE_URL: process.env.SUBMISSIONS_SERVICE_URL || "",
			IMAGE_RECOGNITION_SERVICE_URL: process.env.IMAGE_RECOGNITION_SERVICE_URL || "",
		}

		envFileSchema.parse(envFile);

		this.setInstance(new Environment(envFile));
	}
}
