import { Toaster } from 'sonner';
import { RouterProvider, useNavigate } from 'react-router-dom';
import { browserRouter } from './routes/browserRouter';
import io from 'socket.io-client';
import { useContext, useEffect } from 'react';
import { DataContext } from './context/SocketProvider';

import { RootState, store } from './store';
import http from './utils/http';
import { useDispatch } from 'react-redux';
import { login, logout } from './store/slices/adminSlice';
import { apiRoutes } from './routes/api';

function App() {
  const context = useContext(DataContext);
  const handleSetSocket = context.setSocket;
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

  useEffect(() => {
    getAdmin();
  }, [state.admin]);
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
