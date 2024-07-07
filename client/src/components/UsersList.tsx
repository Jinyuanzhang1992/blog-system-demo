import * as React from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { User } from "@/lib/types";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 130 },
  { field: "email", headerName: "Email", width: 250 },
  { field: "postTitle", headerName: "Post Title", width: 130 },
  {
    field: "postContent",
    headerName: "Post Content",
    width: 550,
    renderCell: (params) => (
      <div
        style={{
          whiteSpace: "normal",
          wordBreak: "break-word",
          display: "inline-block",
          lineHeight: "1.5",
        }}
      >
        {params.value}
      </div>
    ),
  },
];

interface UsersListProps {
  users: User[];
  setSelectedUser: React.Dispatch<React.SetStateAction<any>>;
}

const UsersList: React.FC<UsersListProps> = ({ users, setSelectedUser }) => {
  const rows = users.map((user: User) => {
    return {
      id: user.u_id,
      name: user.name,
      email: user.email,
      postContent: user.posts?.content || "",
      postTitle: user.posts?.title || "",
    };
  });

  const handleSelectionModelChange = (
    newSelectionModel: GridRowSelectionModel
  ) => {
    let selectedData: any = [];
    selectedData = newSelectionModel.map((id) =>
      users.find((user: User) => user.u_id === id)
    );
    // console.log("selectedData:", selectedData);
    setSelectedUser(selectedData);
  };
  //newSelectionModel指的是选中的行的id
  //selectedUsers是选中的行的数据

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        onRowSelectionModelChange={handleSelectionModelChange}
      />
    </div>
  );
};

export default UsersList;
