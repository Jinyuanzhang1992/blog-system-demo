import { Box, Paper, TextField, Typography } from "@mui/material";

const AddUserForm: React.FC<{
  setNewUser: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ setNewUser }) => {
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser(event);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser(event);
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, mb: 3 }}
      className="flex flex-col items-center w-full"
    >
      <Typography variant="h6" gutterBottom>
        Add New User
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
          onChange={handleNameChange}
        />
        <TextField
          id="email-input"
          required
          label="Email"
          variant="outlined"
          fullWidth
          name="email"
          onChange={handleEmailChange}
        />
      </Box>
    </Paper>
  );
};

export default AddUserForm;
