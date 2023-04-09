import ISubmissionRepository, { CreateArgs, SubmissionPersistent, SubmissionsSort } from "@/submissionsService/persistence/ISubmissionRepository.js";
import { SubmissionModelType, submissionSchema } from "@/submissionsService/persistence/mongoose/models/Submission.js";
import { Connection, FilterQuery } from "mongoose";
import { Submission } from "@/submissionsService/models/Submission.js";
import { MyHydratedDocument } from "@/shared/types/database/mongoose/mongoose.js";
import { DatabaseError } from "@/shared/types/errors/ServiceError.js";

export default class SubmissionRepository implements ISubmissionRepository {
	public static readonly modelName = "Submission";
	public static readonly collectionName = "submissions";

	static #model: SubmissionModelType | undefined;

	private dbConnection: Connection | undefined;

	constructor(dbConnection: Connection | undefined) {
		this.dbConnection = dbConnection;
	}

	private get _model(): SubmissionModelType | undefined {
		if (!SubmissionRepository.#model) {
			SubmissionRepository.#model = this.dbConnection?.model<Submission, SubmissionModelType>(SubmissionRepository.modelName, submissionSchema, SubmissionRepository.collectionName);
		}

		return SubmissionRepository.#model;
	}

	public async create(createArgs: CreateArgs): Promise<SubmissionPersistent> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection.");
		}

		const newRecord = new model(createArgs);

		return await newRecord.save();
	}

	public async get(customId: string): Promise<SubmissionPersistent | null> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection.");
		}

		const filter: Pick<Submission, "customId"> = { customId: customId };
		return await model.findOne(filter).exec() as MyHydratedDocument<Submission>;
	}

	public async getByTargetId(targetId: string): Promise<SubmissionPersistent[]> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection.");
		}

		const filter: Pick<Submission, "targetId"> = {
			targetId: targetId
		};
		return await model.find(filter).exec() as MyHydratedDocument<Submission>[];
	}

	public async getByFiltered(filter: FilterQuery<Submission>, sort?: SubmissionsSort | undefined): Promise<SubmissionPersistent[]> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection.");
		}

		let query = model.find(filter);
		if (sort) {
			query.sort(sort);
		}

		return await query.exec() as MyHydratedDocument<Submission>[];
	}

	public async deleteById(id: Submission["customId"]): Promise<boolean> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection.");
		}
		console.log("id", id);

		const filter: Pick<Submission, "customId"> = {
			customId: id
		};
		const result = await model.deleteOne(filter).exec();
		return result.deletedCount > 0;
	}

	public async deleteMany(filter: Partial<Submission>): Promise<boolean> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection.");
		}

		const result = await model.deleteMany(filter).exec();
		return result.deletedCount > 0;
	}
}
