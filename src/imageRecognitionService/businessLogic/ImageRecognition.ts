import { Environment } from "@/shared/operation/Environment.js";
import ServicesRegistry from "@/imageRecognitionService/ServicesRegistry.js";
import { imagesSimilarityResponseSchema } from "@/imageRecognitionService/types/imagga.js";
import { basicAuth } from "@/shared/utils/general.js";
import { printResponse } from "@/shared/utils/fetch.js";

export class ImageRecognition {
	/**
	 *
	 * @param imageBase64A
	 * @param imageBase64B
	 * @return The distance between the two images.
	 */
	public async getImageSimilarity(imageBase64A: string, imageBase64B: string): Promise<number | null> {
		const myHeaders = new Headers();
		myHeaders.append("Authorization", `Basic ${Environment.getInstance().imaggaAuthToken}`);

		const formData = new FormData();
		formData.append("image_base64", imageBase64A);
		formData.append("image2_base64", imageBase64B);

		const requestOptions: RequestInit = {
			method: "POST",
			headers: myHeaders,
			body: formData
		};

		let response: Response;
		try {
			// TODO: Get Imagga API URL from .env file.
			response = await fetch("https://api.imagga.com/v2/images-similarity/categories/general_v3", requestOptions);
		} catch (e) {
			console.error("Imagga request error:", e);
			return null;
		}

		if (!response.ok) {
			console.warn("Imagga request not ok:");
			void printResponse(response);
			return null;
		}

		let responseJson: any;
		try {
			responseJson = await response.json();
		} catch (e) {
			console.error("Response from Imagga wasn't json: ", e);
			return null;
		}

		const responseParsed = imagesSimilarityResponseSchema.safeParse(responseJson);

		if (!responseParsed.success) {
			console.error("Response from Imagga didn't satisfy the schema: ", responseParsed.error);
			return null;
		}

		return responseParsed.data.result.distance;
	}
}
