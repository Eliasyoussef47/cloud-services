import { Submission } from "@/submissionsService/models/Submission.js";

export type StoreBody = Pick<Submission, "userId">;
