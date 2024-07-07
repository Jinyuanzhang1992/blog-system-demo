"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const graphql_1 = require("graphql");
const subscriptions_transport_ws_1 = require("subscriptions-transport-ws");
const type_graphql_1 = require("type-graphql");
const UserResolver_1 = require("./resolvers/UserResolver");
const pubSub_1 = require("./pubSub");
const PostResolver_1 = require("./resolvers/PostResolver");
const CommentResolver_1 = require("./resolvers/CommentResolver");
const database_1 = __importDefault(require("./database")); // 引入数据库连接
async function main() {
    // 测试数据库连接
    try {
        await database_1.default.query("SELECT NOW()");
        console.log("Database connection successful");
    }
    catch (error) {
        console.error("Database connection error", error);
    }
    const schema = await (0, type_graphql_1.buildSchema)({
        resolvers: [UserResolver_1.UserResolver, PostResolver_1.PostResolver, CommentResolver_1.CommentResolver],
        emitSchemaFile: true,
        pubSub: pubSub_1.pubSub,
    });
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    const server = new apollo_server_express_1.ApolloServer({
        schema,
        plugins: [
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close();
                        },
                    };
                },
            },
        ],
    });
    await server.start();
    server.applyMiddleware({ app });
    const subscriptionServer = subscriptions_transport_ws_1.SubscriptionServer.create({
        schema,
        execute: graphql_1.execute,
        subscribe: graphql_1.subscribe,
        onConnect: () => {
            console.log("Connected to websocket");
        },
        onDisconnect: () => {
            console.log("Disconnected from websocket");
        },
    }, { server: httpServer, path: server.graphqlPath });
    const PORT = 4000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);
        console.log(`Subscriptions are available at ws://localhost:${PORT}${server.graphqlPath}`);
    });
}
main().catch((error) => {
    console.error(error);
});
