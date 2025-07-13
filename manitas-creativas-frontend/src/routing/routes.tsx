import React from "react";
import { Route, Routes } from "react-router-dom";
//import { userStore } from "../store";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

const SignIn = React.lazy(() => import("../components/SignIn"));
const ForgotPassword = React.lazy(() => import("../components/ForgotPassword"));
const ResetPassword = React.lazy(() => import("../components/ResetPassword"));
const Main = React.lazy(() => import("../components/Main"));
const Tuitions = React.lazy(() => import("../components/Tuitions"));
const OtherPayments = React.lazy(() => import("../components/OtherPayments"));
const Statement = React.lazy(() => import("../components/Statement"));
const Rubros = React.lazy(() => import("../components/Rubros"));
const Students = React.lazy(() => import("../components/Students"));
const Users = React.lazy(() => import("../components/Users"));
const PaymentReport = React.lazy(() => import("../components/PaymentReport"));
const EditPayments = React.lazy(() => import("../components/EditPayments"));
const TransportPayments = React.lazy(
  () => import("../components/TransportPayments")
);
const TransportPaymentsReport = React.lazy(
  () => import("../components/TransportPaymentsReport/index")
);
const MonthlyPaymentReport = React.lazy(
  () => import("../components/Reports/MonthlyPayments")
);
const ReportsMenu = React.lazy(
  () => import("../components/Reports/ReportsMenu")
);
const TuitionDebtorsReport = React.lazy(
  () => import("../components/Reports/TuitionDebtors")
);
const TransportDebtorsReport = React.lazy(
  () => import("../components/Reports/TransportDebtors")
);
const RoutesAssignment = React.lazy(
  () => import("../components/RoutesAssignment")
);
const UniformsMain = React.lazy(() => import("../components/Uniforms"));
const PrendaUniforme = React.lazy(
  () => import("../components/Uniforms/Catalog")
);
const UniformsConfiguration = React.lazy(
  () => import("../components/Uniforms/Configuration")
);
const UniformPayments = React.lazy(
  () => import("../components/UniformPayments")
);
const UniformInventory = React.lazy(
  () => import("../components/Uniforms/Inventory")
);

const AppRoutes: React.FC = () => {
  //userStore();

  return (
    <Routes>
      {" "}
      <Route path="/" element={<SignIn />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/main"
        element={
          <PrivateRoute>
            <Main />
          </PrivateRoute>
        }
      >
        <Route path="tuitions" element={<Tuitions />} />
        <Route path="other-payments" element={<OtherPayments />} />
        <Route path="statement" element={<Statement />} />{" "}
        <Route
          path="rubros"
          element={
            <AdminRoute>
              <Rubros />
            </AdminRoute>
          }
        />
        <Route
          path="students"
          element={
            <AdminRoute>
              <Students />
            </AdminRoute>
          }
        />
        <Route
          path="users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
        <Route path="payment-report" element={<PaymentReport />} />
        <Route path="edit-payments" element={<EditPayments />} />{" "}
        <Route path="transport-payments" element={<TransportPayments />} />{" "}
        <Route
          path="transport-payments-report"
          element={<TransportPaymentsReport />}
        />{" "}
        <Route path="reports" element={<ReportsMenu />} />{" "}
        <Route
          path="monthly-payments-report"
          element={<MonthlyPaymentReport />}
        />
        <Route
          path="tuition-debtors-report"
          element={<TuitionDebtorsReport />}
        />
        <Route
          path="transport-debtors-report"
          element={<TransportDebtorsReport />}
        />
        <Route
          path="routes-assignment"
          element={
            <AdminRoute>
              <RoutesAssignment />
            </AdminRoute>
          }
        />
        <Route path="uniforms" element={<UniformsMain />} />
        <Route path="uniforms/catalog" element={<PrendaUniforme />} />
        <Route
          path="uniforms/configuration"
          element={<UniformsConfiguration />}
        />
        <Route path="uniforms/uniform-payments" element={<UniformPayments />} />
        <Route path="uniforms/inventory" element={<UniformInventory />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
