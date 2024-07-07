import { Box, Avatar } from "@mui/material";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import dynamic from "next/dynamic";

const EditPostModal = dynamic(
  () => import("@/components/editPost/EditPostModal")
);

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

interface PostProps {
  post: {
    p_id: string;
    title: string;
    content: string;
    author: Author;
    comment: Comment;
  };
}

const DELETE_POSTS = gql`
  mutation ($id: String!) {
    deletePost(id: $id) {
      p_id
    }
  }
`;

const Post: React.FC<PostProps> = ({ post }) => {
  const [author, setAuthor] = useState<Author | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);

  useEffect(() => {
    setAuthor(post.author);
    setContent(post.content);
    setTitle(post.title);
  }, [post]);

  const [deletePost] = useMutation(DELETE_POSTS);

  const handleDeletePost = async () => {
    // console.log("开始删除");
    try {
      const response = await deletePost({
        variables: { id: post.p_id },
      });
      // console.log("response): ", response);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPostModelOpen = () => {
    setEditPostModalOpen(true);
  };

  const handleEditPostModelClose = () => {
    setEditPostModalOpen(false);
  };

  const handleEditPost = () => {
    handleEditPostModelOpen();
  };

  return (
    <div className=" relative">
      <Box className=" flex justify-end ">
        <Button
          color="secondary"
          className="border-2 border-red-500"
          onClick={handleDeletePost}
        >
          <DeleteIcon />
        </Button>
        <Button color="secondary" onClick={handleEditPost}>
          <EditIcon />
        </Button>
      </Box>
      <Card>
        <CardContent className=" font-mono">
          <Box className="flex  items-center mb-2">
            <Avatar alt="icon" src="/static/images/avatar/1.jpg" />
            <Typography
              variant="h6"
              noWrap
              className="ml-2 no-underline  font-mono font-bold text-700 text-inherit "
            >
              {author?.name}
            </Typography>
          </Box>
          <Box className="flex flex-col  gap-3">
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body2">{content}</Typography>
          </Box>
        </CardContent>
      </Card>
      <EditPostModal
        show={editPostModalOpen}
        handleClose={handleEditPostModelClose}
        post={post}
      />
    </div>
  );
};

export default Post;
