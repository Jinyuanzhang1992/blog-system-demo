"use client";
import { useEffect, useState } from "react";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import dynamic from "next/dynamic";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { initializeApollo } from "@/lib/ apolloClient";
import { User } from "@/lib/types";
import UsersList from "@/components/UsersList";

const AddUserModal = dynamic(() => import("@/components/addUser/AddUserModal"));
const EditUserModal = dynamic(
  () => import("@/components/editUser/EditUserModal")
);

const GET_USERS = gql`
  query {
    getUsers {
      u_id
      name
      email
      posts {
        p_id
        title
        content
        comment {
          c_id
          content
        }
      }
    }
  }
`;

const USER_ADDED = gql`
  subscription {
    newUser {
      u_id
      name
      email
      posts {
        p_id
        title
        content
        comment {
          c_id
          content
        }
      }
    }
  }
`;

const USER_DELETED = gql`
  subscription {
    deletedUser {
      u_id
    }
  }
`;

const USER_UPDATED = gql`
  subscription {
    updatedUser {
      u_id
      name
      email
      posts {
        p_id
        title
        content
      }
    }
  }
`;

const DELETE_USER = gql`
  mutation ($id: String!) {
    deleteUser(id: $id) {
      u_id
    }
  }
`;

const UsersManagement: React.FC = () => {
  const apolloClient = initializeApollo();
  const { loading, error, data: usersData } = useQuery(GET_USERS);
  const [deleteUser] = useMutation(DELETE_USER);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User[] | null>(null);
  const [addUserModelOpen, setAddUserModelOpen] = useState(false);
  const [editUserModelOpen, setEditUserModelOpen] = useState(false);

  // console.log("usersData: ", usersData);
  // console.log("selectedUser: ", selectedUser);
  // console.log("users: ", users);

  useSubscription(USER_ADDED, {
    onData: ({ client, data }) => {
      const newUser = data.data.newUser;
      setUsers((prevUsers) => [...prevUsers, newUser]);
    },
    client: apolloClient,
  });

  useSubscription(USER_DELETED, {
    onData: ({ client, data }) => {
      const deletedUser = data.data.deletedUser;
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.u_id !== deletedUser.u_id)
      );
    },
    client: apolloClient,
  });

  useSubscription(USER_UPDATED, {
    onData: ({ client, data }) => {
      const updatedUser = data.data.updatedUser;
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.u_id === updatedUser.u_id ? updatedUser : user
        )
      );
    },
    client: apolloClient,
  });

  useEffect(() => {
    if (usersData) {
      setUsers(usersData.getUsers);
    }
  }, [usersData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleDeleteUser = async () => {
    if (!selectedUser || selectedUser.length === 0) {
      return;
    } else if (selectedUser.length > 1) {
      return;
    }

    try {
      const response = await deleteUser({
        variables: { id: selectedUser[0].u_id },
      });
      // console.log("response: ", response);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUserModalOpen = () => {
    setAddUserModelOpen(true);
  };

  const handleAddUserModalClose = () => {
    setAddUserModelOpen(false);
  };

  const handleAddUser = () => {
    handleAddUserModalOpen();
  };

  const handleEditUserModalOpen = () => {
    setEditUserModelOpen(true);
  };

  const handleEditUserModalClose = () => {
    setEditUserModelOpen(false);
  };

  const handleEditUser = () => {
    if (!selectedUser || selectedUser.length === 0) {
      return;
    } else if (selectedUser.length > 1) {
      return;
    }
    handleEditUserModalOpen();
  };

  return (
    <div className="h-full">
      <div className="flex gap-4 justify-end mb-4">
        <Button
          color="secondary"
          variant="outlined"
          startIcon={<SendIcon />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
        <Button
          onClick={handleEditUser}
          color="secondary"
          variant="outlined"
          startIcon={<EditIcon />}
        >
          Edit User
        </Button>
        <Button
          onClick={handleDeleteUser}
          color="secondary"
          variant="outlined"
          startIcon={<DeleteIcon />}
        >
          Delete User
        </Button>
      </div>
      <UsersList users={users} setSelectedUser={setSelectedUser} />
      <AddUserModal
        show={addUserModelOpen}
        handleClose={handleAddUserModalClose}
      />
      {selectedUser && selectedUser.length === 1 && (
        <EditUserModal
          show={editUserModelOpen}
          handleClose={handleEditUserModalClose}
          user={selectedUser[0]}
        />
      )}
    </div>
  );
};

export default UsersManagement;
