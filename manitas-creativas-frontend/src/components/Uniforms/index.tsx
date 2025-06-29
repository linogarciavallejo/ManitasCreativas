import React from 'react';
import { Card, Row, Col, Button, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import {
  AppstoreOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const UniformsMain: React.FC = () => {
  const menuOptions = [
    {
      title: 'Catálogo de Uniformes',
      description: 'Gestión de prendas de uniforme, precios, tallas y stock',
      icon: <AppstoreOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      link: '/main/uniforms/catalog',
      color: '#e6f7ff'
    },
    {
      title: 'Inventario y Stock',
      description: 'Control de entradas, salidas y existencias de uniformes',
      icon: <InboxOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      link: '/main/uniforms/inventory',
      color: '#f6ffed'
    },
    {
      title: 'Configuración de Uniformes',
      description: 'Asociación de prendas con rubros de pago y configuración general',
      icon: <SettingOutlined style={{ fontSize: '32px', color: '#fa541c' }} />,
      link: '/main/uniforms/configuration',
      color: '#fff2e8'
    },
    {
      title: 'Ventas de Uniformes',
      description: 'Registro y gestión de ventas de uniformes a estudiantes',
      icon: <ShoppingCartOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />,
      link: '/main/uniforms/sales',
      color: '#fff0f6'
    },
    {
      title: 'Reportes',
      description: 'Reportes de ventas, inventario y estadísticas de uniformes',
      icon: <BarChartOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      link: '/main/uniforms/reports',
      color: '#f9f0ff'
    },
    {
      title: 'Configuración',
      description: 'Configuración general del módulo de uniformes',
      icon: <SettingOutlined style={{ fontSize: '32px', color: '#13c2c2' }} />,
      link: '/main/uniforms/settings',
      color: '#e6fffb'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title level={1}>
          Gestión de Uniformes
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Sistema integral para la gestión de uniformes escolares: catálogo, inventario, ventas y reportes
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {menuOptions.map((option, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Link to={option.link}>
              <Card
                hoverable
                style={{
                  height: '200px',
                  borderRadius: '12px',
                  backgroundColor: option.color,
                  border: 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                bodyStyle={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '24px'
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>{option.icon}</div>
                  <div>
                    <Title level={4} style={{ margin: 0, color: '#262626' }}>
                      {option.title}
                    </Title>
                    <Paragraph
                      style={{
                        margin: '8px 0 0 0',
                        color: '#595959',
                        fontSize: '14px'
                      }}
                    >
                      {option.description}
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Card style={{ backgroundColor: '#fafafa', border: 'none' }}>
          <Title level={4}>¿Necesitas ayuda?</Title>
          <Paragraph>
            Consulta la documentación o contacta al administrador del sistema para obtener asistencia 
            con el módulo de gestión de uniformes.
          </Paragraph>
          <Space>
            <Button type="primary" ghost>
              Ver Documentación
            </Button>
            <Button type="default">
              Contactar Soporte
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default UniformsMain;
