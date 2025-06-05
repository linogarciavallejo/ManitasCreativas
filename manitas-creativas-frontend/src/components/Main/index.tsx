import React, { useState } from "react";
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
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { Link, Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const Main: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{ minHeight: "100vh", width: "100%" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          items={[
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
                <Link to="transport-payments-report">
                  Reporte de Pagos de Bus
                </Link>
              ),
            },
            {
              key: "7",
              icon: <BankOutlined />,
              label: <Link to="statement">Estado de Cuenta</Link>,
            },
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
              key: "8",
              icon: <TagOutlined />,
              label: <Link to="rubros">Rubros</Link>,
            },
            {
              key: "9",
              icon: <IdcardOutlined />,
              label: <Link to="students">Alumnos</Link>,
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
            },            {
              key: "10",
              icon: <UserOutlined />,
              label: <Link to="students">Usuarios</Link>,
            },
            {
              key: "11",
              icon: <LogoutOutlined />,
              label: <Link to="students">Salir</Link>,
            },
            // {
            //   key: "11",
            //   icon: <FileTextOutlined />,
            //   label: <Link to="settings">Configuración</Link>,
            // },

          ]}
        />
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
