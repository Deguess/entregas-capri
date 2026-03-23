import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, User } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Historico = () => {
  const [historico, setHistorico] = useState([]);
  const [motoboys, setMotoboys] = useState([]);
  const [selectedMotoboy, setSelectedMotoboy] = useState('');
  const [filteredHistorico, setFilteredHistorico] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMotoboy) {
      setFilteredHistorico(historico.filter((h) => h.motoboy_id === selectedMotoboy));
    } else {
      setFilteredHistorico(historico);
    }
  }, [selectedMotoboy, historico]);

  const fetchData = async () => {
    try {
      const [historicoRes, motoboyRes] = await Promise.all([
        axios.get(`${API}/historico`),
        axios.get(`${API}/motoboys`),
      ]);
      setHistorico(historicoRes.data);
      setMotoboys(motoboyRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const handleDownloadPDF = async (motoboyId) => {
    try {
      const response = await axios.get(`${API}/historico/pdf/${motoboyId}`, {
        responseType: 'blob',
      });

      const motoboy = motoboys.find((m) => m.id === motoboyId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_${motoboy?.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao baixar PDF');
    }
  };

  const getMotoboyStats = (motoboyId) => {
    const entries = historico.filter((h) => h.motoboy_id === motoboyId);
    const totalKm = entries.reduce((sum, e) => sum + e.distance_km, 0);
    return { count: entries.length, totalKm: totalKm.toFixed(2) };
  };

  return (
    <div data-testid="historico-page" className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
          Histórico de Entregas
        </h1>
        <p className="text-zinc-400">Visualize entregas realizadas e gere relatórios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {motoboys.map((motoboy) => {
          const stats = getMotoboyStats(motoboy.id);
          return (
            <div
              key={motoboy.id}
              data-testid={`motoboy-stats-${motoboy.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={motoboy.avatar || 'https://via.placeholder.com/100'}
                  alt={motoboy.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{motoboy.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono">{motoboy.id.substring(0, 8)}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400">Entregas:</span>
                  <span className="text-sm font-mono text-white">{stats.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400">Km Total:</span>
                  <span className="text-sm font-mono text-white">{stats.totalKm}</span>
                </div>
              </div>

              <button
                data-testid={`btn-download-pdf-${motoboy.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleDownloadPDF(motoboy.id)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Baixar PDF
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Todas as Entregas</h2>
          <select
            data-testid="filter-motoboy"
            value={selectedMotoboy}
            onChange={(e) => setSelectedMotoboy(e.target.value)}
            className="bg-zinc-950/50 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm px-4 py-2 rounded-lg text-white"
          >
            <option value="">Todos os motoboys</option>
            {motoboys.map((motoboy) => (
              <option key={motoboy.id} value={motoboy.id}>
                {motoboy.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto scrollbar-custom">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Endereço</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Horário</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Motoboy</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Km</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistorico.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-zinc-500">
                    Nenhuma entrega registrada
                  </td>
                </tr>
              ) : (
                filteredHistorico.map((entry) => (
                  <tr
                    key={entry.id}
                    data-testid={`historico-row-${entry.order_id}`}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                  >
                    <td className="py-3 px-4 text-sm font-mono text-blue-400">{entry.order_id}</td>
                    <td className="py-3 px-4 text-sm text-zinc-300">{entry.customer_name}</td>
                    <td className="py-3 px-4 text-sm text-zinc-400">{entry.address}</td>
                    <td className="py-3 px-4 text-sm font-mono text-zinc-400">
                      {entry.delivery_time}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-300">{entry.motoboy_name}</td>
                    <td className="py-3 px-4 text-sm font-mono text-zinc-400">
                      {entry.distance_km.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Historico;
