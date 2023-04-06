import mongoose, { Connection } from "mongoose";

export default class Database {
	static #instance: Database;
	readonly #connection: Connection | undefined;

	constructor(connection: Connection | undefined) {
		this.#connection = connection;
	}

	public get connection(): Connection | undefined {
		return this.#connection;
	}

	public static getInstance(): Database {
		return this.#instance!;
	}

	public static setInstance(value: Database) {
		this.#instance = value;
	}

	public static async setup(databaseUrl: string) {
		let connection: Connection;

		try {
			connection = await mongoose.createConnection(databaseUrl).asPromise();
		} catch (e) {
			console.error("Connection to database failed:", e);
			return;
		}

		this.setInstance(new Database(connection));
	}
}
