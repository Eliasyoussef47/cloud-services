import ITargetRepository, { CreateArgs, TargetPersistent } from "@/targetsService/persistence/ITargetRepository.js";
import NotImplementedError from "@/shared/types/errors/NotImplementedError.js";
import { Connection } from "mongoose";
import { TargetModelType, targetSchema } from "@/targetsService/persistence/mongoose/models/Target.js";
import { Target } from "@/targetsService/models/Target.js";
import { DatabaseError } from "@/shared/types/errors/ServiceError.js";

export default class TargetRepository implements ITargetRepository {
	public static readonly modelName = "Target";
	public static readonly collectionName = "targets";
	static #model: TargetModelType | undefined;
	private dbConnection: Connection | undefined;

	constructor(dbConnection: Connection | undefined) {
		this.dbConnection = dbConnection;
	}

	private get _model(): TargetModelType | undefined {
		if (!TargetRepository.#model) {
			TargetRepository.#model = this.dbConnection?.model<Target, TargetModelType>(TargetRepository.modelName, targetSchema, TargetRepository.collectionName);
		}

		return TargetRepository.#model;
	}

	/**
	 *
	 * @param createArgs
	 * @throws {DatabaseError}
	 */
	public async create(createArgs: CreateArgs): Promise<TargetPersistent> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection");
		}

		const data: CreateArgs = {
			customId: createArgs.customId,
			userId: createArgs.userId,
			source: createArgs.source,
			base64Encoded: createArgs.base64Encoded,
			locationName: createArgs.locationName,
		};
		const newTarget = new model(data);

		return await newTarget.save();
	}

	public get(customId: string): Promise<TargetPersistent | null> {
		// TODO: Implement.
		throw new NotImplementedError();
	}
}
