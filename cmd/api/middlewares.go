package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	ratelimiter "github.com/AlfanDutaPamungkas/Govel/internal/rate_limiter"
	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/golang-jwt/jwt/v5"
)

func (app *application) AuthTokenMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			app.unauthorizedResponse(w, r, fmt.Errorf("authorization header is missing"))
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			app.unauthorizedResponse(w, r, fmt.Errorf("authorization header is malformed"))
			return
		}

		token := parts[1]
		jwtToken, err := app.authenticator.ValidateToken(token)
		if err != nil {
			app.unauthorizedResponse(w, r, err)
			return
		}

		claims := jwtToken.Claims.(jwt.MapClaims)
		userID, err := strconv.ParseInt(fmt.Sprintf("%.f", claims["sub"]), 10, 64)
		if err != nil {
			app.unauthorizedResponse(w, r, err)
			return
		}

		ctx := r.Context()

		user, err := app.store.Users.GetByID(ctx, userID)
		if err != nil {
			app.unauthorizedResponse(w, r, err)
			return
		}

		tokenVersion, err := strconv.ParseInt(fmt.Sprintf("%.f", claims["token_version"]), 10, 64)
		if err != nil {
			app.unauthorizedResponse(w, r, err)
			return
		}

		if tokenVersion != user.TokenVersion {
			app.unauthorizedResponse(w, r, errors.New("token revoked"))
			return
		}

		ctx = context.WithValue(ctx, userCtx, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (app *application) AdminOnly() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user := getUserFromCtx(r)

			if user.Role != "admin" {
				app.forbiddenResponse(w, r)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func (app *application) CheckPremium() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			chapter := getChapterFromCtx(r)
			user := getUserFromCtx(r)

			if !chapter.IsLocked {
				next.ServeHTTP(w, r)
				return
			}

			if user.Role == "admin" {
				next.ServeHTTP(w, r)
				return
			}

			err := app.store.UserUnlocks.CheckUser(r.Context(), user.ID, chapter.Slug)
			if err != nil {
				switch {
				case errors.Is(err, store.ErrNotFound):
					app.paymentRequiredResponse(w, r, errors.New("please purchase this chapter"))
				default:
					app.internalServerError(w, r, err)
				}
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func (app *application) RateLimiterMiddleware(limiter *ratelimiter.Limiter, keyFn func(*http.Request) string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := keyFn(r)

			allowed, retryAfter := limiter.Allow(key)
			if !allowed {
				w.Header().Set("Retry-After", retryAfter.String())
				app.tooManyRequestResponse(w, r, fmt.Errorf("rate limit exceeded"))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func (app *application) KeyByIP(r *http.Request) string {
	ip := r.RemoteAddr
	if i := strings.LastIndex(ip, ":"); i != -1 {
		ip = ip[:i]
	}
	return ip
}

func (app *application) KeyByUserID(r *http.Request) string {
	user := getUserFromCtx(r)
	if user == nil {
		return "anonymous"
	}
	return "user:" + strconv.FormatInt(user.ID, 10)
}
