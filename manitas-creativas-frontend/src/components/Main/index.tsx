import React, { useState } from "react";
import useSessionExpiration from "../../hooks/useSessionExpiration";
import { signOut, hasAdminAccess  } from "../../services/authService";
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
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const Main: React.FC = () => {
  useSessionExpiration();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = hasAdminAccess();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const handleSignOut = () => {
    signOut();
    navigate("/"); // Redirect to login page after signing out
  };
  // Build menu items conditionally based on admin access
  const menuItems = [
    {
      key: "1",
      icon: <CreditCardOutlined />,
      label: <Link to="tuitions">Colegiaturas</Link>,
    },
    {
      key: "2",
      icon: <FileTextOutlined />,
      label: <Link to="transport-payments">Pagos de Bus</Link>,
    },
    {
      key: "3",
      icon: <DollarOutlined />,
      label: <Link to="other-payments">Otros Pagos</Link>,
    },
    {
      key: "4",
      icon: <DollarOutlined />,
      label: <Link to="edit-payments">Editar/Anular Pagos</Link>,
    },
    {
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
    },
    {
      key: "5",
      icon: <FileTextOutlined />,
      label: <Link to="payment-report">Control de Pagos</Link>,
    },
    {
      key: "6",
      icon: <FileTextOutlined />,
      label: (
        <Link to="transport-payments-report">Reporte de Pagos de Bus</Link>
      ),
    },
    {
      key: "7",
      icon: <BarChartOutlined />,
      label: <Link to="reports">Centro de Reportes</Link>,
    },
    {
      key: "8",
      icon: <BankOutlined />,
      label: <Link to="statement">Estado de Cuenta</Link>,
    },
    // Admin-only section
    ...(isAdmin
      ? [
          {
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
          },
          {
            key: "9",
            icon: <TagOutlined />,
            label: <Link to="rubros">Rubros</Link>,
          },
          {
            key: "10",
            icon: <IdcardOutlined />,
            label: <Link to="students">Alumnos</Link>,
          },
          {
            key: "11",
            icon: <CarOutlined />,
            label: <Link to="routes-assignment">Asignación de Rutas</Link>,
          },
          {
            key: "11.5",
            icon: <AppstoreOutlined />,
            label: <Link to="uniforms">Gestión de Uniformes</Link>,
          },
          {
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
          },
          {
            key: "12",
            icon: <UserOutlined />,
            label: <Link to="users">Usuarios</Link>,
          },
        ]
      : []),
    {
      key: "13",
      icon: <LogoutOutlined />,
      label: "Salir",
      onClick: handleSignOut,
    },
  ];
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
