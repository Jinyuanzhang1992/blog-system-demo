import { Fragment, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import dynamic from "next/dynamic";
import Typography from "@mui/material/Typography";
import { gql, useMutation } from "@apollo/client";

const EditPostForm = dynamic(() => import("./EditPostForm"));

const UPDATE_POST = gql`
  mutation (
    $id: String!
    $title: String!
    $content: String!
    $author: String!
  ) {
    updatePost(id: $id, title: $title, content: $content, author: $author) {
      p_id
      title
      content
      author {
        u_id
        name
        email
      }
    }
  }
`;

interface EditPostModalProps {
  show: boolean;
  handleClose: () => void;
  post: {
    title: string;
    content: string;
    author: {
      u_id: string;
    };
    p_id: string;
  };
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  show,
  handleClose,
  post,
}) => {
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    authorId: "",
    p_id: "",
  });
  const [updatePost] = useMutation(UPDATE_POST);

  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setNewPost({
      title: post.title,
      content: post.content,
      authorId: post.author.u_id,
      p_id: post.p_id,
    });
  }, [post]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewPost((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAuthorChange = (authorId: string) => {
    setNewPost((prevState) => ({
      ...prevState,
      authorId,
    }));
  };

  // console.log("newPost: ", newPost);

  const handleSubmit = async () => {
    // console.log("开始提交");
    if (
      newPost.title === "" ||
      newPost.content === "" ||
      newPost.authorId === ""
    ) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
    try {
      const response = await updatePost({
        variables: {
          title: newPost.title,
          content: newPost.content,
          author: newPost.authorId,
          id: newPost.p_id,
        },
      });
      // console.log("response: ", response);
    } catch (err) {
      console.log(err);
    }
    handleClose();
  };

  return (
    <Fragment>
      <Dialog
        open={show}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="p-3"
      >
        <DialogContent sx={{ padding: "20px", width: "500px" }}>
          <EditPostForm
            setNewPost={handleInputChange}
            setAuthor={handleAuthorChange}
            post={post}
          />
          {!isValid && (
            <Typography color="error">Please fill in all fields.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} autoFocus>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default EditPostModal;
