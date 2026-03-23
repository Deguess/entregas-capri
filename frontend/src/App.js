import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CadastroPedidos from './pages/CadastroPedidos';
import CadastroMotoboys from './pages/CadastroMotoboys';
import OtimizacaoRotas from './pages/OtimizacaoRotas';
import AtribuirPedidos from './pages/AtribuirPedidos';
import Historico from './pages/Historico';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pedidos" element={<CadastroPedidos />} />
          <Route path="motoboys" element={<CadastroMotoboys />} />
          <Route path="rotas" element={<OtimizacaoRotas />} />
          <Route path="atribuir" element={<AtribuirPedidos />} />
          <Route path="historico" element={<Historico />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
