import React, { useState, useMemo, useCallback } from "react";
import useSessionExpiration from "../../hooks/useSessionExpiration";
import { useFeatureFlags } from "../../hooks/useFeatureFlags";
import { signOut } from "../../services/authService";
import "antd/dist/reset.css"; // Import Ant Design styles
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BankOutlined,
  DollarOutlined,
  FileTextOutlined,
  IdcardOutlined,
  TagOutlined,
  CreditCardOutlined,
  UserOutlined,
  LogoutOutlined,
  BarChartOutlined,
  //PieChartOutlined,
  CarOutlined,
  AppstoreOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const Main: React.FC = () => {
  useSessionExpiration();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { isFeatureAvailable, isLoading } = useFeatureFlags();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const handleSignOut = useCallback(() => {
    signOut();
    navigate("/"); // Redirect to login page after signing out
  }, [navigate]);

  // Build menu items dynamically based on feature flags
  const menuItems = useMemo(() => {
    if (isLoading) {
      return []; // Return empty array while loading
    }

    const items = [];

    // Always available features (basic functionality)
    if (isFeatureAvailable("tuitions")) {
      items.push({
        key: "1",
        icon: <CreditCardOutlined />,
        label: <Link to="tuitions">Colegiaturas</Link>,
      });
    }

    if (isFeatureAvailable("transport-payments")) {
      items.push({
        key: "2",
        icon: <FileTextOutlined />,
        label: <Link to="transport-payments">Pagos de Bus</Link>,
      });
    }

    if (isFeatureAvailable("other-payments")) {
      items.push({
        key: "3",
        icon: <DollarOutlined />,
        label: <Link to="other-payments">Otros Pagos</Link>,
      });
    }

    if (isFeatureAvailable("edit-payments")) {
      items.push({
        key: "4",
        icon: <DollarOutlined />,
        label: <Link to="edit-payments">Editar/Anular Pagos</Link>,
      });
    }

    // Add divider if any report features are available
    const hasReportFeatures = [
      "payment-report", 
      "transport-payments-report", 
      "reports", 
      "statement"
    ].some(feature => isFeatureAvailable(feature));

    if (hasReportFeatures) {
      items.push({
        key: "divider-1",
        disabled: true,
        label: (
          <div
            style={{
              borderTop: "1px solid #F99F1F",
              margin: "8px 0",
              opacity: 0.6,
            }}
          ></div>
        ),
      });
    }

    if (isFeatureAvailable("payment-report")) {
      items.push({
        key: "5",
        icon: <FileTextOutlined />,
        label: <Link to="payment-report">Control de Pagos</Link>,
      });
    }

    if (isFeatureAvailable("transport-payments-report")) {
      items.push({
        key: "6",
        icon: <FileTextOutlined />,
        label: (
          <Link to="transport-payments-report">Reporte de Pagos de Bus</Link>
        ),
      });
    }

    if (isFeatureAvailable("reports")) {
      items.push({
        key: "7",
        icon: <BarChartOutlined />,
        label: <Link to="reports">Centro de Reportes</Link>,
      });
    }

    if (isFeatureAvailable("statement")) {
      items.push({
        key: "8",
        icon: <BankOutlined />,
        label: <Link to="statement">Estado de Cuenta</Link>,
      });
    }

    // Admin features section
    const adminFeatures = [
      "rubros",
      "students", 
      "routes-assignment",
      "uniforms-configuration",
      "users"
    ].some(feature => isFeatureAvailable(feature));

    if (adminFeatures) {
      items.push({
        key: "divider-2",
        disabled: true,
        label: (
          <div
            style={{
              borderTop: "1px solid #F99F1F",
              margin: "8px 0",
              opacity: 0.6,
            }}
          ></div>
        ),
      });
    }

    if (isFeatureAvailable("rubros")) {
      items.push({
        key: "9",
        icon: <TagOutlined />,
        label: <Link to="rubros">Rubros</Link>,
      });
    }

    if (isFeatureAvailable("students")) {
      items.push({
        key: "10",
        icon: <IdcardOutlined />,
        label: <Link to="students">Alumnos</Link>,
      });
    }

    if (isFeatureAvailable("routes-assignment")) {
      items.push({
        key: "11",
        icon: <CarOutlined />,
        label: <Link to="routes-assignment">Asignación de Rutas</Link>,
      });
    }

    if (isFeatureAvailable("uniforms-management")) {
      items.push({
        key: "11.5",
        icon: <AppstoreOutlined />,
        label: <Link to="uniforms">Gestión de Uniformes</Link>,
      });
    }

    if (isFeatureAvailable("users")) {
      items.push({
        key: "divider-3",
        disabled: true,
        label: (
          <div
            style={{
              borderTop: "1px solid #F99F1F",
              margin: "8px 0",
              opacity: 0.6,
            }}
          ></div>
        ),
      });

      items.push({
        key: "12",
        icon: <UserOutlined />,
        label: <Link to="users">Usuarios</Link>,
      });
    }

    // Always show change password and sign out
    items.push({
      key: "divider-settings",
      disabled: true,
      label: (
        <div
          style={{
            borderTop: "1px solid #F99F1F",
            margin: "8px 0",
            opacity: 0.6,
          }}
        ></div>
      ),
    });

    items.push({
      key: "12.5",
      icon: <KeyOutlined />,
      label: <Link to="change-password">Cambiar Contraseña</Link>,
    });

    items.push({
      key: "13",
      icon: <LogoutOutlined />,
      label: "Salir",
      onClick: handleSignOut,
    });

    return items;
  }, [isFeatureAvailable, isLoading, handleSignOut]);
  return (
    <Layout style={{ minHeight: "100vh", width: "100%" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>{" "}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            width: "100%",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Main;
