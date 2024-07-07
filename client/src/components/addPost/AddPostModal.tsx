import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import dynamic from "next/dynamic";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import { gql, useMutation } from "@apollo/client";

const AddPostForm = dynamic(() => import("./AddPostForm"));

const ADD_POST = gql`
  mutation ($title: String!, $content: String!, $author: String!) {
    addPost(title: $title, content: $content, author: $author) {
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

const AddPostModal: React.FC<{ show: boolean; handleClose: () => void }> = ({
  show,
  handleClose,
}) => {
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    authorId: "",
  });
  const [addPost] = useMutation(ADD_POST);

  const [isValid, setIsValid] = useState(true);

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
      const response = await addPost({
        variables: {
          title: newPost.title,
          content: newPost.content,
          author: newPost.authorId,
        },
      });
      // console.log("response: ", response);
    } catch (err) {
      console.log(err);
    }
    handleClose();
  };

  return (
    <Dialog
      open={show}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className="p-3"
    >
      <DialogContent sx={{ padding: "20px", width: "500px" }}>
        <AddPostForm
          setNewPost={handleInputChange}
          setAuthor={handleAuthorChange}
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
  );
};

export default AddPostModal;
