import { Outlet } from 'react-router-dom';
import ToastContainer from '../components/ToastContainer';

const AuthLayout = () => (
  <>
    <Outlet />
    <ToastContainer />
  </>
);

export default AuthLayout;
