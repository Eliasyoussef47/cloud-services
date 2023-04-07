import { Channel } from "amqplib";

export const exchangeAlphaName = "webs.alpha";
export const exchangeBravoName = "webs.bravo";
export const exchangeCharlieName = "webs.charlie";
// export const exchangeDeltaName = "webs.delta";

export type ExchangeName = typeof exchangeAlphaName | typeof exchangeBravoName | typeof exchangeCharlieName/* | typeof exchangeDeltaName*/;

export type AssertExchangeParams = Parameters<Channel["assertExchange"]>;

export const exchangeAlphaParams: AssertExchangeParams = [exchangeAlphaName, "topic", { durable: true }];
export const exchangeBravoParams: AssertExchangeParams = [exchangeBravoName, "topic", { durable: true }];
export const exchangeCharlieParams: AssertExchangeParams = [exchangeCharlieName, "fanout", { durable: true }];
// export const exchangeDeltaParams: AssertExchangeParams = [exchangeDeltaName, "fanout", { durable: true }];

export const targetsServicesQueueName = "webs.targetsServiceQueue";
export const submissionsServicesQueueName = "webs.submissionsServiceQueue";
export const targetsServiceRpcQueueName = "webs.targetsService.rpc";
export const submissionServiceCallbackQueueName = "webs.submissionService.callbackQueue";
export const imagesToProcessQueueName = "webs.imagesToProcess";

export type AssertQueueParams = Parameters<Channel["assertQueue"]>;

export const targetsServiceQueueParams: AssertQueueParams = [targetsServicesQueueName, { durable: true }];
export const submissionsServicesQueueParams: AssertQueueParams = [submissionsServicesQueueName, { durable: true }];
export const targetsServiceRpcQueueParams: AssertQueueParams = [targetsServiceRpcQueueName, { durable: true }];
export const submissionServiceCallbackQueueParams: AssertQueueParams = [submissionServiceCallbackQueueName, { durable: true }];
export const imagesToProcessQueueParams: AssertQueueParams = [imagesToProcessQueueName, { durable: true }];
