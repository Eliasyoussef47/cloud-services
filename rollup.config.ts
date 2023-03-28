// rollup.config.ts
import typescript from "@rollup/plugin-typescript";
import autoExternal from "rollup-plugin-auto-external";
import { defineConfig, RollupOptions } from "rollup";

function forInput(entryAlias: string, inputPath: string) {
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
		]
	};

	return configs;
}

export default defineConfig([
	forInput("apiGateway", "src/apiGateway/index.ts"),
	forInput("imageRecognitionService", "src/imageRecognitionService/index.ts"),
	forInput("submissionsService", "src/submissionsService/index.ts"),
	forInput("targetsService", "src/targetsService/index.ts"),
]);
