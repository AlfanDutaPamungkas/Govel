package ratelimiter

import (
	"math"
	"sync"
	"time"
)

type bucket struct {
	tokens     float64
	lastRefill time.Time
	lastSeen   time.Time
}

type Limiter struct {
	mu       sync.Mutex
	buckets  map[string]*bucket
	rate     float64
	capacity float64
	enabled  bool
	ttl      time.Duration
}

func New(cfg Config) *Limiter {
	if !cfg.Enabled {
		return &Limiter{enabled: false}
	}

	rate := float64(cfg.RequestPerTimeFrame) / cfg.TimeFrame.Seconds()

	rl := &Limiter{
		buckets:  make(map[string]*bucket),
		rate:     rate,
		capacity: float64(cfg.RequestPerTimeFrame),
		enabled:  true,
		ttl:      cfg.TimeFrame * 3, // aman
	}

	rl.startCleanup(time.Minute)

	return rl
}

func (rl *Limiter) Allow(key string) (bool, time.Duration) {
	if !rl.enabled {
		return true, 0
	}

	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()

	b, ok := rl.buckets[key]
	if !ok {
		b = &bucket{
			tokens:     rl.capacity,
			lastRefill: now,
			lastSeen:   now,
		}
		rl.buckets[key] = b
	}

	elapsed := now.Sub(b.lastRefill).Seconds()
	b.tokens = math.Min(rl.capacity, b.tokens+elapsed*rl.rate)
	b.lastRefill = now
	b.lastSeen = now

	if b.tokens >= 1 {
		b.tokens--
		return true, 0
	}

	retry := time.Duration((1-b.tokens)/rl.rate) * time.Second
	return false, retry
}

func (rl *Limiter) startCleanup(interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for range ticker.C {
			now := time.Now()
			rl.mu.Lock()
			for k, b := range rl.buckets {
				if now.Sub(b.lastSeen) > rl.ttl {
					delete(rl.buckets, k)
				}
			}
			rl.mu.Unlock()
		}
	}()
}

