import * as dotenv from "dotenv";
import { Environment } from "@/shared/operation/Environment.js";
import { ImageRecognition } from "../businessLogic/ImageRecognition.js";

dotenv.config();
Environment.setup();

describe("ImageRecognition", () => {
	describe("getImageSimilarity", () => {
		it("should return the correct similarity distance between two images", async () => {
			const imageA = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAFUlEQVQImWP8z8DwnwENMKELUEEQAM6pAggfw96NAAAAAElFTkSuQmCC";
			const imageB = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAHUlEQVQImWNkYPj/n4GBgeE/AyMDDDAxYAEUCgIALLgDCH/EWEUAAAAASUVORK5CYII=";
			const expectedDistance = 0.801701545715332;
			const imageRecognition = new ImageRecognition();

			const result = await imageRecognition.getImageSimilarity(imageA, imageB);

			expect(result).not.toBeNull();
			expect(result).toBe(expectedDistance);
		});

		// it("should throw an error when the response has a non-200 status code", async () => {
		// 	const imageA = "data:image/jpeg;base64,/9j/4AAQSkZJRgA...";
		// 	const imageB = "data:image/jpeg;base64,/9j/4AAQSkZJRgA...";
		// 	const expectedError = new ImaggaError("Unauthorized");
		// 	const imageRecognition = new ImageRecognition();
		//
		// 	await expect(imageRecognition.getImageSimilarity(imageA, imageB)).rejects.toEqual(expectedError);
		// });

		// it("should return null when the response is not JSON", async () => {
		// 	const imageA = "data:image/jpeg;base64,/9j/4AAQSkZJRgA...";
		// 	const imageB = "data:image/jpeg;base64,/9j/4AAQSkZJRgA...";
		// 	const mockResponse = new Response("Not a JSON response", { status: 200 });
		// 	const imageRecognition = new ImageRecognition();
		//
		// 	jest.spyOn(global, "fetch").mockResolvedValue(mockResponse);
		// 	const result = await imageRecognition.getImageSimilarity(imageA, imageB);
		//
		// 	expect(result).toBeNull();
		// });
		//
		// it("should return null when the response doesn't satisfy the schema", async () => {
		// 	const imageA = "data:image/jpeg;base64,/9j/4AAQSkZJRgA...";
		// 	const imageB = "data:image/jpeg;base64,/9j/4AAQSkZJRgA...";
		// 	const mockResponse = new Response(JSON.stringify({}), { status: 200 });
		// 	const imageRecognition = new ImageRecognition();
		//
		// 	jest.spyOn(global, "fetch").mockResolvedValue(mockResponse);
		// 	const result = await imageRecognition.getImageSimilarity(imageA, imageB);
		//
		// 	expect(result).toBeNull();
		// });
	});
});
