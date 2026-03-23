import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const avatarOptions = [
  'https://images.unsplash.com/photo-1665530994348-af9b4c297402?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1569932353341-b518d82f8a54?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1709038519642-368c3fd75469?w=100&h=100&fit=crop',
];

const CadastroMotoboys = () => {
  const [motoboys, setMotoboys] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    avatar: avatarOptions[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMotoboys();
  }, []);

  const fetchMotoboys = async () => {
    try {
      const response = await axios.get(`${API}/motoboys`);
      setMotoboys(response.data);
    } catch (error) {
      console.error('Erro ao buscar motoboys:', error);
      toast.error('Erro ao carregar motoboys');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/motoboys`, formData);
      toast.success('Motoboy cadastrado com sucesso!');
      setFormData({ name: '', avatar: avatarOptions[0] });
      fetchMotoboys();
    } catch (error) {
      console.error('Erro ao criar motoboy:', error);
      toast.error('Erro ao cadastrar motoboy');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/motoboys/${id}`);
      toast.success('Motoboy deletado com sucesso!');
      fetchMotoboys();
    } catch (error) {
      console.error('Erro ao deletar motoboy:', error);
      toast.error('Erro ao deletar motoboy');
    }
  };

  return (
    <div data-testid="motoboys-page" className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Motoboys</h1>
        <p className="text-zinc-400">Cadastre e gerencie sua equipe de entregadores</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Novo Motoboy</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Nome do Entregador
            </label>
            <input
              type="text"
              data-testid="input-motoboy-name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-950/50 border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder:text-zinc-600 px-4 py-2 rounded-lg text-white"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Avatar
            </label>
            <div className="grid grid-cols-3 gap-4">
              {avatarOptions.map((avatar, idx) => (
                <div
                  key={idx}
                  data-testid={`avatar-option-${idx}`}
                  onClick={() => setFormData({ ...formData, avatar })}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    formData.avatar === avatar
                      ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-24 object-cover" />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            data-testid="btn-submit-motoboy"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Cadastrando...' : 'Cadastrar Motoboy'}
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Motoboys Cadastrados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {motoboys.length === 0 ? (
            <div className="col-span-full text-center py-8 text-zinc-500">
              Nenhum motoboy cadastrado
            </div>
          ) : (
            motoboys.map((motoboy) => (
              <div
                key={motoboy.id}
                data-testid={`motoboy-card-${motoboy.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-lg hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={motoboy.avatar || avatarOptions[0]}
                    alt={motoboy.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{motoboy.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono">{motoboy.id.substring(0, 8)}</p>
                  </div>
                  <button
                    data-testid={`btn-delete-motoboy-${motoboy.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleDelete(motoboy.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CadastroMotoboys;
