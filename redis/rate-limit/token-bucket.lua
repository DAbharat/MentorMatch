local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = 1

local data = redis.call("HMGET", key, "tokens", "lastRefill")
local tokens = tonumber(date[1])
locak lastRefill = tonumber(data[2])

if tokens == nil then
    tokens = capacity
    lastRefill = now
else
    local delta = math.max(0, now - lastRefill) / 1000
    tokens = math.min(capacity, tokens + (delta * refillRate))
    lastRefill = noq
end

if tokens >= requested then
    tokens = tokens - requested
    redis.call("HMSET", key, "tokens", tokens, "lastRefill", lastRefill)
    redis.call("EXPIRE", key, math.ceil(capacity / refillRate))
    return {1, math.floor(tokens)}
else 
    redis.call("HMSET", key, "tokens", tokens, "lastRefill", lastRefill)
    return {0, math.floor(tokens)}
end