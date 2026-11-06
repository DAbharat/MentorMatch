package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	DatabaseURL           string
	Port                  int
	WebhookSecret         string
	SocketPort            int
	AccessTokenSecret     string
	RefreshTokenSecret    string
	UpstashRedisRestURL   string
	UpstashRedisRestToken string
	RedisURL              string
	RedisTTL              time.Duration
	RedisMaxRetry         int
	RedisTimeout          time.Duration
	NextPublicAppURL      string
}

func Load() (*Config, error) {
	requiredEnvVars := []string{"DATABASE_URL", "PORT", "WEBHOOK_SECRET", "SOCKET_PORT", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET", "UPSTASH_REDIS_REST_URL",
		"UPSTASH_REDIS_REST_TOKEN", "REDIS_URL", "REDIS_TTL", "REDIS_MAX_RETRY", "REDIS_TIMEOUT", "NEXT_PUBLIC_APP_URL"}

	missingVars := checkMissingENV(requiredEnvVars)
	if len(missingVars) > 0 {
		return nil, fmt.Errorf("missing or empty environment variables: %v", missingVars)
	}

	port, err := strconv.Atoi(os.Getenv("PORT"))
	socketPort, socketErr := strconv.Atoi(os.Getenv("SOCKET_PORT"))
	redisMaxRetry, redErr := strconv.Atoi(os.Getenv("REDIS_MAX_RETRY"))
	redisTTL, redTTLErr := parseDuration(os.Getenv("REDIS_TTL"), time.Second)
	redisTimeout, redTimeoutErr := parseDuration(os.Getenv("REDIS_TIMEOUT"), time.Millisecond)

	if err != nil {
		return nil, fmt.Errorf("invalid PORT: %w", err)
	}
	if socketErr != nil {
		return nil, fmt.Errorf("invalid SOCKET_PORT: %w", socketErr)
	}
	if redErr != nil {
		return nil, fmt.Errorf("invalid REDIS_MAX_RETRY: %w", redErr)
	}
	if redTTLErr != nil {
		return nil, fmt.Errorf("invalid REDIS_TTL: %w", redTTLErr)
	}
	if redTimeoutErr != nil {
		return nil, fmt.Errorf("invalid REDIS_TIMEOUT: %w", redTimeoutErr)
	}

	cfg := &Config{
		DatabaseURL:           os.Getenv("DATABASE_URL"),
		Port:                  port,
		WebhookSecret:         os.Getenv("WEBHOOK_SECRET"),
		SocketPort:            socketPort,
		AccessTokenSecret:     os.Getenv("ACCESS_TOKEN_SECRET"),
		RefreshTokenSecret:    os.Getenv("REFRESH_TOKEN_SECRET"),
		UpstashRedisRestURL:   os.Getenv("UPSTASH_REDIS_REST_URL"),
		UpstashRedisRestToken: os.Getenv("UPSTASH_REDIS_REST_TOKEN"),
		RedisURL:              os.Getenv("REDIS_URL"),
		RedisTTL:              redisTTL,
		RedisMaxRetry:         redisMaxRetry,
		RedisTimeout:          redisTimeout,
		NextPublicAppURL:      os.Getenv("NEXT_PUBLIC_APP_URL"),
	}

	return cfg, nil
}

func checkMissingENV(keys []string) []string {
	var missing []string

	for _, key := range keys {
		if val, exists := os.LookupEnv(key); !exists || val == "" {
			missing = append(missing, key)
		}
	}

	return missing
}

func parseDuration(val string, defaultUnit time.Duration) (time.Duration, error) {
	if duration, err := time.ParseDuration(val); err == nil {
		return duration, nil
	}

	num, err := strconv.ParseInt(val, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid duration value: %s:%w", val, err)
	}

	return time.Duration(num) * defaultUnit, nil
}
