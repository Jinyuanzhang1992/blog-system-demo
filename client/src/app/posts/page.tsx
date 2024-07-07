"use client";
import { useEffect, useState } from "react";
import { gql, useQuery, useSubscription } from "@apollo/client";
import dynamic from "next/dynamic";
import { setPostsData } from "@/redux/postsData";
import { useDispatch } from "react-redux";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import { initializeApollo } from "@/lib/ apolloClient";

const Card = dynamic(() => import("../../components/Card"));
const AddPostModal = dynamic(() => import("@/components/addPost/AddPostModal"));

const GET_POSTS = gql`
  query {
    getPosts {
      p_id
      title
      content
      author {
        u_id
        name
        email
      }
      comment {
        c_id
        content
        author {
          u_id
          name
          email
        }
      }
    }
  }
`;

const POST_ADDED = gql`
  subscription {
    newPost {
      p_id
      title
      content
      author {
        u_id
        name
        email
      }
      comment {
        c_id
        content
        author {
          u_id
          name
          email
        }
      }
    }
  }
`;

const POST_DELETED = gql`
  subscription {
    deletedPost {
      p_id
      title
      content
      author {
        u_id
        name
        email
      }
      comment {
        c_id
        content
        author {
          u_id
          name
          email
        }
      }
    }
  }
`;

const POST_UPDATED = gql`
  subscription {
    updatedPost {
      p_id
      title
      content
      author {
        u_id
        name
        email
      }
      comment {
        c_id
        content
        author {
          u_id
          name
          email
        }
      }
    }
  }
`;

interface Author {
  u_id: string;
  name: string;
  email: string;
}

interface Comment {
  c_id: string;
  content: string;
  author: Author;
}

interface Post {
  p_id: string;
  title: string;
  content: string;
  author: Author;
  comment: Comment;
}

const PostsDisplay: React.FC = () => {
  const apolloClient = initializeApollo();
  const dispatch = useDispatch();
  const [posts, setPosts] = useState<Post[]>([]);
  const [openAddPostModal, setOpenAddPostModal] = useState(false);

  const {
    data: postsData,
    loading,
    error,
  } = useQuery<{ getPosts: Post[] }>(GET_POSTS);

  useSubscription(POST_ADDED, {
    onData: ({ client, data }) => {
      const newPost = data.data.newPost;
      setPosts((prevPosts) => [...prevPosts, newPost]);
    },
    client: apolloClient,
  });

  useSubscription(POST_DELETED, {
    onData: ({ client, data }) => {
      const deletedPost = data.data.deletedPost;
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.p_id !== deletedPost.p_id)
      );
    },
    client: apolloClient,
  });

  useSubscription(POST_UPDATED, {
    onData: ({ client, data }) => {
      const updatedPost = data.data.updatedPost;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.p_id === updatedPost.p_id ? updatedPost : post
        )
      );
    },
    client: apolloClient,
  });

  useEffect(() => {
    if (postsData) {
      setPosts(postsData.getPosts || []);
    }
  }, [postsData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // console.log("posts", posts);

  const handleAddPostModalOpen = () => {
    setOpenAddPostModal(true);
  };

  const handleAddPostModalClose = () => {
    setOpenAddPostModal(false);
  };

  const handleOpen = () => {
    handleAddPostModalOpen();
  };

  return (
    <div>
      <div className="mb-7 flex justify-end">
        <Button
          onClick={handleOpen}
          color="secondary"
          variant="outlined"
          startIcon={<SendIcon />}
        >
          Add Post
        </Button>
      </div>
      {posts.map((post) => (
        <div key={post.p_id}>
          <Card post={post} />
        </div>
      ))}

      <AddPostModal
        show={openAddPostModal}
        handleClose={handleAddPostModalClose}
      />
    </div>
  );
};

export default PostsDisplay;
