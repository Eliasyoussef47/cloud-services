import ITargetRepository, { CreateArgs, TargetPersistent } from "@/submissionsService/persistence/ITargetRepository.js";
import { Connection } from "mongoose";
import { Target } from "@/submissionsService/models/Target.js";
import { TargetModelType, targetSchema } from "@/submissionsService/persistence/mongoose/models/Target.js";
import { MyHydratedDocument } from "@/shared/types/database/mongoose/mongoose.js";
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

		const newRecord = new model(createArgs);

		return await newRecord.save();
	}

	/**
	 *
	 * @param customId
	 * @throws {DatabaseError}
	 */
	public async get(customId: string): Promise<TargetPersistent | null> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection");
		}

		return await model.findOne(<Pick<Target, "customId">> { customId: customId }).exec() as MyHydratedDocument<Target>;
	}
}
