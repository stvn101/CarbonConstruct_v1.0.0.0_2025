#!/bin/bash
# CarbonConstruct Calculator - Automated Test Script
# Tests all major endpoints to verify functionality

set -e

echo "🧪 CarbonConstruct Calculator Test Suite"
echo "========================================="
echo ""

API_URL="${API_URL:-http://localhost:8000/api/v1}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "  Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Check if API is running
echo "Checking API health..."
if ! curl -s "$API_URL/../health" > /dev/null; then
    echo -e "${RED}❌ API is not running at $API_URL${NC}"
    echo "Start the backend first: cd backend && uvicorn api.main:app --reload"
    exit 1
fi
echo -e "${GREEN}✓ API is running${NC}"
echo ""

# Test 1: Create Project
echo "=== Project Management ==="
test_endpoint "Create Project" "POST" "/projects" '{
    "project_id": "TEST001",
    "project_name": "Test Project",
    "postcode": 2000,
    "state": "NSW",
    "ncc_volume": "1"
}'

test_endpoint "Get Project" "GET" "/projects/TEST001" ""
test_endpoint "List Projects" "GET" "/projects" ""
echo ""

# Test 2: Fuel Calculations
echo "=== Fuel Calculations ==="

# Test diesel (stationary)
test_endpoint "Diesel Stationary" "POST" "/calculate/fuel" '{
    "project_id": "TEST001",
    "fuel_type": "Diesel",
    "quantity": 1000,
    "unit": "L",
    "state": "NSW",
    "is_stationary": true
}'

# Test diesel (transport) - different N2O factor
test_endpoint "Diesel Transport" "POST" "/calculate/fuel" '{
    "project_id": "TEST001",
    "fuel_type": "Diesel",
    "quantity": 1000,
    "unit": "L",
    "state": "NSW",
    "is_stationary": false
}'

# Test petrol
test_endpoint "Petrol" "POST" "/calculate/fuel" '{
    "project_id": "TEST001",
    "fuel_type": "Petrol",
    "quantity": 500,
    "unit": "L",
    "state": "VIC",
    "is_stationary": false
}'

test_endpoint "List Fuels" "GET" "/calculate/fuels?state=NSW" ""
echo ""

# Test 3: Material Calculations
echo "=== Material Calculations ==="

# Test concrete
test_endpoint "Concrete" "POST" "/calculate/material" '{
    "project_id": "TEST001",
    "material_type": "Concrete - 32 MPa",
    "quantity": 100,
    "unit": "m3",
    "data_quality": "default"
}'

# Test timber (with biogenic storage)
test_endpoint "Timber (Biogenic)" "POST" "/calculate/material" '{
    "project_id": "TEST001",
    "material_type": "Structural timber - Hardwood",
    "quantity": 50,
    "unit": "m3",
    "data_quality": "default"
}'

# Test steel
test_endpoint "Steel" "POST" "/calculate/material" '{
    "project_id": "TEST001",
    "material_type": "Steel - Reinforcing bar",
    "quantity": 10,
    "unit": "t",
    "data_quality": "avg"
}'

test_endpoint "List Materials" "GET" "/calculate/materials?category=Concrete" ""
test_endpoint "List Categories" "GET" "/calculate/categories" ""
echo ""

# Test 4: Waste Calculations
echo "=== Waste Calculations ==="

# Test timber waste (DOC method)
test_endpoint "Timber Waste" "POST" "/calculate/waste" '{
    "project_id": "TEST001",
    "waste_type": "Timber waste",
    "quantity": 2.5,
    "unit": "t"
}'

# Test concrete waste
test_endpoint "Concrete Waste" "POST" "/calculate/waste" '{
    "project_id": "TEST001",
    "waste_type": "Concrete waste",
    "quantity": 5.0,
    "unit": "t"
}'
echo ""

# Test 5: Project Summary & Reports
echo "=== Project Summary & Reports ==="
test_endpoint "Project Summary" "GET" "/projects/TEST001/summary" ""
test_endpoint "Audit Log" "GET" "/projects/TEST001/audit" ""
test_endpoint "NGER Export" "GET" "/reports/TEST001/nger-json" ""
test_endpoint "NCC Summary" "GET" "/reports/TEST001/ncc-summary" ""
test_endpoint "Methodology" "GET" "/reports/TEST001/methodology" ""
echo ""

# Results
echo "========================================="
echo "Test Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo "========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Your calculator is working perfectly! 🎉"
    echo ""
    echo "Next steps:"
    echo "  1. Integrate components into your Vite app"
    echo "  2. Test the UI at http://localhost:5173"
    echo "  3. Deploy backend to production"
    echo "  4. Update VITE_API_URL in frontend"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Check the errors above and:"
    echo "  1. Ensure database is initialized: python -m core.database"
    echo "  2. Check API logs for errors"
    echo "  3. Verify NGER CSVs are in backend/data/"
    echo ""
    exit 1
fi
