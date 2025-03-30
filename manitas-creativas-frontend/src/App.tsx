import React, { Suspense } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from './routing/routes';

const App: React.FC = () => {
  return (
      <Router>
          <Suspense fallback={<div>Cargando...</div>}>
              <AppRoutes />
          </Suspense>
      </Router>
  );
}

export default App;