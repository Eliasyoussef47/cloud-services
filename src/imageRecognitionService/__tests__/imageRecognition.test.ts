import { ImageRecognition } from "../businessLogic/ImageRecognition.js";
import ImaggaError from "@/imageRecognitionService/types/errors/ImaggaError.js";


describe("ImageRecognition", () => {
	describe("getImageSimilarity", () => {
		it("should return the correct similarity distance between two images", async () => {
			const imageA = "data:image/jpeg;base64,/9j/4AAQSkZJRgA...";
			const imageB = "data:image/jpeg;base64,/9j/4AAQSkZJRgA...";
			const expectedDistance = 0.752;
			const imageRecognition = new ImageRecognition();

			const result = await imageRecognition.getImageSimilarity(imageA, imageB);

			expect(result).not.toBeNull();
			expect(result).toBeCloseTo(expectedDistance, 3);
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
