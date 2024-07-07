import { createSlice } from "@reduxjs/toolkit";

const postsDataSlice = createSlice({
  name: "postsData",
  initialState: [],
  reducers: {
    setPostsData: (state, action) => {
      return action.payload;
    },
  },
});

export const { setPostsData } = postsDataSlice.actions;
export default postsDataSlice.reducer;
