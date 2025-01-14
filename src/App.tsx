import { Toaster } from "sonner";
import { RouterProvider, useNavigate } from "react-router-dom";
import { browserRouter } from "./routes/browserRouter";
import io from "socket.io-client";
import { useContext, useEffect } from "react";
import { DataContext } from "./context/SocketProvider";

import { RootState, store } from "./store";
import http from "./utils/http";
import { useDispatch } from "react-redux";
import { login, logout } from "./store/slices/adminSlice";
import { apiRoutes } from "./routes/api";
import { ConfigProvider } from "antd";
import { useGetAdmin } from "./hooks/useGetAdmin";

function App() {
  const context = useContext(DataContext);
  const handleSetSocket = context.setSocket;
  const { getAdmin } = useGetAdmin();

  useEffect(() => {
    getAdmin();
  }, [getAdmin]);

  // useEffect(() => {
  //   const socket = io(`${import.meta.env.VITE_SOCKET_URL}`);
  //   if (state.admin?.admin) socket.emit("joinApp", state.admin?.admin);
  //   handleSetSocket(socket);
  // }, [state.admin?.admin]);

  return (
    <div className="fade-in">
      <RouterProvider router={browserRouter} />
      <Toaster />
    </div>
  );
}

export default App;
