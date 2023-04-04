import { Target } from "@/targetsService/models/Target.js";

export type StoreBody = Pick<Target, "userId" | "locationName">;
