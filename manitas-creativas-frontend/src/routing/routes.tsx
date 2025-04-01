import React from "react";
import { Route, Routes } from "react-router-dom";
//import { userStore } from "../store";
//import PrivateRoute from "./PrivateRoute";

const SignIn = React.lazy(() => import("../components/SignIn"));
const Main = React.lazy(() => import("../components/Main"));
const Payments = React.lazy(() => import("../components/Payments"));

const AppRoutes: React.FC = () => {
  //userStore();

  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/main" element={<Main />}>
        <Route path="payments" element={<Payments />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
