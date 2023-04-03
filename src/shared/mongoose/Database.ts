import { Environment } from "@/shared/operation/Environment.js";
import mongoose, { Connection } from "mongoose";

export default class Database {
	static #instance: Database;
	readonly #connection: Connection;

	constructor(connection: Connection) {
		this.#connection = connection;
	}

	public get connection(): Connection {
		return this.#connection;
	}

	public static getInstance(): Database {
		return this.#instance!;
	}

	public static setInstance(value: Database) {
		this.#instance = value;
	}

	public static async setup(databaseUrl: string) {
		const connection = await mongoose.createConnection(databaseUrl).asPromise();

		this.setInstance(new Database(connection));
	}
}
