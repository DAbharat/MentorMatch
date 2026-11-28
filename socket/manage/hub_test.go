package manage

import "testing"

func TestJoinRoomReportsOtherClients(t *testing.T) {
	hub := NewHub()
	first := &Client{UserID: "first"}
	second := &Client{UserID: "second"}
	hub.Register(first)
	hub.Register(second)

	if hub.JoinRoom(first, "call_session") {
		t.Fatal("first client should not see a peer in an empty room")
	}
	if hub.JoinRoom(first, "call_session") {
		t.Fatal("rejoining client should not count itself as a peer")
	}
	if !hub.JoinRoom(second, "call_session") {
		t.Fatal("second client should be told that a peer is already in the room")
	}
}
