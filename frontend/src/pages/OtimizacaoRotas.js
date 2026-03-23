import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Route, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const START_POINT = {
  lat: -23.633,
  lon: -46.608,
  address: 'Rua Nossa Senhora das Mercês, 876',
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const OtimizacaoRotas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [numMotoboys, setNumMotoboys] = useState(1);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
    const slots = [...new Set(pedidos.map((p) => `${p.delivery_start_time} - ${p.delivery_end_time}`))];
    setTimeSlots(slots.sort());
  }, [pedidos]);

  useEffect(() => {
    if (selectedTimeSlot) {
      const [start, end] = selectedTimeSlot.split(' - ');
      const filtered = pedidos.filter(
        (p) => p.delivery_start_time === start && p.delivery_end_time === end
      );
      setFilteredPedidos(filtered);
    } else {
      setFilteredPedidos([]);
    }
  }, [selectedTimeSlot, pedidos]);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get(`${API}/pedidos`);
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    }
  };

  const handleOptimize = async () => {
    if (!selectedTimeSlot) {
      toast.error('Selecione um horário');
      return;
    }

    if (filteredPedidos.length === 0) {
      toast.error('Nenhum pedido encontrado para este horário');
      return;
    }

    const pedidosWithoutCoords = filteredPedidos.filter((p) => !p.latitude || !p.longitude);
    if (pedidosWithoutCoords.length > 0) {
      toast.error(`${pedidosWithoutCoords.length} pedido(s) sem coordenadas. Geocodifique-os primeiro.`);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/optimize-routes`, {
        pedido_ids: filteredPedidos.map((p) => p.id),
        num_motoboys: numMotoboys,
        start_lat: START_POINT.lat,
        start_lon: START_POINT.lon,
      });

      setOptimizedRoutes(response.data);
      toast.success('Rotas otimizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao otimizar rotas:', error);
      toast.error('Erro ao otimizar rotas');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (clusterIndex) => {
    const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[clusterIndex % colors.length];
  };

  const decodePolyline = (geometry) => {
    if (!geometry || !geometry.coordinates) return [];
    return geometry.coordinates.map((coord) => [coord[1], coord[0]]);
  };

  return (
    <div data-testid="rotas-page" className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Otimização de Rotas</h1>
        <p className="text-zinc-400">Calcule rotas otimizadas por horário de entrega</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Configurações</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Horário de Entrega
                </label>
                <select
                  data-testid="select-time-slot"
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm px-4 py-2 rounded-lg text-white font-mono"
                >
                  <option value="">Selecione um horário</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Número de Motoboys
                </label>
                <input
                  type="number"
                  data-testid="input-num-motoboys"
                  min="1"
                  max="10"
                  value={numMotoboys}
                  onChange={(e) => setNumMotoboys(parseInt(e.target.value))}
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm px-4 py-2 rounded-lg text-white font-mono"
                />
              </div>

              <button
                data-testid="btn-optimize-routes"
                onClick={handleOptimize}
                disabled={loading || !selectedTimeSlot}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 px-6 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                {loading ? 'Otimizando...' : 'Otimizar Rotas'}
              </button>
            </div>
          </div>

          {filteredPedidos.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Pedidos Selecionados ({filteredPedidos.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-custom">
                {filteredPedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50"
                  >
                    <p className="text-sm font-mono text-blue-400">{pedido.order_id}</p>
                    <p className="text-xs text-zinc-400">{pedido.customer_name}</p>
                    {(!pedido.latitude || !pedido.longitude) && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Sem coordenadas
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {optimizedRoutes && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Rotas Calculadas</h3>
              <div className="space-y-3">
                {optimizedRoutes.clusters.map((cluster, idx) => (
                  <div
                    key={idx}
                    data-testid={`cluster-${idx}`}
                    className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getMarkerColor(idx) }}
                      ></div>
                      <h4 className="text-sm font-semibold text-white">Motoboy {idx + 1}</h4>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">
                      {cluster.pedidos.length} entrega(s) | {cluster.distance_km} km
                    </p>
                    <div className="space-y-1">
                      {cluster.pedidos.map((pedido) => (
                        <p key={pedido.id} className="text-xs font-mono text-blue-400">
                          • {pedido.order_id} - {pedido.customer_name}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[calc(100vh-12rem)]">
            <MapContainer
              center={[START_POINT.lat, START_POINT.lon]}
              zoom={13}
              className="w-full h-full"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              <Marker position={[START_POINT.lat, START_POINT.lon]}>
                <Popup>
                  <div className="text-white">
                    <strong>Ponto Inicial</strong>
                    <br />
                    {START_POINT.address}
                  </div>
                </Popup>
              </Marker>

              {optimizedRoutes ? (
                optimizedRoutes.clusters.map((cluster, clusterIdx) => (
                  <React.Fragment key={clusterIdx}>
                    {cluster.pedidos.map((pedido) => (
                      <Circle
                        key={pedido.id}
                        center={[pedido.latitude, pedido.longitude]}
                        radius={100}
                        pathOptions={{
                          color: getMarkerColor(clusterIdx),
                          fillColor: getMarkerColor(clusterIdx),
                          fillOpacity: 0.5,
                        }}
                      >
                        <Popup>
                          <div className="text-white">
                            <strong className="font-mono">{pedido.order_id}</strong>
                            <br />
                            {pedido.customer_name}
                            <br />
                            <span className="text-xs">{pedido.address}</span>
                          </div>
                        </Popup>
                      </Circle>
                    ))}

                    {cluster.route_geometry && (
                      <Polyline
                        positions={decodePolyline(cluster.route_geometry)}
                        pathOptions={{
                          color: getMarkerColor(clusterIdx),
                          weight: 4,
                          opacity: 0.8,
                          dashArray: '10, 10',
                        }}
                      />
                    )}
                  </React.Fragment>
                ))
              ) : (
                filteredPedidos
                  .filter((p) => p.latitude && p.longitude)
                  .map((pedido) => (
                    <Circle
                      key={pedido.id}
                      center={[pedido.latitude, pedido.longitude]}
                      radius={100}
                      pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.5 }}
                    >
                      <Popup>
                        <div className="text-white">
                          <strong className="font-mono">{pedido.order_id}</strong>
                          <br />
                          {pedido.customer_name}
                          <br />
                          <span className="text-xs">{pedido.address}</span>
                        </div>
                      </Popup>
                    </Circle>
                  ))
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtimizacaoRotas;
