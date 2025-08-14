import React from "react";
import { Route, Routes } from "react-router-dom";
//import { userStore } from "../store";
import PrivateRoute from "./PrivateRoute";
import FeatureRoute from "./FeatureRoute";

const SignIn = React.lazy(() => import("../components/SignIn"));
const ForgotPassword = React.lazy(() => import("../components/ForgotPassword"));
const ResetPassword = React.lazy(() => import("../components/ResetPassword"));
const ChangePassword = React.lazy(() => import("../components/ChangePassword"));
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
const QRValidation = React.lazy(
  () => import("../components/QRValidation")
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
      {/* Public QR validation routes */}
      <Route path="/validate-qr/:token" element={<QRValidation />} />
      <Route path="/validate-qr" element={<QRValidation />} />
      <Route path="/qr-validation/:token" element={<QRValidation />} />
      <Route path="/qr-validation" element={<QRValidation />} />
      <Route
        path="/main"
        element={
          <PrivateRoute>
            <Main />
          </PrivateRoute>
        }
      >
        <Route 
          path="tuitions" 
          element={
            <FeatureRoute featureName="tuitions">
              <Tuitions />
            </FeatureRoute>
          } 
        />
        <Route 
          path="other-payments" 
          element={
            <FeatureRoute featureName="other-payments">
              <OtherPayments />
            </FeatureRoute>
          } 
        />
        <Route 
          path="statement" 
          element={
            <FeatureRoute featureName="statement">
              <Statement />
            </FeatureRoute>
          } 
        />
        <Route
          path="rubros"
          element={
            <FeatureRoute featureName="rubros">
              <Rubros />
            </FeatureRoute>
          }
        />
        <Route
          path="students"
          element={
            <FeatureRoute featureName="students">
              <Students />
            </FeatureRoute>
          }
        />
        <Route
          path="users"
          element={
            <FeatureRoute featureName="users">
              <Users />
            </FeatureRoute>
          }
        />
        <Route 
          path="payment-report" 
          element={
            <FeatureRoute featureName="payment-report">
              <PaymentReport />
            </FeatureRoute>
          } 
        />
        <Route 
          path="edit-payments" 
          element={
            <FeatureRoute featureName="edit-payments">
              <EditPayments />
            </FeatureRoute>
          } 
        />{" "}
        <Route 
          path="transport-payments" 
          element={
            <FeatureRoute featureName="transport-payments">
              <TransportPayments />
            </FeatureRoute>
          } 
        />{" "}
        <Route
          path="transport-payments-report"
          element={
            <FeatureRoute featureName="transport-payments-report">
              <TransportPaymentsReport />
            </FeatureRoute>
          }
        />
        <Route 
          path="reports" 
          element={
            <FeatureRoute featureName="reports">
              <ReportsMenu />
            </FeatureRoute>
          } 
        />
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
            <FeatureRoute featureName="routes-assignment">
              <RoutesAssignment />
            </FeatureRoute>
          }
        />
        <Route 
          path="uniforms" 
          element={
            <FeatureRoute featureName="uniforms-management">
              <UniformsMain />
            </FeatureRoute>
          } 
        />
        <Route path="uniforms/catalog" element={<PrendaUniforme />} />
        <Route
          path="uniforms/configuration"
          element={
            <FeatureRoute featureName="uniforms-configuration">
              <UniformsConfiguration />
            </FeatureRoute>
          }
        />
        <Route path="uniforms/uniform-payments" element={<UniformPayments />} />
        <Route path="uniforms/inventory" element={<UniformInventory />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
