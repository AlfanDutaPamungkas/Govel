package main

import (
	"net/http"
	"time"

	"github.com/AlfanDutaPamungkas/Govel/internal/auth"
	cld "github.com/AlfanDutaPamungkas/Govel/internal/cloudinary"
	"github.com/AlfanDutaPamungkas/Govel/internal/mailer"
	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/xendit/xendit-go/v6"
	"go.uber.org/zap"
)

type application struct {
	config        config
	logger        *zap.SugaredLogger
	store         store.Storage
	mailer        *mailer.SMTPMailer
	authenticator auth.Authenticator
	cld           *cloudinary.Cloudinary
	xendit        *xendit.APIClient
}

type config struct {
	addr             string
	env              string
	db               dbConfig
	mail             mailConfig
	frontendURL      string
	auth             authConfig
	ForgotPassExp    time.Duration
	cloudinaryConfig *cld.CloudinaryConfig
	xenditSecret     string
}

type authConfig struct {
	token tokenConfig
}

type tokenConfig struct {
	secret string
	exp    time.Duration
	iss    string
}

type dbConfig struct {
	addr         string
	maxOpenConns int
	maxIdleTime  string
}

type mailConfig struct {
	exp  time.Duration
	smtp smtpConfig
}

type smtpConfig struct {
	host     string
	port     string
	username string
	password string
}

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))
	r.Use(middleware.Timeout(60 * time.Second))

	r.Route("/v1", func(r chi.Router) {
		r.Get("/health", app.healthCheckHandler)

		r.Route("/authentication", func(r chi.Router) {
			r.Post("/user", app.registerUserHandler)
			r.Post("/token", app.createTokenHandler)
			r.Post("/forgot-password", app.forgotPasswordHandler)
			r.Patch("/reset-password/{token}", app.resetPasswordHandler)
		})

		r.Route("/users", func(r chi.Router) {
			r.Put("/activate/{token}", app.activateUserHandler)

			r.Group(func(r chi.Router) {
				r.Use(app.AuthTokenMiddleware)

				r.Get("/", app.getProfileHandler)
				r.Patch("/", app.updateUserHandler)
				r.Patch("/change-password", app.changePasswordHandler)
			})

			r.Route("/{userID}", func(r chi.Router) {
				r.Use(app.AuthTokenMiddleware)

				r.Get("/", app.getUserHandler)
			})
		})

		r.Route("/novels", func(r chi.Router) {
			r.Use(app.AuthTokenMiddleware)

			r.With(app.AdminOnly()).Post("/", app.createNovelHandler)

			r.Route("/{novelID}", func(r chi.Router) {
				r.Use(app.novelsContextMiddleware)

				r.Get("/", app.getNovelHandler)

				r.With(app.AdminOnly()).Patch("/", app.updateNovelHandler)
				r.With(app.AdminOnly()).Patch("/image", app.changeNovelImageHandler)
				r.With(app.AdminOnly()).Delete("/", app.deleteNovelHandler)

				r.Route("/chapters", func(r chi.Router) {
					r.With(app.AdminOnly()).Post("/", app.createChapterHandler)

					r.Route("/{slug}", func(r chi.Router) {
						r.Use(app.chaptersContextMiddleware)

						r.Get("/", app.getDetailChapterHandler)

						r.With(app.AdminOnly()).Patch("/", app.updateChapterHandler)
						r.With(app.AdminOnly()).Delete("/", app.deleteChapterHandler)
					})
				})
			})
		})

		r.Route("/invoices", func(r chi.Router) {
			r.Use(app.AuthTokenMiddleware)

			r.Route("/{plan}", func(r chi.Router) {
				r.Post("/", app.createInvoiceHandler)
			})
		})

		r.Route("/webhook", func(r chi.Router) {
			r.Use(app.AuthTokenMiddleware)
			
			r.Post("/", app.transactionHandler)
		})
	})

	return r
}

func (app *application) run(mux http.Handler) error {
	srv := &http.Server{
		Addr:         app.config.addr,
		Handler:      mux,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	app.logger.Infow("server has started", "addr", app.config.addr, "env", app.config.env)

	return srv.ListenAndServe()
}
