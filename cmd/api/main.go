package main

import (
	"time"

	"github.com/AlfanDutaPamungkas/Govel/internal/auth"
	"github.com/AlfanDutaPamungkas/Govel/internal/db"
	"github.com/AlfanDutaPamungkas/Govel/internal/env"
	"github.com/AlfanDutaPamungkas/Govel/internal/mailer"
	"github.com/AlfanDutaPamungkas/Govel/internal/store"
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
		mail: mailConfig{
			exp: time.Hour * 24 * 3,
			smtp: smtpConfig{
				host:     env.GetEnv("SMTP_HOST", "smtp.example.com"),
				port:     env.GetEnv("SMTP_PORT", "587"),
				username: env.GetEnv("SMTP_USERNAME", ""),
				password: env.GetEnv("SMTP_PASSWORD", ""),
			},
		},
		frontendURL: env.GetEnv("FRONTEND_URL", "http://localhost:5173"),
		auth: authConfig{
			token: tokenConfig{
				secret: env.GetEnv("AUTH_TOKEN_SECRET", ""),
				exp:    time.Hour * 24 * 3,
				iss:    "govel",
			},
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

	store := store.NewStorage(db)

	mailer := mailer.NewSMTPMailer(
		cfg.mail.smtp.host,
		cfg.mail.smtp.port,
		cfg.mail.smtp.username,
		cfg.mail.smtp.password,
	)

	jwtAuthenticator := auth.NewJWTAuthenticator(
		cfg.auth.token.secret,
		cfg.auth.token.iss,
		cfg.auth.token.iss,
	)

	app := &application{
		config: cfg,
		logger: logger,
		store: store,
		mailer: mailer,
		authenticator: jwtAuthenticator,
	}

	mux := app.mount()

	app.run(mux)
}
