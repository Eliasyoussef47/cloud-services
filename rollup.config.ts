// rollup.config.ts
import typescript from "@rollup/plugin-typescript";
import autoExternal from "rollup-plugin-auto-external";
import { defineConfig, RollupOptions } from "rollup";

export function forInput(entryAlias: string, inputPath: string) {
	const configs: RollupOptions = {
		input: {
			[entryAlias]: inputPath,
		},
		output: {
			dir: "dist",
			sourcemap: true,
			format: "es"
		},
		plugins: [
			// @ts-ignore
			typescript({}),
			// nodeResolve(),
			autoExternal(),
		],
		cache: false
	};

	return configs;
}

export const apiGateway = () => {
	return forInput("apiGateway", "src/apiGateway/index.ts");
}

// noinspection JSUnusedGlobalSymbols
export default defineConfig([
	// forInput("createPasswordCli", "src/auth/createPasswordCli.ts"),
	// forInput("verifyPasswordCli", "src/auth/verifyPasswordCli.ts"),
	apiGateway(),
	forInput("imageRecognitionService", "src/imageRecognitionService/index.ts"),
	forInput("submissionsService", "src/submissionsService/index.ts"),
	forInput("targetsService", "src/targetsService/index.ts"),
]);
