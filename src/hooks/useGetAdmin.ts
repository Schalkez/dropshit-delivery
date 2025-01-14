import { useDispatch } from "react-redux";
import http from "../utils/http";
import { apiRoutes } from "../routes/api";
import { login, logout } from "../store/slices/adminSlice";
import { RootState, store } from "../store";
import { useEffect } from "react";

export const useGetAdmin = () => {
  const state: RootState = store.getState();
  const dispatch = useDispatch();

  const getAdmin = async () => {
    try {
      const res = await http.get(apiRoutes.getAdmin);
      if (res && res.data) {
        dispatch(
          login({
            ...state.admin,
            admin: res.data?.data,
          })
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(logout());
    }
  };

  return { getAdmin };
};
