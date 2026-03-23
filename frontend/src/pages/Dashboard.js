import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Users, MapPin, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPedidos: 0,
    totalMotoboys: 0,
    totalEntregas: 0,
    totalKm: 0,
  });
  const [pedidosPorHorario, setPedidosPorHorario] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [pedidosRes, motoboyRes, historicoRes] = await Promise.all([
        axios.get(`${API}/pedidos`),
        axios.get(`${API}/motoboys`),
        axios.get(`${API}/historico`),
      ]);

      const totalKm = historicoRes.data.reduce((sum, h) => sum + h.distance_km, 0);

      setStats({
        totalPedidos: pedidosRes.data.length,
        totalMotoboys: motoboyRes.data.length,
        totalEntregas: historicoRes.data.length,
        totalKm: totalKm.toFixed(2),
      });

      const horarios = {};
      pedidosRes.data.forEach((pedido) => {
        const slot = `${pedido.delivery_start_time} - ${pedido.delivery_end_time}`;
        if (!horarios[slot]) {
          horarios[slot] = 0;
        }
        horarios[slot]++;
      });

      const horariosList = Object.entries(horarios)
        .map(([slot, count]) => ({ slot, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setPedidosPorHorario(horariosList);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const statCards = [
    {
      icon: Package,
      label: 'Pedidos Ativos',
      value: stats.totalPedidos,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      testId: 'stat-pedidos',
    },
    {
      icon: Users,
      label: 'Motoboys',
      value: stats.totalMotoboys,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      testId: 'stat-motoboys',
    },
    {
      icon: MapPin,
      label: 'Entregas Realizadas',
      value: stats.totalEntregas,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      testId: 'stat-entregas',
    },
    {
      icon: TrendingUp,
      label: 'Km Total',
      value: stats.totalKm,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      testId: 'stat-km',
    },
  ];

  return (
    <div data-testid="dashboard-page" className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Visão geral da operação de entregas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              data-testid={stat.testId}
              className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-lg relative overflow-hidden group hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold font-mono text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Bem-vindo ao Sistema</h2>
        <div className="space-y-3 text-zinc-400">
          <p>• <strong className="text-white">Pedidos/Fichas:</strong> Cadastre novos pedidos de entrega</p>
          <p>• <strong className="text-white">Motoboys:</strong> Gerencie sua equipe de entregadores</p>
          <p>• <strong className="text-white">Otimização:</strong> Calcule rotas otimizadas por horário</p>
          <p>• <strong className="text-white">Atribuir:</strong> Atribua pedidos a motoboys específicos</p>
          <p>• <strong className="text-white">Histórico:</strong> Visualize entregas realizadas e gere relatórios PDF</p>
        </div>
      </div>

      {pedidosPorHorario.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Horários com Mais Entregas</h2>
          <div className="space-y-3">
            {pedidosPorHorario.map((horario, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-sm">{idx + 1}</span>
                  </div>
                  <span className="text-white font-mono">{horario.slot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-mono text-blue-400">{horario.count}</span>
                  <span className="text-sm text-zinc-500">pedidos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
