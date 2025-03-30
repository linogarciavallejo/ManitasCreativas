import React from "react";
import { Route, Routes } from "react-router-dom";
//import { userStore } from "../store";
//import PrivateRoute from "./PrivateRoute";

const SignIn = React.lazy(() => import("../components/SignIn"));


const AppRoutes: React.FC = () => {
  //userStore();

  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
    </Routes>
  );
};

export default AppRoutes;
