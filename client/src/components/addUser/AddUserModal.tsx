import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { gql, useMutation } from "@apollo/client";
import dynamic from "next/dynamic";

const AddUserForm = dynamic(() => import("./AddUserForm"));

const ADD_USER = gql`
  mutation ($name: String!, $email: String!) {
    addUser(name: $name, email: $email) {
      u_id
      name
      email
    }
  }
`;

const AddUserModal: React.FC<{ show: boolean; handleClose: () => void }> = ({
  show,
  handleClose,
}) => {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
  });

  const [addUser] = useMutation(ADD_USER);

  const [isValid, setIsValid] = useState(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (newUser.name === "" || newUser.email === "") {
      setIsValid(false);
      return;
    }
    setIsValid(true);
    try {
      const response = await addUser({
        variables: {
          name: newUser.name,
          email: newUser.email,
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
        <AddUserForm setNewUser={handleInputChange} />
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

export default AddUserModal;
