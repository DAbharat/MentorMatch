import ws from 'k6/ws';
import { check, sleep } from 'k6';
import encoding from 'k6/encoding';
import crypto from 'k6/crypto';

// Configuration for local and deployed WebSocket endpoints
const LOCAL_WS_URL = __ENV.LOCAL_WS_URL || 'ws://localhost:3001/ws';
const DEPLOYED_WS_URL = __ENV.DEPLOYED_WS_URL || 'wss://socket-deploy.com/ws';

// Secret key for signing test JWT tokens (matches ACCESS_TOKEN_SECRET in .env)
const ACCESS_TOKEN_SECRET = __ENV.ACCESS_TOKEN_SECRET || 'ABCDEF';

// Determine target based on TARGET environment variable
const isDeployed = __ENV.TARGET === 'deployed';
const TARGET_URL = isDeployed ? DEPLOYED_WS_URL : LOCAL_WS_URL;

// Test duration: 1 min 20 sec (80 seconds total)
// Virtual users ramp up by 100 every 10 seconds:
// 10s -> 100 users, 20s -> 200 users, ... up to 80s -> 800 users
export const options = {
    stages: [
        { duration: '10s', target: 100 },
        { duration: '10s', target: 200 },
        { duration: '10s', target: 300 },
        { duration: '10s', target: 400 },
        { duration: '10s', target: 500 },
        { duration: '10s', target: 600 },
        { duration: '10s', target: 700 },
        { duration: '10s', target: 800 },
    ],
    thresholds: {
        // At least 95 percent of checks must pass
        checks: ['rate>0.95'],
        // 95 percent of WebSocket handshakes should complete under 2000ms
        ws_connecting: ['p(95)<2000'],
    },
};

// Generates an HMAC-SHA256 JWT valid for 1 hour for each virtual user
function generateTestToken(userId) {
    const header = encoding.b64encode(
        JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
        'rawurl'
    );

    const payload = encoding.b64encode(
        JSON.stringify({
            userId: userId,
            exp: Math.floor(Date.now() / 1000) + 3600,
        }),
        'rawurl'
    );

    const signature = crypto.hmac('sha256', ACCESS_TOKEN_SECRET, `${header}.${payload}`, 'base64rawurl');
    return `${header}.${payload}.${signature}`;
}

export default function () {
    const userId = `loadtest-user-${__VU}`;
    const token = generateTestToken(userId);
    const chatId = 'loadtest_benchmark_chat';
    const connectionUrl = `${TARGET_URL}?token=${token}&chatId=${chatId}`;

    const params = {
        tags: { my_tag: 'websocket_load_test' },
    };

    const res = ws.connect(connectionUrl, params, function (socket) {
        socket.on('open', function () {
            // Send periodic typing event every 4 seconds to simulate active user activity
            socket.setInterval(function () {
                const message = JSON.stringify({
                    event: 'typing',
                    room: `chat_${chatId}`,
                    data: {
                        userId: userId,
                    },
                });
                socket.send(message);
            }, 4000);
        });

        socket.on('message', function (data) {
            // Heartbeat or incoming message handler
        });

        socket.on('close', function () {
            // Connection closed callback
        });

        socket.on('error', function (e) {
            // Connection error callback
        });

        // Keep connection open for 8 seconds per iteration
        socket.setTimeout(function () {
            socket.close();
        }, 8000);
    });

    check(res, {
        'status is 101 switching protocols': (r) => r && r.status === 101,
    });

    sleep(1);
}

