package auth

import (
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)

type UserClaims struct {
	UserID string `json:"userId"`
	jwt.RegisteredClaims
}

func VerifyAccessToken(tokenString, secret string) (*UserClaims, error) {
	claims := &UserClaims{}

	if tokenString == "" {
		return nil, fmt.Errorf("missing token")
	}

	token, err := jwt.ParseWithClaims(
		tokenString, claims,
		func(token *jwt.Token) (any, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		},
	)
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}
	if !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}
