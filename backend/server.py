from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from fastapi.responses import StreamingResponse


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class Pedido(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    customer_name: str
    address: str
    cep: str
    delivery_start_time: str
    delivery_end_time: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PedidoCreate(BaseModel):
    order_id: str
    customer_name: str
    address: str
    cep: str
    delivery_start_time: str
    delivery_end_time: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Motoboy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    avatar: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MotoboyCreate(BaseModel):
    name: str
    avatar: Optional[str] = None

class HistoricoEntrega(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    customer_name: str
    address: str
    cep: str
    delivery_time: str
    distance_km: float
    motoboy_id: str
    motoboy_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HistoricoEntregaCreate(BaseModel):
    order_id: str
    customer_name: str
    address: str
    cep: str
    delivery_time: str
    distance_km: float
    motoboy_id: str
    motoboy_name: str

class OptimizeRouteRequest(BaseModel):
    pedido_ids: List[str]
    num_motoboys: int
    start_lat: float
    start_lon: float

class GeocodeRequest(BaseModel):
    address: str
    cep: str


async def geocode_address(address: str, cep: str) -> Optional[Dict[str, float]]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            query = f"{address}, {cep}, São Paulo, Brazil"
            url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1"
            headers = {"User-Agent": "DeliveryRouteOptimizer/1.0"}
            response = await client.get(url, headers=headers)
            data = response.json()
            
            if data and len(data) > 0:
                return {
                    "latitude": float(data[0]["lat"]),
                    "longitude": float(data[0]["lon"])
                }
        except Exception as e:
            logging.error(f"Geocoding error: {e}")
    return None


async def calculate_route_osrm(coordinates: List[Dict[str, float]]) -> Optional[Dict[str, Any]]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            coords_str = ";".join([f"{c['longitude']},{c['latitude']}" for c in coordinates])
            url = f"https://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson"
            response = await client.get(url)
            data = response.json()
            
            if data.get("code") == "Ok":
                return data
        except Exception as e:
            logging.error(f"OSRM routing error: {e}")
    return None


def cluster_orders_by_distance(orders: List[Dict], num_clusters: int, start_point: Dict[str, float]) -> List[List[Dict]]:
    if num_clusters <= 0 or len(orders) == 0:
        return []
    
    if num_clusters >= len(orders):
        return [[order] for order in orders]
    
    clusters = [[] for _ in range(num_clusters)]
    remaining_orders = orders.copy()
    
    for i in range(num_clusters):
        if remaining_orders:
            clusters[i].append(remaining_orders.pop(0))
    
    while remaining_orders:
        for i in range(num_clusters):
            if remaining_orders:
                clusters[i].append(remaining_orders.pop(0))
    
    return [c for c in clusters if c]


@api_router.get("/")
async def root():
    return {"message": "Delivery Route Optimizer API"}


@api_router.post("/pedidos", response_model=Pedido)
async def create_pedido(input: PedidoCreate):
    pedido_dict = input.model_dump()
    pedido_obj = Pedido(**pedido_dict)
    
    doc = pedido_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.pedidos.insert_one(doc)
    return pedido_obj


@api_router.get("/pedidos", response_model=List[Pedido])
async def get_pedidos():
    pedidos = await db.pedidos.find({}, {"_id": 0}).to_list(1000)
    
    for pedido in pedidos:
        if isinstance(pedido['created_at'], str):
            pedido['created_at'] = datetime.fromisoformat(pedido['created_at'])
    
    return pedidos


@api_router.delete("/pedidos/{pedido_id}")
async def delete_pedido(pedido_id: str):
    result = await db.pedidos.delete_one({"id": pedido_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return {"message": "Pedido deletado com sucesso"}


@api_router.post("/pedidos/{pedido_id}/geocode")
async def geocode_pedido(pedido_id: str):
    pedido = await db.pedidos.find_one({"id": pedido_id}, {"_id": 0})
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    coords = await geocode_address(pedido['address'], pedido['cep'])
    if coords:
        await db.pedidos.update_one(
            {"id": pedido_id},
            {"$set": {"latitude": coords['latitude'], "longitude": coords['longitude']}}
        )
        return coords
    else:
        raise HTTPException(status_code=400, detail="Não foi possível geocodificar o endereço")


@api_router.post("/geocode", response_model=Dict[str, float])
async def geocode_address_endpoint(input: GeocodeRequest):
    coords = await geocode_address(input.address, input.cep)
    if coords:
        return coords
    else:
        raise HTTPException(status_code=400, detail="Não foi possível geocodificar o endereço")


@api_router.post("/motoboys", response_model=Motoboy)
async def create_motoboy(input: MotoboyCreate):
    motoboy_dict = input.model_dump()
    motoboy_obj = Motoboy(**motoboy_dict)
    
    doc = motoboy_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.motoboys.insert_one(doc)
    return motoboy_obj


@api_router.get("/motoboys", response_model=List[Motoboy])
async def get_motoboys():
    motoboys = await db.motoboys.find({}, {"_id": 0}).to_list(1000)
    
    for motoboy in motoboys:
        if isinstance(motoboy['created_at'], str):
            motoboy['created_at'] = datetime.fromisoformat(motoboy['created_at'])
    
    return motoboys


@api_router.delete("/motoboys/{motoboy_id}")
async def delete_motoboy(motoboy_id: str):
    result = await db.motoboys.delete_one({"id": motoboy_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Motoboy não encontrado")
    return {"message": "Motoboy deletado com sucesso"}


@api_router.post("/optimize-routes")
async def optimize_routes(input: OptimizeRouteRequest):
    pedidos = await db.pedidos.find(
        {"id": {"$in": input.pedido_ids}},
        {"_id": 0}
    ).to_list(1000)
    
    pedidos_with_coords = [p for p in pedidos if p.get('latitude') and p.get('longitude')]
    
    if not pedidos_with_coords:
        raise HTTPException(status_code=400, detail="Nenhum pedido com coordenadas encontrado")
    
    start_point = {"latitude": input.start_lat, "longitude": input.start_lon}
    
    clusters = cluster_orders_by_distance(pedidos_with_coords, input.num_motoboys, start_point)
    
    result = []
    for idx, cluster in enumerate(clusters):
        coordinates = [start_point] + [{"latitude": p['latitude'], "longitude": p['longitude']} for p in cluster] + [start_point]
        
        route_data = await calculate_route_osrm(coordinates)
        
        if route_data and route_data.get('routes'):
            distance_km = route_data['routes'][0]['distance'] / 1000
            geometry = route_data['routes'][0]['geometry']
        else:
            distance_km = 0
            geometry = None
        
        result.append({
            "cluster_id": idx,
            "pedidos": cluster,
            "distance_km": round(distance_km, 2),
            "route_geometry": geometry
        })
    
    return {"clusters": result}


@api_router.post("/historico", response_model=HistoricoEntrega)
async def create_historico(input: HistoricoEntregaCreate):
    historico_dict = input.model_dump()
    historico_obj = HistoricoEntrega(**historico_dict)
    
    doc = historico_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.historico.insert_one(doc)
    return historico_obj


@api_router.get("/historico", response_model=List[HistoricoEntrega])
async def get_historico():
    historico = await db.historico.find({}, {"_id": 0}).to_list(1000)
    
    for entry in historico:
        if isinstance(entry['created_at'], str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
    
    return historico


@api_router.get("/historico/pdf/{motoboy_id}")
async def generate_pdf(motoboy_id: str):
    motoboy = await db.motoboys.find_one({"id": motoboy_id}, {"_id": 0})
    if not motoboy:
        raise HTTPException(status_code=404, detail="Motoboy não encontrado")
    
    entregas = await db.historico.find({"motoboy_id": motoboy_id}, {"_id": 0}).to_list(1000)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#3b82f6'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    title = Paragraph(f"Relatório de Entregas - {motoboy['name']}", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.2*inch))
    
    if entregas:
        data = [['ID Pedido', 'Cliente', 'Endereço', 'Horário', 'Distância (km)']]
        
        total_distance = 0
        for entrega in entregas:
            data.append([
                entrega['order_id'],
                entrega['customer_name'],
                f"{entrega['address'][:30]}...",
                entrega['delivery_time'],
                f"{entrega['distance_km']:.2f}"
            ])
            total_distance += entrega['distance_km']
        
        table = Table(data, colWidths=[1.2*inch, 1.5*inch, 2*inch, 1.2*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.3*inch))
        
        summary = Paragraph(f"<b>Total de Entregas:</b> {len(entregas)} | <b>Distância Total:</b> {total_distance:.2f} km", styles['Normal'])
        elements.append(summary)
    else:
        no_data = Paragraph("Nenhuma entrega registrada para este motoboy.", styles['Normal'])
        elements.append(no_data)
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=relatorio_{motoboy['name'].replace(' ', '_')}.pdf"}
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
