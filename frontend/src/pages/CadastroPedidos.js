import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, MapPin, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CadastroPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    order_id: '',
    customer_name: '',
    address: '',
    cep: '',
    delivery_end_time: '',
    delivery_start_time: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = pedidos.filter(
        (p) =>
          p.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.cep.includes(searchTerm)
      );
      setFilteredPedidos(filtered);
    } else {
      setFilteredPedidos(pedidos);
    }
  }, [searchTerm, pedidos]);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get(`${API}/pedidos`);
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    }
  };

  const handleEndTimeChange = (e) => {
    const endTime = e.target.value;
    setFormData({ ...formData, delivery_end_time: endTime });

    if (endTime) {
      const [hours, minutes] = endTime.split(':');
      const startHour = parseInt(hours) - 1;
      const startTime = `${startHour.toString().padStart(2, '0')}:${minutes}`;
      setFormData((prev) => ({ ...prev, delivery_start_time: startTime, delivery_end_time: endTime }));
    }
  };

  const handleAddressBlur = async () => {
    if (formData.address && formData.cep) {
      try {
        const response = await axios.post(`${API}/geocode`, {
          address: formData.address,
          cep: formData.cep,
        });
        toast.success('Endereço geocodificado com sucesso!');
      } catch (error) {
        console.error('Erro ao geocodificar:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/pedidos`, formData);
      
      if (formData.address && formData.cep) {
        try {
          await axios.post(`${API}/pedidos/${response.data.id}/geocode`);
        } catch (geocodeError) {
          console.error('Erro ao geocodificar:', geocodeError);
        }
      }

      toast.success('Pedido cadastrado com sucesso!');
      setFormData({
        order_id: '',
        customer_name: '',
        address: '',
        cep: '',
        delivery_end_time: '',
        delivery_start_time: '',
      });
      fetchPedidos();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao cadastrar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/pedidos/${id}`);
      toast.success('Pedido deletado com sucesso!');
      fetchPedidos();
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      toast.error('Erro ao deletar pedido');
    }
  };

  return (
    <div data-testid="pedidos-page" className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Pedidos/Fichas</h1>
        <p className="text-zinc-400">Cadastre e gerencie pedidos de entrega</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Novo Pedido</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                ID do Pedido/Ficha
              </label>
              <input
                type="text"
                data-testid="input-order-id"
                required
                value={formData.order_id}
                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                className="w-full bg-zinc-950/50 border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder:text-zinc-600 px-4 py-2 rounded-lg text-white font-mono"
                placeholder="Ex: F12, P34"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nome do Cliente
              </label>
              <input
                type="text"
                data-testid="input-customer-name"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full bg-zinc-950/50 border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder:text-zinc-600 px-4 py-2 rounded-lg text-white"
                placeholder="Nome completo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Endereço de Entrega
              </label>
              <input
                type="text"
                data-testid="input-address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                onBlur={handleAddressBlur}
                className="w-full bg-zinc-950/50 border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder:text-zinc-600 px-4 py-2 rounded-lg text-white"
                placeholder="Rua, número"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                CEP
              </label>
              <input
                type="text"
                data-testid="input-cep"
                required
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                className="w-full bg-zinc-950/50 border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder:text-zinc-600 px-4 py-2 rounded-lg text-white font-mono"
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Horário Fim
              </label>
              <input
                type="time"
                data-testid="input-delivery-end-time"
                required
                value={formData.delivery_end_time}
                onChange={handleEndTimeChange}
                className="w-full bg-zinc-950/50 border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder:text-zinc-600 px-4 py-2 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Horário Início (auto)
              </label>
              <input
                type="time"
                data-testid="input-delivery-start-time"
                required
                value={formData.delivery_start_time}
                readOnly
                className="w-full bg-zinc-900/50 border-zinc-700 text-sm px-4 py-2 rounded-lg text-zinc-400 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            data-testid="btn-submit-pedido"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Cadastrando...' : 'Cadastrar Pedido'}
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Pedidos Cadastrados</h2>
          <div className="flex items-center gap-4">
            <input
              type="text"
              data-testid="search-pedidos"
              placeholder="Buscar por ID, cliente, endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-950/50 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm px-4 py-2 rounded-lg text-white w-80"
            />
            <span className="text-sm text-zinc-400">
              {filteredPedidos.length} de {pedidos.length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-custom">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Endereço</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">CEP</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Horário</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-zinc-500">
                    {searchTerm ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'}
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((pedido) => (
                  <tr key={pedido.id} data-testid={`pedido-row-${pedido.order_id}`} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-3 px-4 text-sm font-mono text-blue-400">{pedido.order_id}</td>
                    <td className="py-3 px-4 text-sm text-zinc-300">{pedido.customer_name}</td>
                    <td className="py-3 px-4 text-sm text-zinc-400">{pedido.address}</td>
                    <td className="py-3 px-4 text-sm font-mono text-zinc-400">{pedido.cep}</td>
                    <td className="py-3 px-4 text-sm font-mono text-zinc-400">
                      {pedido.delivery_start_time} - {pedido.delivery_end_time}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        data-testid={`btn-delete-${pedido.order_id}`}
                        onClick={() => handleDelete(pedido.id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

export default CadastroPedidos;
