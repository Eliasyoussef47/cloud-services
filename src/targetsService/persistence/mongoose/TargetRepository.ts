import ITargetRepository, { CreateArgs, TargetPersistent } from "@/targetsService/persistence/ITargetRepository.js";
import NotImplementedError from "@/shared/types/errors/NotImplementedError.js";
import { Connection } from "mongoose";
import { TargetModelType } from "@/targetsService/persistence/mongoose/models/Target.js";

export default class TargetRepository implements ITargetRepository {
	static #model: TargetModelType | undefined;
	private dbConnection: Connection;
	public readonly modelName = "Target";
	public readonly collectionName = "targets";

	constructor(dbConnection: Connection) {
		this.dbConnection = dbConnection;
	}

	public create(createArgs: CreateArgs): Promise<TargetPersistent> {
		throw new NotImplementedError();
	}

	public get(customId: string): Promise<TargetPersistent | null> {
		throw new NotImplementedError();
	}

}
