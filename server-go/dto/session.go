package dto

type SessionStartInput struct {
	SessionID string `json:"sessionId"`
}

type WebRTCSignalInput struct {
	SessionID string `json:"sessionId"`
	Offer     any    `json:"offer"`
	Answer    any    `json:"answer"`
	Candidate any    `json:"candidate"`
}
