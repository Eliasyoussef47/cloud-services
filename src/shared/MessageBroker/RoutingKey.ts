import { ConsumeMessage } from "amqplib";

export type anyWord = "*";
export type restOfTopic = "#";
export type resource = "targets" | "submissions" | "users" | anyWord;
export type section = "image" | anyWord;
export type event = "created" | "uploaded" | "scoreCalculated" | "scoreCalculationRequested" | anyWord;

export type RoutingKeyPart = anyWord
	| restOfTopic
	| resource
	| section
	| event;

export type opt<T extends RoutingKeyPart> = `.${T}` | "";

export type RoutingKey =
	| `${resource}${opt<section>}${opt<event>}`
	| `${restOfTopic}`
	| `${resource}.${restOfTopic}`
	| `${resource}.${section}.${restOfTopic}`;

export type ConsumeListener = (msg: ConsumeMessage | null) => void;
