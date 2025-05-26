import React from "react";
import { Route, Routes } from "react-router-dom";
//import { userStore } from "../store";
//import PrivateRoute from "./PrivateRoute";

const SignIn = React.lazy(() => import("../components/SignIn"));
const Main = React.lazy(() => import("../components/Main"));
const Tuitions = React.lazy(() => import("../components/Tuitions"));
const OtherPayments = React.lazy(() => import("../components/OtherPayments"));
const Statement = React.lazy(() => import("../components/Statement"));
const Rubros = React.lazy(() => import("../components/Rubros"));
const Students = React.lazy(() => import("../components/Students"));
const PaymentReport = React.lazy(() => import("../components/PaymentReport"));
const EditPayments = React.lazy(() => import("../components/EditPayments"));

const AppRoutes: React.FC = () => {
  //userStore();

  return (
    <Routes>
      {" "}
      <Route path="/" element={<SignIn />} />
      <Route path="/main" element={<Main />}>
        <Route path="tuitions" element={<Tuitions />} />
        <Route path="other-payments" element={<OtherPayments />} />
        <Route path="statement" element={<Statement />} />
        <Route path="rubros" element={<Rubros />} />
        <Route path="students" element={<Students />} />
        <Route path="payment-report" element={<PaymentReport />} />
        <Route path="edit-payments" element={<EditPayments />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
