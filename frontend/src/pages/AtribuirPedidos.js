import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AtribuirPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [motoboys, setMotoboys] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pedidosRes, motoboyRes] = await Promise.all([
        axios.get(`${API}/pedidos`),
        axios.get(`${API}/motoboys`),
      ]);
      setPedidos(pedidosRes.data);
      setMotoboys(motoboyRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const handleAssign = (pedidoId, motoboyId) => {
    setAssignments({ ...assignments, [pedidoId]: motoboyId });
  };

  const handleSaveAssignments = async () => {
    setLoading(true);

    try {
      const assignedPedidos = Object.entries(assignments);

      for (const [pedidoId, motoboyId] of assignedPedidos) {
        const pedido = pedidos.find((p) => p.id === pedidoId);
        const motoboy = motoboys.find((m) => m.id === motoboyId);

        if (pedido && motoboy) {
          await axios.post(`${API}/historico`, {
            order_id: pedido.order_id,
            customer_name: pedido.customer_name,
            address: pedido.address,
            cep: pedido.cep,
            delivery_time: `${pedido.delivery_start_time} - ${pedido.delivery_end_time}`,
            distance_km: 0,
            motoboy_id: motoboy.id,
            motoboy_name: motoboy.name,
          });
        }
      }

      toast.success('Atribuições salvas no histórico!');
      setAssignments({});
    } catch (error) {
      console.error('Erro ao salvar atribuições:', error);
      toast.error('Erro ao salvar atribuições');
    } finally {
      setLoading(false);
    }
  };

  const getMotoboyName = (motoboyId) => {
    const motoboy = motoboys.find((m) => m.id === motoboyId);
    return motoboy ? motoboy.name : 'N/A';
  };

  return (
    <div data-testid="atribuir-page" className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
          Atribuir Pedidos
        </h1>
        <p className="text-zinc-400">Atribua pedidos a motoboys específicos</p>
      </div>

      {motoboys.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <UserCheck className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">Cadastre motoboys primeiro</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Pedidos Disponíveis</h2>
            <button
              data-testid="btn-save-assignments"
              onClick={handleSaveAssignments}
              disabled={loading || Object.keys(assignments).length === 0}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Atribuições'}
            </button>
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
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-zinc-500">
                      Nenhum pedido disponível
                    </td>
                  </tr>
                ) : (
                  pedidos.map((pedido) => (
                    <tr
                      key={pedido.id}
                      data-testid={`assign-row-${pedido.order_id}`}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                    >
                      <td className="py-3 px-4 text-sm font-mono text-blue-400">
                        {pedido.order_id}
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-300">{pedido.customer_name}</td>
                      <td className="py-3 px-4 text-sm text-zinc-400">{pedido.address}</td>
                      <td className="py-3 px-4 text-sm font-mono text-zinc-400">
                        {pedido.delivery_start_time} - {pedido.delivery_end_time}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          data-testid={`select-motoboy-${pedido.order_id}`}
                          value={assignments[pedido.id] || ''}
                          onChange={(e) => handleAssign(pedido.id, e.target.value)}
                          className="bg-zinc-950/50 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm px-3 py-1 rounded-lg text-white"
                        >
                          <option value="">Selecionar</option>
                          {motoboys.map((motoboy) => (
                            <option key={motoboy.id} value={motoboy.id}>
                              {motoboy.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {Object.keys(assignments).length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Atribuições Pendentes</h2>
          <div className="space-y-2">
            {Object.entries(assignments).map(([pedidoId, motoboyId]) => {
              const pedido = pedidos.find((p) => p.id === pedidoId);
              return (
                <div
                  key={pedidoId}
                  className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 flex justify-between items-center"
                >
                  <div>
                    <span className="font-mono text-blue-400 text-sm">{pedido?.order_id}</span>
                    <span className="text-zinc-400 text-sm mx-2">→</span>
                    <span className="text-green-400 text-sm">{getMotoboyName(motoboyId)}</span>
                  </div>
                  <button
                    onClick={() => {
                      const newAssignments = { ...assignments };
                      delete newAssignments[pedidoId];
                      setAssignments(newAssignments);
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remover
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AtribuirPedidos;
