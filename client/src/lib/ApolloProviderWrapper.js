"use client";

import React from "react";
import { ApolloProvider } from "@apollo/client";
import { initializeApollo } from "./ apolloClient";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../redux/store"; // 确保导入 Redux store

const ApolloProviderWrapper = ({ children }) => {
  const client = initializeApollo();
  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>{children}</ApolloProvider>;
    </ReduxProvider>
  );
};

export default ApolloProviderWrapper;
