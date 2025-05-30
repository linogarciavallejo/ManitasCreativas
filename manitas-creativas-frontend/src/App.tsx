import React, { Suspense } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from './routing/routes';

//import 'antd/dist/reset.css'; // Import Ant Design styles

import { Layout } from 'antd';

import './assets/manitasv1.css';
//import logo from './assets/logo_v1.jpg';

//const { Header, Content } = Layout;
const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Router>
      <Layout style={{ width: '100%', minHeight: '100vh' }}>
        <Content style={{ width: '100%' }}>
          <Suspense fallback={<div>Cargando...</div>}>
            <AppRoutes />
          </Suspense>
        </Content>
      </Layout>
    </Router>
  );
};

export default App;