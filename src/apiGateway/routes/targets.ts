import express from "express";
import TargetHandler from "@/apiGateway/handlers/targets.js";
import multer from "multer";

export type TargetsRoute<TBase extends string, TParam extends string = ":id"> = `${TBase}/${TParam}`;

export function getTargetsRoute<T extends string>(base: URL, param: T): TargetsRoute<string, T> {
	return `${base.toString()}/${param}`;
}

const getRouter = () => {
	const targetsRouter = express.Router();

	const upload = multer();

	targetsRouter.route("/targets")
		.get(TargetHandler.index)
		.post(upload.fields([{name: "photo"}]), TargetHandler.store);

	targetsRouter.route("/targets/:id")
		.get(TargetHandler.show)

	return targetsRouter;
};

export default getRouter;
