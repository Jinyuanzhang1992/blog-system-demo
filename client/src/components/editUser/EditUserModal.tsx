import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import dynamic from "next/dynamic";
import Typography from "@mui/material/Typography";
import { gql, useMutation } from "@apollo/client";

const EditUserForm = dynamic(
  () => import("@/components/editUser/EditUserForm")
);

const UPDATE_USER = gql`
  mutation ($id: String!, $name: String!, $email: String!) {
    updateUser(id: $id, name: $name, email: $email) {
      u_id
      name
      email
    }
  }
`;

interface EditUserModalProps {
  show: boolean;
  handleClose: () => void;
  user: {
    u_id: string;
    name: string;
    email: string;
  };
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  show,
  handleClose,
  user,
}) => {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    u_id: "",
  });
  const [updateUser] = useMutation(UPDATE_USER);

  const [isValid, setIsValid] = useState(true);

  // console.log("newUser: ", newUser);
  // console.log("user: ", user);

  useEffect(() => {
    if (user) {
      setNewUser({
        name: user.name,
        email: user.email,
        u_id: user.u_id,
      });
    }
  }, [user]);

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
      const response = await updateUser({
        variables: {
          id: newUser.u_id,
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
        <EditUserForm setNewUser={handleInputChange} user={user} />
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

export default EditUserModal;
