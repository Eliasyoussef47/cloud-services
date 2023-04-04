import { ConsumeMessage } from "amqplib";

// TODO: Update routing keys.
export type anyWord = "*";
export type restOfTopic = "#";
export type title = "blogPost" | "comment" | anyWord;
export type method = "create" | "get" | "delete" | anyWord;
export type identifier = "request" | "response" | "event" | string | anyWord;

export type RoutingKeyPart = anyWord
	| restOfTopic
	| title
	| method
	| identifier;

export type opt<T extends RoutingKeyPart> = `.${T}` | "";

export type RoutingKey = `${title}${opt<method>}${opt<identifier>}`
	| `${restOfTopic}`
	| `${title}.${restOfTopic}`
	| `${title}.${method}.${restOfTopic}`;

export type ConsumeListener = (msg: ConsumeMessage | null) => void;

export const blogPostsQueueName = "blogPosts";
export const commentsRequestsQueueName = "commentsRequests";
export const commentsResponsesQueueName = "commentsResponses";
