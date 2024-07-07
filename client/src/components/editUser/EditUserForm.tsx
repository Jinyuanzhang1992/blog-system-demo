import { Box, Paper, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";

const EditUserForm: React.FC<{
  setNewUser: (event: React.ChangeEvent<HTMLInputElement>) => void;
  user: {
    name: string;
    email: string;
    u_id: string;
  };
}> = ({ setNewUser, user }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // console.log("user: ", user);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNewUser(event);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setNewUser(event);
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, mb: 3 }}
      className="flex flex-col items-center w-full"
    >
      <Typography variant="h6" gutterBottom>
        Edit User
      </Typography>
      <Box
        sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          id="name-input"
          required
          label="Name"
          variant="outlined"
          fullWidth
          name="name"
          value={name}
          onChange={handleNameChange}
        />
        <TextField
          id="email-input"
          required
          label="Email"
          variant="outlined"
          fullWidth
          name="email"
          value={email}
          onChange={handleEmailChange}
        />
      </Box>
    </Paper>
  );
};

export default EditUserForm;
