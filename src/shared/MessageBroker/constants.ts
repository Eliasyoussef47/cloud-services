import { Channel } from "amqplib";

export const exchangeAlphaName = "webs.alpha";
export const exchangeBravoName = "webs.bravo";
export const exchangeCharlieName = "webs.charlie";
export const exchangeDeltaName = "webs.delta";

export type ExchangeName = typeof exchangeAlphaName | typeof exchangeBravoName | typeof exchangeCharlieName | typeof exchangeDeltaName;

export type AssertExchangeParams = Parameters<Channel["assertExchange"]>

export const exchangeAlphaParams: AssertExchangeParams = [exchangeAlphaName, "topic", { durable: true }];
export const exchangeBravoParams: AssertExchangeParams = [exchangeBravoName, "topic", { durable: true }];
export const exchangeCharlieParams: AssertExchangeParams = [exchangeCharlieName, "topic", { durable: true }];
export const exchangeDeltaParams: AssertExchangeParams = [exchangeDeltaName, "fanout", { durable: true }];

export const targetsServicesUsersCreatedQueueName = "users.created.targetsService";
export const targetsServicesTargetsProcessedQueueName = "targets.processed.targetsService";

export type AssertQueueParams = Parameters<Channel["assertQueue"]>

export const targetsServicesUsersCreatedQueueParams: AssertQueueParams = [targetsServicesUsersCreatedQueueName, { durable: true }];
export const targetsServicesTargetsProcessedQueueParams: AssertQueueParams = [targetsServicesTargetsProcessedQueueName, { durable: true }];
