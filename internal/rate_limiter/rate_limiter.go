package ratelimiter

import "time"

type Config struct {
	RequestPerTimeFrame int
	TimeFrame           time.Duration
	Enabled             bool
}