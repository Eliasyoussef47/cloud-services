// rollup.config.ts
// noinspection SpellCheckingInspection

import typescript from "@rollup/plugin-typescript";
import { defineConfig, RollupOptions } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";

export function forInput(entryAlias: string, inputPath: string) {
	const configs: RollupOptions = {
		input: {
			[entryAlias]: inputPath,
		},
		output: {
			dir: "dist",
			entryFileNames: `${entryAlias}.mjs`,
			format: "esm"
		},
		plugins: [
			// @ts-ignore
			typescript({}),
			// @ts-ignore
			nodeResolve(),
			// @ts-ignore
			commonjs(),
			// @ts-ignore
			json()
		],
		cache: false,
		onwarn: function ( message ) {
			// @ts-ignore
			if ( /external dependency/.test( message ) ) return;
		}
	};

	return configs;
}

export const apiGateway = () => {
	return forInput("apiGateway", "src/apiGateway/index.ts");
}

export const targets = () => {
	return forInput("targetsService", "src/targetsService/index.ts");
}

// noinspection JSUnusedGlobalSymbols
export default defineConfig([
	// forInput("createPasswordCli", "src/auth/createPasswordCli.ts"),
	// forInput("verifyPasswordCli", "src/auth/verifyPasswordCli.ts"),
	apiGateway(),
	forInput("imageRecognitionService", "src/imageRecognitionService/index.ts"),
	forInput("submissionsService", "src/submissionsService/index.ts"),
	targets(),
]);
