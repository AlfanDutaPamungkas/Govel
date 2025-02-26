package main

import (
	"github.com/AlfanDutaPamungkas/Govel/internal/db"
	"github.com/AlfanDutaPamungkas/Govel/internal/env"
	"go.uber.org/zap"
)

const version = "0.0.1"

func main() {
	env.LoadEnv()

	cfg := config{
		addr: env.GetEnv("PORT", ":8080"),
		env:  env.GetEnv("env", "DEVELOPMENT"),
		db: dbConfig{
			addr:         env.GetEnv("DB_ADDR", "postgres://user:password@localhost:5432/mydb?sslmode=disable"),
			maxOpenConns: env.GetIntEnv("DB_MAX_OPEN_CONNS", 30),
			maxIdleTime:  env.GetEnv("DB_MAX_IDLE_TIME", "15m"),
		},
	}

	logger := zap.Must(zap.NewProduction()).Sugar()
	defer logger.Sync()

	db, err := db.New(
		cfg.db.addr,
		cfg.db.maxOpenConns,
		cfg.db.maxIdleTime,
	)

	if err != nil {
		logger.Fatal(err)
	}

	defer db.Close()
	logger.Info("db connection pool established")

	app := &application{
		config: cfg,
		logger: logger,
	}

	mux := app.mount()

	app.run(mux)
}
