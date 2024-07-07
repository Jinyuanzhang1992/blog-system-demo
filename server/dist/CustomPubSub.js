"use strict";
// // src/CustomPubSub.ts
// import {} from "type-graphql";
// import { PubSub, PubSubOptions, PubSubEngine } from "graphql-subscriptions";
// import { AsyncIterator } from "iterall";
// class CustomPubSub implements PubSubEngine {
//   private pubSub: PubSub;
//   constructor(options?: PubSubOptions) {
//     this.pubSub = new PubSub(options);
//   }
//   async publish(triggerName: string, payload: any): Promise<void> {
//     await this.pubSub.publish(triggerName, payload);
//   }
//   async subscribe(
//     triggerName: string,
//     onMessage: Function,
//     options: Object = {}
//   ): Promise<number> {
//     return this.pubSub.subscribe(triggerName, onMessage, options);
//   }
//   async unsubscribe(subId: number): Promise<void> {
//     this.pubSub.unsubscribe(subId);
//   }
//   asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
//     return this.pubSub.asyncIterator<T>(triggers);
//   }
// }
// export { CustomPubSub };
