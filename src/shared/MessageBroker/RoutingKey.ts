import { ConsumeMessage } from "amqplib";

// TODO: Update routing keys.
export type anyWord = "*";
export type restOfTopic = "#";
export type resource = "targets" | "submissions" | "users" | anyWord;
export type part = "image" | anyWord;
export type event = "created" | "processed" | string | anyWord;

export type RoutingKeyPart = anyWord
	| restOfTopic
	| resource
	| part
	| event;

export type opt<T extends RoutingKeyPart> = `.${T}` | "";

export type RoutingKey =
	| `${resource}${opt<part>}${opt<event>}`
	| `${restOfTopic}`
	| `${resource}.${restOfTopic}`
	| `${resource}.${part}.${restOfTopic}`;

export type ConsumeListener = (msg: ConsumeMessage | null) => void;
