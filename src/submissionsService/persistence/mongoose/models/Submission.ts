import { MongooseBase, MongooseWithTimestamps } from "@/shared/types/database/mongoose/mongoose.js";
import { Submission } from "@/submissionsService/models/Submission.js";
import { DefaultSchemaOptions, Mixed, Model, Schema, SchemaTypes } from "mongoose";
import UserRepository from "@/shared/persistence/mongoose/UserRepository.js";
import TargetRepository from "@/submissionsService/persistence/mongoose/TargetRepository.js";

type MongooseSubmission = MongooseBase & MongooseWithTimestamps & Submission;
export type SubmissionModelType = Model<MongooseSubmission>;

export const submissionSchema = new Schema<MongooseSubmission, SubmissionModelType, Submission, SubmissionModelType, Submission, SubmissionModelType, DefaultSchemaOptions, MongooseSubmission, Submission>({
	// TODO: Set index on customId.
	customId: { type: SchemaTypes.String, required: true },
	userId: { type: SchemaTypes.String, required: true, ref: UserRepository.modelName },
	targetId: { type: SchemaTypes.String, required: true, ref: TargetRepository.modelName },
	source: { type: SchemaTypes.String, required: true },
	base64Encoded: {
		type: SchemaTypes.String,
		required: true,
		validate: {
			validator: function(v: string | Mixed) {
				return /[a-zA-Z0-9_-]/.test(<string> v);
			},
			message: props => `${props.value} is not a valid Base64!`
		}
	},
	score: { type: SchemaTypes.Number, default: null, min: 0.0 }
}, { timestamps: true });
submissionSchema.set("toObject", { versionKey: false, useProjection: true });
