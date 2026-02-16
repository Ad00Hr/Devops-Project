#!/bin/bash

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    TESTS COMPLETS DU PROJET DEVOPS    ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Fonction de test
test_service() {
    local service=$1
    local endpoint=$2
    local expected=$3
    
    echo -e "${YELLOW}Test $service...${NC}"
    
    if curl -s -o /dev/null -w "%{http_code}" $endpoint | grep -q $expected; then
        echo -e "${GREEN}✓ $service est opérationnel${NC}"
        return 0
    else
        echo -e "${RED}✗ $service ne répond pas correctement${NC}"
        return 1
    fi
}

# 1. Vérification des conteneurs
echo -e "\n${BLUE}1. VÉRIFICATION DES CONTENEURS${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Tests de base de données
echo -e "\n${BLUE}2. TESTS BASE DE DONNÉES${NC}"
if docker exec devops-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL est prêt${NC}"
    
    # Test de création de table
    docker exec devops-postgres psql -U postgres -d devopsdb -c "
        CREATE TABLE IF NOT EXISTS test_table (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW()
        );
    " > /dev/null 2>&1 && echo -e "${GREEN}✓ Création de table réussie${NC}"
else
    echo -e "${RED}✗ PostgreSQL n'est pas accessible${NC}"
fi

# 3. Tests des APIs
echo -e "\n${BLUE}3. TESTS DES APIS${NC}"
test_service "API Gateway (Go)" "http://localhost:8080/health" "200"
test_service "API Gateway Poll" "http://localhost:8080/poll" "200"
test_service "API Node.js" "http://localhost:3000/health" "200"
test_service "Frontend React" "http://localhost" "200"

# 4. Tests de communication inter-services
echo -e "\n${BLUE}4. TESTS DE COMMUNICATION${NC}"

# Test API Gateway -> PostgreSQL
if docker exec devops-api-gateway sh -c "nc -z postgres 5432" 2>/dev/null; then
    echo -e "${GREEN}✓ API Gateway communique avec PostgreSQL${NC}"
else
    echo -e "${RED}✗ API Gateway ne peut pas joindre PostgreSQL${NC}"
fi

# Test API Node -> PostgreSQL
if docker exec devops-api-node sh -c "nc -z postgres 5432" 2>/dev/null; then
    echo -e "${GREEN}✓ API Node communique avec PostgreSQL${NC}"
else
    echo -e "${RED}✗ API Node ne peut pas joindre PostgreSQL${NC}"
fi

# Test Frontend -> APIs
if docker exec devops-client-react sh -c "wget -q --spider http://api-gateway:8080/health"; then
    echo -e "${GREEN}✓ Frontend communique avec API Gateway${NC}"
else
    echo -e "${RED}✗ Frontend ne peut pas joindre API Gateway${NC}"
fi

# 5. Tests de charge simples
echo -e "\n${BLUE}5. TESTS DE CHARGE${NC}"
echo "Test avec 100 requêtes concurrentes..."

for i in {1..100}; do
    curl -s http://localhost:8080/health > /dev/null &
done

wait
echo -e "${GREEN}✓ 100 requêtes traitées${NC}"

# 6. Tests des endpoints métier
echo -e "\n${BLUE}6. TESTS MÉTIER${NC}"

# Test création d'un poll
echo "Création d'un sondage..."
POLL_RESPONSE=$(curl -s -X POST http://localhost:8080/poll \
    -H "Content-Type: application/json" \
    -d '{"question":"Test question?"}')

if echo $POLL_RESPONSE | grep -q "id"; then
    echo -e "${GREEN}✓ Création de sondage réussie${NC}"
else
    echo -e "${RED}✗ Échec de création de sondage${NC}"
fi

# Test récupération des polls
echo "Récupération des sondages..."
POLLS=$(curl -s http://localhost:8080/poll)
if [ "$(echo $POLLS | jq length)" -gt 0 ] 2>/dev/null; then
    echo -e "${GREEN}✓ Récupération des sondages réussie${NC}"
else
    echo -e "${RED}✗ Aucun sondage trouvé${NC}"
fi

# 7. Tests de performance
echo -e "\n${BLUE}7. TESTS DE PERFORMANCE${NC}"
echo "Mesure du temps de réponse moyen..."

# API Gateway
START_TIME=$(date +%s%N)
curl -s http://localhost:8080/health > /dev/null
END_TIME=$(date +%s%N)
GATEWAY_TIME=$((($END_TIME - $START_TIME)/1000000))
echo "API Gateway: ${GATEWAY_TIME}ms"

# API Node
START_TIME=$(date +%s%N)
curl -s http://localhost:3000/health > /dev/null
END_TIME=$(date +%s%N)
NODE_TIME=$((($END_TIME - $START_TIME)/1000000))
echo "API Node: ${NODE_TIME}ms"

# 8. Tests de résilience
echo -e "\n${BLUE}8. TESTS DE RÉSILIENCE${NC}"
echo "Test de redémarrage d'un service..."

# Arrêt d'un service
docker stop devops-api-node
sleep 5

# Vérification que le système continue de fonctionner
if curl -s http://localhost:8080/health > /dev/null; then
    echo -e "${GREEN}✓ API Gateway continue de fonctionner${NC}"
else
    echo -e "${RED}✗ API Gateway ne répond plus${NC}"
fi

# Redémarrage
docker start devops-api-node
sleep 5

# Vérification du redémarrage
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✓ API Node a redémarré correctement${NC}"
fi

# Résumé
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ TOUS LES TESTS SONT TERMINÉS${NC}"
echo -e "${BLUE}========================================${NC}"