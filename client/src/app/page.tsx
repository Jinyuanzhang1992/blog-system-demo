import dynamic from "next/dynamic";

const PostsPage = dynamic(() => import("@/app/posts/page"));

const HomePage: React.FC = () => {
  return <PostsPage />;
};

export default HomePage;
