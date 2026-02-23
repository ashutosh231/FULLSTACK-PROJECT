import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "../store/slices/authSlice";

const AuthInit = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return children;
};

export default AuthInit;
