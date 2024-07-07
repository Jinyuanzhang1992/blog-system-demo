import React from "react";
import dynamic from "next/dynamic";
import "./globals.css";

// 动态导入 ApolloProviderWrapper，确保仅在客户端渲染
const ApolloProviderWrapper = dynamic(
  () => import("../lib/ApolloProviderWrapper")
);

const Navbar = dynamic(() => import("../components/Navbar"));

const RootLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <html lang="en">
      <head />
      <body>
        <ApolloProviderWrapper>
          <div className="flex flex-col justify-center items-center ">
            <Navbar />
            <main className="w-[80%]">{children}</main>
          </div>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
