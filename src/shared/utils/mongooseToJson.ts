import mongoose from "mongoose";

mongoose.plugin((schema) => {
	// @ts-ignore
	schema.options.toJSON = {
		versionKey: false,
		// @ts-ignore
		transform(doc, ret) {
			delete ret._id;
		}
	};
	// @ts-ignore
	schema.options.toObject = {
		versionKey: false,
		// @ts-ignore
		transform(doc, ret) {
			delete ret._id;
		}
	};
});
