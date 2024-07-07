import dynamic from "next/dynamic";
import { Paper } from "@mui/material";

const Post = dynamic(() => import("./Post"));
const CommentSection = dynamic(() => import("./CommentSection"));

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

const Card: React.FC<PostProps> = ({ post }) => {
  return (
    <div>
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Post post={post} />
        <CommentSection post={post} />
      </Paper>
    </div>
  );
};

export default Card;
