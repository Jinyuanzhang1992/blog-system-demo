import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk"; // 导入命名导出 thunk
import postsDataReducer from "./postsData";

// 配置 store
const store = configureStore({
  reducer: {
    postsData: postsDataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["somePath.register"],
      },
    }).concat(thunk),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
