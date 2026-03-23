import asyncio
import httpx

BACKEND_URL = "https://otimiza-rotas.preview.emergentagent.com"
API = f"{BACKEND_URL}/api"

test_data = [
    {"order_id": "F12", "customer_name": "Lucas", "address": "Rua Silva Bueno, 245", "cep": "04208-050", "start": "12:00", "end": "13:00"},
    {"order_id": "P34", "customer_name": "Mariana", "address": "Rua Bom Pastor, 890", "cep": "04203-002", "start": "13:00", "end": "14:00"},
    {"order_id": "F7", "customer_name": "Rafael", "address": "Rua Vergueiro, 6120", "cep": "04272-200", "start": "18:00", "end": "19:00"},
    {"order_id": "P56", "customer_name": "Fernanda", "address": "Rua Alencar Araripe, 310", "cep": "04253-000", "start": "15:00", "end": "16:00"},
    {"order_id": "F21", "customer_name": "Bruno", "address": "Rua Agostinho Gomes, 1450", "cep": "04206-001", "start": "18:00", "end": "19:00"},
    {"order_id": "P78", "customer_name": "Camila", "address": "Rua Lino Coutinho, 520", "cep": "04207-001", "start": "16:00", "end": "17:00"},
    {"order_id": "F3", "customer_name": "Eduardo", "address": "Rua Greenfeld, 85", "cep": "04275-040", "start": "14:00", "end": "15:00"},
    {"order_id": "P65", "customer_name": "Juliana", "address": "Rua do Manifesto, 1020", "cep": "04209-000", "start": "18:00", "end": "19:00"},
    {"order_id": "F44", "customer_name": "Felipe", "address": "Rua Labatut, 300", "cep": "04214-000", "start": "17:00", "end": "18:00"},
    {"order_id": "P9", "customer_name": "Aline", "address": "Rua Cipriano Barata, 710", "cep": "04205-000", "start": "18:00", "end": "19:00"},
    {"order_id": "F28", "customer_name": "Rodrigo", "address": "Rua Tabor, 60", "cep": "04202-020", "start": "12:00", "end": "13:00"},
    {"order_id": "P17", "customer_name": "Patricia", "address": "Rua Comandante Taylor, 420", "cep": "04218-000", "start": "18:00", "end": "19:00"},
    {"order_id": "F59", "customer_name": "Gustavo", "address": "Rua Huet Bacelar, 980", "cep": "04275-000", "start": "13:00", "end": "14:00"},
    {"order_id": "P2", "customer_name": "Daniela", "address": "Rua Moreira e Costa, 150", "cep": "04266-000", "start": "18:00", "end": "19:00"},
    {"order_id": "F73", "customer_name": "André", "address": "Rua Marquês de Olinda, 210", "cep": "04277-000", "start": "15:00", "end": "16:00"},
    {"order_id": "P41", "customer_name": "Vanessa", "address": "Rua Elba, 330", "cep": "04270-050", "start": "16:00", "end": "17:00"},
    {"order_id": "F66", "customer_name": "Tiago", "address": "Rua Sorocaba, 77", "cep": "04265-000", "start": "17:00", "end": "18:00"},
    {"order_id": "P25", "customer_name": "Renata", "address": "Rua Almirante Lobo, 560", "cep": "04212-000", "start": "14:00", "end": "15:00"},
    {"order_id": "F80", "customer_name": "Marcelo", "address": "Rua Brigadeiro Jordão, 135", "cep": "04210-000", "start": "12:00", "end": "13:00"},
    {"order_id": "P38", "customer_name": "Beatriz", "address": "Rua Vergueiro, 7000", "cep": "04273-200", "start": "18:00", "end": "19:00"},
]

async def main():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("Inserindo pedidos de teste...")
        for data in test_data:
            try:
                response = await client.post(f"{API}/pedidos", json={
                    "order_id": data["order_id"],
                    "customer_name": data["customer_name"],
                    "address": data["address"],
                    "cep": data["cep"],
                    "delivery_start_time": data["start"],
                    "delivery_end_time": data["end"]
                })
                
                if response.status_code == 200:
                    pedido = response.json()
                    print(f"✓ Pedido {data['order_id']} criado")
                    
                    try:
                        geocode_response = await client.post(f"{API}/pedidos/{pedido['id']}/geocode")
                        if geocode_response.status_code == 200:
                            print(f"  ✓ Geocodificado")
                        else:
                            print(f"  ✗ Erro ao geocodificar: {geocode_response.status_code}")
                    except Exception as e:
                        print(f"  ✗ Erro ao geocodificar: {e}")
                    
                    await asyncio.sleep(1)
                else:
                    print(f"✗ Erro ao criar pedido {data['order_id']}: {response.status_code}")
                    
            except Exception as e:
                print(f"✗ Erro ao criar pedido {data['order_id']}: {e}")
        
        print("\nCriando motoboys de teste...")
        motoboys = [
            {"name": "João Silva", "avatar": "https://images.unsplash.com/photo-1665530994348-af9b4c297402?w=100&h=100&fit=crop"},
            {"name": "Maria Santos", "avatar": "https://images.unsplash.com/photo-1569932353341-b518d82f8a54?w=100&h=100&fit=crop"},
            {"name": "Pedro Costa", "avatar": "https://images.unsplash.com/photo-1709038519642-368c3fd75469?w=100&h=100&fit=crop"},
        ]
        
        for motoboy in motoboys:
            try:
                response = await client.post(f"{API}/motoboys", json=motoboy)
                if response.status_code == 200:
                    print(f"✓ Motoboy {motoboy['name']} criado")
                else:
                    print(f"✗ Erro ao criar motoboy {motoboy['name']}: {response.status_code}")
            except Exception as e:
                print(f"✗ Erro ao criar motoboy {motoboy['name']}: {e}")
        
        print("\n✅ Dados de teste inseridos com sucesso!")

if __name__ == "__main__":
    asyncio.run(main())
