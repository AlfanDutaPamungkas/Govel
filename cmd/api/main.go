package main

import (
	"time"

	"github.com/AlfanDutaPamungkas/Govel/internal/auth"
	cld "github.com/AlfanDutaPamungkas/Govel/internal/cloudinary"
	"github.com/AlfanDutaPamungkas/Govel/internal/db"
	"github.com/AlfanDutaPamungkas/Govel/internal/env"
	"github.com/AlfanDutaPamungkas/Govel/internal/mailer"
	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/xendit/xendit-go/v6"
	"go.uber.org/zap"
)

const version = "1.0.0"

//	@title			Govel API
//	@description	RESTful API for an online novel platform — read, publish, and manage digital stories.
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	API Support
//	@contact.url	http://www.swagger.io/support
//	@contact.email	support@swagger.io

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

//	@BasePath					/v1
//
//	@securityDefinitions.apiKey	BearerAuth
//	@in							header
//	@name						Authorization
//	@description

func main() {
	env.LoadEnv()

	cfg := config{
		addr:          env.GetEnv("PORT", ":8080"),
		env:           env.GetEnv("env", "DEVELOPMENT"),
		apiURL:        env.GetEnv("EXTERNAL_URL", "localhost:8080"),
		ForgotPassExp: time.Hour,
		db: dbConfig{
			addr:         env.GetEnv("DB_ADDR", "postgres://user:password@localhost:5432/mydb?sslmode=disable"),
			maxOpenConns: env.GetIntEnv("DB_MAX_OPEN_CONNS", 30),
			maxIdleTime:  env.GetEnv("DB_MAX_IDLE_TIME", "15m"),
		},
		mail: mailConfig{
			exp: time.Hour * 24 * 3,
			smtp: smtpConfig{
				host:     env.GetEnv("SMTP_HOST", "smtp.example.com"),
				port:     env.GetEnv("SMTP_PORT", "465"),
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
		cloudinaryConfig: &cld.CloudinaryConfig{
			CloudName: env.GetEnv("CLOUD_NAME", ""),
			APIKey:    env.GetEnv("API_KEY", ""),
			APISecret: env.GetEnv("API_SECRET", ""),
		},
		xenditSecret: env.GetEnv("XENDIT_SECRET_KEY", ""),
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

	cld, err := cld.NewCloudinary(
		cfg.cloudinaryConfig.CloudName,
		cfg.cloudinaryConfig.APIKey,
		cfg.cloudinaryConfig.APISecret,
	)

	if err != nil {
		logger.Fatal(err)
	}

	xnd := xendit.NewClient(cfg.xenditSecret)

	app := &application{
		config:        cfg,
		logger:        logger,
		store:         store,
		mailer:        mailer,
		authenticator: jwtAuthenticator,
		cld:           cld,
		xendit:        xnd,
	}

	mux := app.mount()

	app.run(mux)
}
