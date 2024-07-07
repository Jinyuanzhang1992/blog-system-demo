import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { pubSub } from "./pubSub";
import { PostResolver } from "./resolvers/PostResolver";
import { CommentResolver } from "./resolvers/CommentResolver";
import pool from "./database"; // 引入数据库连接

async function main() {
  // 测试数据库连接
  try {
    await pool.query("SELECT NOW()");
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection error", error);
  }

  const schema = await buildSchema({
    resolvers: [UserResolver, PostResolver, CommentResolver],
    emitSchemaFile: true,
    pubSub,
  });

  const app = express();
  const httpServer = createServer(app);

  const server = new ApolloServer({
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

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: () => {
        console.log("Connected to websocket");
      },
      onDisconnect: () => {
        console.log("Disconnected from websocket");
      },
    },
    { server: httpServer, path: server.graphqlPath }
  );

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(
      `Server is running on http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `Subscriptions are available at ws://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

main().catch((error) => {
  console.error(error);
});
