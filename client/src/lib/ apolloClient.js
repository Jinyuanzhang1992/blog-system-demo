import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

let apolloClient;

function createApolloClient() {
  // HTTP connection to the API
  const httpLink = new HttpLink({
    uri: "http://localhost:4000/graphql", // GraphQL server URL
    credentials: "same-origin", // Additional fetch() options like `credentials` or `headers`
  });

  // WebSocket connection to the API
  const wsLink = process.browser
    ? new WebSocketLink({
        uri: `ws://localhost:4000/graphql`, // GraphQL server's WebSocket URL
        options: {
          reconnect: true,
        },
      })
    : null;

  // Using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const splitLink = process.browser
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

  return new ApolloClient({
    ssrMode: typeof window === "undefined", // Disable force-fetching on the server
    link: splitLink,
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}
