package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var mongoCol *mongo.Collection
var jwtSecret = []byte("cyclerace_jwt_secret_2026_lucars")

type UserEvent struct {
	UserID        string                 `bson:"user_id" json:"user_id"`
	ActionType    string                 `bson:"action_type" json:"action_type"`
	TargetElement string                 `bson:"target_element" json:"target_element"`
	Timestamp     time.Time              `bson:"timestamp" json:"timestamp"`
	Payload       map[string]interface{} `bson:"payload" json:"payload"`
	Token         string                 `bson:"token" json:"token"`
	Analysis      string                 `bson:"analysis" json:"analysis"`
}

func initMongo() {
	uri := "mongodb://payment_admin:payment_secret_2026@localhost:27017/payments_db?authSource=payments_db"
	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatalf("Error conectando a MongoDB: %v", err)
	}
	// Verify connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		// Fallback without authSource for some Mongo versions
		uri = "mongodb://payment_admin:payment_secret_2026@localhost:27017"
		clientOptions = options.Client().ApplyURI(uri)
		client, _ = mongo.Connect(context.TODO(), clientOptions)
		client.Ping(context.TODO(), nil)
	}

	mongoCol = client.Database("payments_db").Collection("analyzer_logs")
	fmt.Println("Conectado a MongoDB (analyzer_logs)")
}

// COMPILER: Lexer & Semantic Analyzer en Go
func analyzeEvent(event *UserEvent) {
	// LEXER
	action := strings.ToUpper(event.ActionType)
	target := strings.ToLower(event.TargetElement)
	
	token := "T_UNKNOWN"
	if action == "CLICK" {
		if strings.Contains(target, "login") || strings.Contains(target, "iniciar") {
			token = "T_LOGIN"
		} else if strings.Contains(target, "guardar") || strings.Contains(target, "validar") || strings.Contains(target, "pagar") || strings.Contains(target, "rechazar") {
			token = "T_SENSITIVE_ACTION"
		} else {
			token = "T_CLICK"
		}
	} else if action == "NAVIGATE" {
		token = "T_NAVIGATE"
	}
	event.Token = token

	// SEMANTIC ANALYZER
	isAdmin := event.UserID == "user_1" // Asumimos user_1 como admin
	if token == "T_SENSITIVE_ACTION" && !isAdmin {
		event.Analysis = "❌ VULNERABILIDAD: Intento de acción protegida por usuario sin privilegios"
	} else if token == "T_SENSITIVE_ACTION" && isAdmin {
		event.Analysis = "✅ OPERACIÓN ADMIN: Acción protegida ejecutada por admin"
	} else {
		event.Analysis = "NORMAL: Acción genérica"
	}
}

func IngestLogHandler(w http.ResponseWriter, r *http.Request) {
	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	uid, _ := payload["user_id"].(string)
	act, _ := payload["action_type"].(string)
	tgt, _ := payload["target_element"].(string)
	payl, _ := payload["payload"].(map[string]interface{})

	event := UserEvent{
		UserID:        uid,
		ActionType:    act,
		TargetElement: tgt,
		Timestamp:     time.Now(),
		Payload:       payl,
	}

	// Real-time analysis
	analyzeEvent(&event)

	// Save to DB
	_, err := mongoCol.InsertOne(context.TODO(), event)
	if err != nil {
		log.Printf("Error guardando en Mongo: %v", err)
	}

	w.WriteHeader(http.StatusAccepted)
}

func GetLogsHandler(w http.ResponseWriter, r *http.Request) {
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(50)
	cursor, err := mongoCol.Find(context.TODO(), bson.D{}, opts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	var results []UserEvent
	if err = cursor.All(context.TODO(), &results); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func QueryAnalyzerHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Rule string `json:"rule"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	rule := strings.ToLower(body.Rule)
	filter := bson.M{}

	if strings.Contains(rule, "vulnerabilidad") {
		filter = bson.M{"analysis": bson.M{"$regex": "VULNERABILIDAD", "$options": "i"}}
	} else if strings.Contains(rule, "admin") {
		filter = bson.M{"user_id": "user_1"}
	} else if strings.Contains(rule, "sensitive") {
		filter = bson.M{"token": "T_SENSITIVE_ACTION"}
	}

	cursor, _ := mongoCol.Find(context.TODO(), filter, options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}))
	var results []UserEvent
	cursor.All(context.TODO(), &results)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"query_applied": rule,
		"matches":       len(results),
		"results":       results,
	})
}

func RequireRole(role string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Token requerido", http.StatusUnauthorized)
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Token inválido", http.StatusUnauthorized)
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["rol"] != role {
			http.Error(w, "Acceso denegado: Privilegios insuficientes", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	}
}

func main() {
	initMongo()

	mux := http.NewServeMux()
	mux.HandleFunc("/ingest", IngestLogHandler)
	mux.HandleFunc("/api/analyzer/logs", RequireRole("admin", GetLogsHandler))
	mux.HandleFunc("/api/analyzer/query", RequireRole("admin", QueryAnalyzerHandler))

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Authorization", "Content-Type"},
	})

	fmt.Println("🚀 Microservicio Go (Tracker + Analizador) corriendo en puerto 8081")
	log.Fatal(http.ListenAndServe(":8081", c.Handler(mux)))
}
