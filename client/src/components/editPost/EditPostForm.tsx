import {
  Box,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import { SelectChangeEvent } from "@mui/material/Select";

const EditPostForm: React.FC<{
  setNewPost: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setAuthor: (authorId: string) => void;
  post: {
    title: string;
    content: string;
    author: {
      u_id: string;
    };
  };
}> = ({ setNewPost, setAuthor, post }) => {
  const [author, setAuthorState] = useState("");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // console.log("author: ", author);
  // console.log("title: ", title);
  // console.log("content: ", content);
  // console.log("post: ", post);

  useEffect(() => {
    setAuthorState(post.author.u_id);
    setTitle(post.title);
    setContent(post.content);
  }, [post]);

  const handleChange = (event: SelectChangeEvent<typeof author>) => {
    const authorId = event.target.value as string;
    setAuthorState(authorId);
    setAuthor(authorId);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    setNewPost(event);
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
    setNewPost(event);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, mb: 3 }}
      className="flex flex-col items-center w-full"
    >
      <Typography variant="h6" gutterBottom>
        Add New Post
      </Typography>
      <Box
        sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          id="title-input"
          required
          label="Title"
          variant="outlined"
          fullWidth
          name="title"
          value={title}
          onChange={handleTitleChange}
        />
        <TextField
          id="content-input"
          required
          label="Content"
          variant="outlined"
          fullWidth
          multiline
          rows={5}
          name="content"
          value={content}
          onChange={handleContentChange}
        />
        <FormControl>
          <InputLabel id="demo-controlled-open-select-label">Author</InputLabel>
          <Select
            labelId="demo-controlled-open-select-label"
            id="demo-controlled-open-select"
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            value={author}
            label="Author"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={"2"}>Allen</MenuItem>
            <MenuItem value={"3"}>David</MenuItem>
            <MenuItem value={"1"}>Paul</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default EditPostForm;
