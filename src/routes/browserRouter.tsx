import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import ErrorPage from '../components/errorPage';
import Layout from '../components/layout';
import Redirect from '../components/layout/Redirect';
import NotFoundPage from '../components/notfoundPage';
import { webRoutes } from './web';
import loadable from '@loadable/component';
import ProgressBar from '../components/loader/progressBar';
import RequireAuth from './requireAuth';
import Login from '../components/auth/Login';
import About from '../components/demo-pages/about';
import Deposit from '../components/deposit';
import Withdraw from '../components/withdraw';
import HistoriesBet from '../components/history-bet';
import Bet from '../components/bet';
import UserKyc from '../components/kyc';
import Setting from '../components/setting';
import UserRef from '../components/verify-ref';
import HistoriesBetFutrue from '../components/history-futrue';
import HistoriesInvest from '../components/history-invest';
import Orders from '../components/orders';
import DetailPay from '../components/detail-pay';

const errorElement = <ErrorPage />;
const fallbackElement = <ProgressBar />;

const Dashboard = loadable(() => import('../components/dashboard'), {
  fallback: fallbackElement,
});
const Users = loadable(() => import('../components/users'), {
  fallback: fallbackElement,
});

export const browserRouter = createBrowserRouter([
  {
    path: webRoutes.home,
    element: <Redirect />,
    errorElement: errorElement,
  },

  // auth routes
  {
    element: <AuthLayout />,
    errorElement: errorElement,
    children: [
      {
        path: webRoutes.login,
        element: <Login />,
      },
    ],
  },

  // protected routes
  {
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    errorElement: errorElement,
    children: [
      {
        path: webRoutes.dashboard,
        element: <Dashboard />,
      },
      {
        path: webRoutes.orders,
        element: <Orders />,
      },
      {
        path: webRoutes.detailPay,
        element: <DetailPay />,
      },
      {
        path: webRoutes.users,
        element: <Users />,
      },
      {
        path: webRoutes.kyc,
        element: <UserKyc />,
      },
      {
        path: webRoutes.ref,
        element: <UserRef />,
      },
      {
        path: webRoutes.deposit,
        element: <Deposit />,
      },
      {
        path: webRoutes.withdraw,
        element: <Withdraw />,
      },
      {
        path: webRoutes.history_bet,
        element: <HistoriesBet />,
      },
      {
        path: webRoutes.history_bet_future,
        element: <HistoriesBetFutrue />,
      },
      {
        path: webRoutes.history_invest,
        element: <HistoriesInvest />,
      },
      {
        path: webRoutes.setting,
        element: <Setting />,
      },
      {
        path: webRoutes.bet,
        element: <Bet />,
      },
      {
        path: webRoutes.about,
        element: <About />,
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: errorElement,
  },
]);
