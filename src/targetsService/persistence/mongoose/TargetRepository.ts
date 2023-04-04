import ITargetRepository, { CreateArgs, TargetPersistent } from "@/targetsService/persistence/ITargetRepository.js";
import NotImplementedError from "@/shared/types/errors/NotImplementedError.js";
import { Connection } from "mongoose";
import { TargetModelType, targetSchema } from "@/targetsService/persistence/mongoose/models/Target.js";
import { Target } from "@/targetsService/models/Target.js";

export default class TargetRepository implements ITargetRepository {
	static #model: TargetModelType | undefined;
	private dbConnection: Connection;
	public static readonly modelName = "Target";
	public static readonly collectionName = "targets";

	constructor(dbConnection: Connection) {
		this.dbConnection = dbConnection;
	}

	private get _model(): TargetModelType {
		if (!TargetRepository.#model) {
			TargetRepository.#model = this.dbConnection.model<Target, TargetModelType>(TargetRepository.modelName, targetSchema, TargetRepository.collectionName);
		}

		return TargetRepository.#model;
	}

	public async create(createArgs: CreateArgs): Promise<TargetPersistent> {
		// TODO: Implement.
		const data: CreateArgs = {
			customId: createArgs.customId,
			userId: createArgs.userId,
			source: createArgs.source,
			base64Encoded: createArgs.base64Encoded,
			locationName: createArgs.locationName,
		};
		const newTarget = new this._model(data);

		return await newTarget.save();
	}

	public get(customId: string): Promise<TargetPersistent | null> {
		// TODO: Implement.
		throw new NotImplementedError();
	}

}
