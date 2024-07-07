import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";

const actions = [
  { icon: <EditIcon />, name: "Edit" },
  { icon: <DeleteIcon />, name: "Delete" },
];

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

const CommentSection: React.FC<PostProps> = ({ post }) => {
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState<Author | null>(null);

  useEffect(() => {
    setContent(post.comment?.content || "");
    setAuthor(post.comment?.author || {});
  }, [post]);

  return (
    <div className=" relative">
      {post.comment && (
        <CardContent>
          <Box display="flex" alignItems="center" className="items-center">
            <Avatar alt="icon" src="/" className="w-6 h-6" />
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ marginLeft: 1 }}
              className="text-[15px]"
            >
              {author?.name}
            </Typography>
          </Box>
          <Typography
            color="text.secondary"
            sx={{ marginTop: 1 }}
            className="text-2px"
          >
            {content}
          </Typography>
        </CardContent>
      )}
    </div>
  );
};

export default CommentSection;
