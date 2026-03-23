import requests
import sys
import json
from datetime import datetime

class DeliveryRouteAPITester:
    def __init__(self, base_url="https://otimiza-rotas.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_pedido_id = None
        self.created_motoboy_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_create_pedido(self):
        """Test creating a new pedido"""
        test_data = {
            "order_id": f"TEST_{datetime.now().strftime('%H%M%S')}",
            "customer_name": "Cliente Teste",
            "address": "Rua Teste, 123",
            "cep": "01234-567",
            "delivery_start_time": "14:00",
            "delivery_end_time": "15:00"
        }
        
        success, response = self.run_test("Create Pedido", "POST", "pedidos", 200, data=test_data)
        if success and 'id' in response:
            self.created_pedido_id = response['id']
            print(f"   Created pedido ID: {self.created_pedido_id}")
        return success

    def test_get_pedidos(self):
        """Test getting all pedidos"""
        success, response = self.run_test("Get Pedidos", "GET", "pedidos", 200)
        if success:
            print(f"   Found {len(response)} pedidos")
        return success

    def test_geocode_pedido(self):
        """Test geocoding a pedido"""
        if not self.created_pedido_id:
            print("❌ No pedido ID available for geocoding test")
            return False
        
        return self.run_test("Geocode Pedido", "POST", f"pedidos/{self.created_pedido_id}/geocode", 200)

    def test_geocode_address(self):
        """Test direct geocoding endpoint"""
        test_data = {
            "address": "Rua Nossa Senhora das Mercês, 876",
            "cep": "04165-011"
        }
        return self.run_test("Geocode Address", "POST", "geocode", 200, data=test_data)

    def test_create_motoboy(self):
        """Test creating a new motoboy"""
        test_data = {
            "name": f"Motoboy Teste {datetime.now().strftime('%H%M%S')}",
            "avatar": "https://images.unsplash.com/photo-1665530994348-af9b4c297402?w=100&h=100&fit=crop"
        }
        
        success, response = self.run_test("Create Motoboy", "POST", "motoboys", 200, data=test_data)
        if success and 'id' in response:
            self.created_motoboy_id = response['id']
            print(f"   Created motoboy ID: {self.created_motoboy_id}")
        return success

    def test_get_motoboys(self):
        """Test getting all motoboys"""
        success, response = self.run_test("Get Motoboys", "GET", "motoboys", 200)
        if success:
            print(f"   Found {len(response)} motoboys")
        return success

    def test_optimize_routes(self):
        """Test route optimization"""
        # First get some pedidos to optimize
        success, pedidos = self.run_test("Get Pedidos for Optimization", "GET", "pedidos", 200)
        if not success or not pedidos:
            print("❌ No pedidos available for route optimization")
            return False

        # Filter pedidos with coordinates
        pedidos_with_coords = [p for p in pedidos if p.get('latitude') and p.get('longitude')]
        if not pedidos_with_coords:
            print("❌ No pedidos with coordinates for route optimization")
            return False

        test_data = {
            "pedido_ids": [p['id'] for p in pedidos_with_coords[:3]],  # Take first 3
            "num_motoboys": 2,
            "start_lat": -23.633,
            "start_lon": -46.608
        }
        
        return self.run_test("Optimize Routes", "POST", "optimize-routes", 200, data=test_data)

    def test_create_historico(self):
        """Test creating historico entry"""
        if not self.created_motoboy_id:
            print("❌ No motoboy ID available for historico test")
            return False

        test_data = {
            "order_id": f"HIST_{datetime.now().strftime('%H%M%S')}",
            "customer_name": "Cliente Historico",
            "address": "Rua Historico, 456",
            "cep": "01234-567",
            "delivery_time": "14:00 - 15:00",
            "distance_km": 5.5,
            "motoboy_id": self.created_motoboy_id,
            "motoboy_name": "Motoboy Teste"
        }
        
        return self.run_test("Create Historico", "POST", "historico", 200, data=test_data)

    def test_get_historico(self):
        """Test getting historico"""
        success, response = self.run_test("Get Historico", "GET", "historico", 200)
        if success:
            print(f"   Found {len(response)} historico entries")
        return success

    def test_generate_pdf(self):
        """Test PDF generation"""
        if not self.created_motoboy_id:
            print("❌ No motoboy ID available for PDF test")
            return False

        # Test PDF generation endpoint
        url = f"{self.api_url}/historico/pdf/{self.created_motoboy_id}"
        print(f"\n🔍 Testing Generate PDF...")
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                print(f"   Content-Type: {response.headers.get('content-type')}")
                print(f"   Content-Length: {len(response.content)} bytes")
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
            
            self.tests_run += 1
            return success
            
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.tests_run += 1
            return False

    def test_delete_pedido(self):
        """Test deleting a pedido"""
        if not self.created_pedido_id:
            print("❌ No pedido ID available for deletion test")
            return False
        
        return self.run_test("Delete Pedido", "DELETE", f"pedidos/{self.created_pedido_id}", 200)

    def test_delete_motoboy(self):
        """Test deleting a motoboy"""
        if not self.created_motoboy_id:
            print("❌ No motoboy ID available for deletion test")
            return False
        
        return self.run_test("Delete Motoboy", "DELETE", f"motoboys/{self.created_motoboy_id}", 200)

def main():
    print("🚀 Starting Delivery Route Optimization API Tests")
    print("=" * 60)
    
    tester = DeliveryRouteAPITester()
    
    # Test sequence
    tests = [
        tester.test_root_endpoint,
        tester.test_get_pedidos,
        tester.test_get_motoboys,
        tester.test_create_pedido,
        tester.test_geocode_address,
        tester.test_geocode_pedido,
        tester.test_create_motoboy,
        tester.test_optimize_routes,
        tester.test_create_historico,
        tester.test_get_historico,
        tester.test_generate_pdf,
        tester.test_delete_pedido,
        tester.test_delete_motoboy,
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())