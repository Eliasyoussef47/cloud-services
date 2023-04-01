import type { JestConfigWithTsJest } from "ts-jest";
import { pathsToModuleNameMapper } from "ts-jest";
import path from "path";
import * as fs from "fs";
import * as tsconfig from "tsconfig";

const configFile = "./tsconfig.json";
const configPath = path.resolve(configFile);
const fileContent = fs.readFileSync(configPath, 'utf8');
const external = tsconfig.parse(fileContent, configPath);
const compilerOptions = external.compilerOptions || {};

const jestConfig: JestConfigWithTsJest = {
	// preset: '@shelf/jest-mongodb',
	coveragePathIgnorePatterns: [
		"/node_modules/"
	],
	coverageThreshold: {
		global: {
			lines: 80,
		},
	},
	extensionsToTreatAsEsm: ['.ts'],
	roots: ['<rootDir>'],
	modulePaths: [compilerOptions.baseUrl],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths , { prefix: '<rootDir>/', useESM: true } ),
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: configFile
			},
		],
	},
};

export default jestConfig