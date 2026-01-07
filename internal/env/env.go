package env

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	if os.Getenv("ENV") != "production" {
		_ = godotenv.Load()
	}
}

func GetEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func GetIntEnv(key string, fallback int) int {
	val, ok := os.LookupEnv(key)
	if !ok {
		return fallback
	}

	valAsInt, err := strconv.Atoi(val)
	if err != nil {
		return fallback
	}

	return valAsInt
}

func GetBoolEnv(key string, fallback bool) bool {
	val, ok := os.LookupEnv(key)
	if !ok {
		return fallback
	}

	boolVal, err := strconv.ParseBool(val)
	if err != nil {
		return fallback
	}

	return boolVal
}

func GetDurationEnv(key string, fallbackDuration time.Duration) time.Duration {
	val, ok := os.LookupEnv(key)
	if !ok {
		return fallbackDuration
	}

	duration, err := time.ParseDuration(val)
	if err != nil {
		return fallbackDuration
	}

	return duration
}