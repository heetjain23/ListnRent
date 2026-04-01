# Redis Setup Guide for RentFit

## 📋 Overview

Redis is now integrated into your RentFit project for caching:
- **Listings** (all & individual) - cached for 24 hours
- **User profiles** - cached for 24 hours
- **User bookings** - cached for 30 minutes
- **Renter bookings** - cached for 30 minutes

---

## 1️⃣ SETUP OPTIONS

### Option A: Local Redis (Development)
Best for development on your local machine.

### Option B: Redis Cloud (Production)
Best for cloud deployment.

---

## 2️⃣ OPTION A - LOCAL REDIS SETUP

### 2.1 Windows Installation

#### Method 1: Using Docker (Recommended)
**Prerequisites:** [Download Docker Desktop](https://www.docker.com/products/docker-desktop)

**Steps:**
```powershell
# Pull Redis image
docker pull redis:latest

# Run Redis container
docker run -d --name redis-rentfit -p 6379:6379 redis:latest

# Verify it's running
docker ps
```

#### Method 2: Using Windows Subsystem for Linux (WSL)
```powershell
# Enable WSL if not already enabled
wsl --install

# In WSL terminal:
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
redis-server

# Test in another WSL terminal
redis-cli ping
# Should return: PONG
```

#### Method 3: Using Precompiled Binaries
1. Download from: [Redis Windows Releases](https://github.com/microsoftarchive/redis/releases)
2. Extract to a folder (e.g., `C:\redis`)
3. Run `redis-server.exe`

---

### 2.2 Verify Local Redis is Running

**Method 1: Using redis-cli**
```powershell
# If using Docker
docker exec redis-rentfit redis-cli ping

# If using native installation
redis-cli ping
```

Expected output: `PONG`

**Method 2: Using PowerShell**
```powershell
# Test connection to localhost:6379
Test-NetConnection -ComputerName localhost -Port 6379 -InformationLevel Quiet
# Returns: True if running
```

**Method 3: Check in Docker Desktop**
- Open Docker Desktop
- Look for container named `redis-rentfit`
- Status should show "Running"

---

### 2.3 Configure Local Redis in .env

Create or update `.env` file in your server folder:

```env
# Redis Configuration (Local)
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=  # Leave empty for local (no password)
```

**Note:** No password needed for local development.

---

## 3️⃣ OPTION B - REDIS CLOUD SETUP

### 3.1 Create Reddit Account

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Click "Try Free" or "Sign Up"
3. Choose plan:
   - **Free Tier**: 30MB storage (perfect for testing)
   - **Pro**: For production

### 3.2 Create Redis Database

1. After signing up, go to **Databases**
2. Click **"Create"** or **"+ New Database"**
3. Choose settings:
   - **Cloud Provider**: AWS, Google Cloud, or Azure
   - **Region**: Choose closest to your users
   - **Database**: Redis (selected by default)
4. Click **Create Database**

### 3.3 Get Connection Credentials

Once database is created:

1. **Click on your database** in the list
2. In the **Connection String** section, you'll see:
   ```
   redis-12345.c123.us-east-1-2.ec2.cloud.redis.com:12345
   ```
   - Extract these parts:
     - **Host**: `redis-12345.c123.us-east-1-2.ec2.cloud.redis.com`
     - **Port**: `12345`

3. **Default User Password** (or create new credentials):
   - Click "Default" user or create new
   - Copy the password (keep it safe!)

### 3.4 Verify Redis Cloud Connection

Use this command from PowerShell:
```powershell
# Install redis-cli if not present
choco install redis-64 -y

# Test connection (replace with your credentials)
redis-cli -h redis-12345.c123.us-east-1-2.ec2.cloud.redis.com -p 12345 -a your_password ping
```

Expected: `PONG`

### 3.5 Configure Redis Cloud in .env

Update your `.env` file:

```env
# Redis Configuration (Cloud)
REDIS_HOST=redis-12345.c123.us-east-1-2.ec2.cloud.redis.com
REDIS_PORT=12345
REDIS_PASSWORD=your_secure_password_here
```

---

## 4️⃣ HOW TO CHECK IF REDIS IS RUNNING

### Check 1: Startup Logs
When your server starts, look for:

```
Redis Connected
Redis Ready
```

If you see Redis error instead, Redis isn't running.

### Check 2: Using redis-cli

**For Local:**
```powershell
redis-cli
# Should connect without error
# Type: ping
# Should return: PONG
```

**For Redis Cloud:**
```powershell
redis-cli -h your_host -p your_port -a your_password ping
```

### Check 3: Check MongoDB Connection Logs
```
MongoDB Connected
[Redis] ✓ Connected successfully
```

### Check 4: API Test
```powershell
# Make a test request to your API
curl http://localhost:5000/api/test

# Should get response with 200 status
```

---

## 5️⃣ TROUBLESHOOTING

### ❌ Error: "Redis Client Error - connect ECONNREFUSED"

**Causes & Solutions:**
1. **Redis not running**
   - Windows Docker: Run `docker start redis-rentfit`
   - Local: Start `redis-server.exe` or service
   - Cloud: Check Redis Cloud dashboard status

2. **Wrong host/port**
   - Verify `.env` values match your Redis setup
   - Local should be `localhost:6379`
   - Cloud: Double-check credentials

### ❌ Error: "NOAUTH Authentication required"

**Solution:**
- Ensure `REDIS_PASSWORD` is set in `.env` for Redis Cloud
- Leave password empty for local Redis

### ❌ Cannot connect to Redis Cloud

**Causes:**
1. Password wrong - check Redis Cloud dashboard
2. Host/port incorrect - copy carefully from Redis Cloud
3. Network/firewall issue - check if ports open

**Fix:**
```powershell
# Test connection
redis-cli -h your_host -p your_port -a your_password ping

# If it works, issue is in app configuration
# If it fails, issue is with Redis setup
```

### ❌ Server starts but caching not working

**Check:**
1. Verify logs show "Redis Ready"
2. Make API calls multiple times - should be faster 2nd time
3. Check Redis memory: `redis-cli info memory`

---

## 6️⃣ CACHE MANAGEMENT

### View Cached Data
```powershell
redis-cli

# List all keys
keys *

# Get value
get your_key

# Get expiry time
ttl your_key
```

### Clear All Cache
```powershell
redis-cli FLUSHALL
# Or via API - restart server clears it
```

### Clear Specific Cache
```powershell
redis-cli
del listings:*
# Deletes all listings cache
```

---

## 7️⃣ PERFORMANCE TIPS

1. **Monitor Cache Hits**
   - Check server logs for "Returning cached..."
   - This means cache is working!

2. **Adjust Cache Duration**
   - Edit `src/utils/redis.js` CACHE_EXPIRY values
   - Longer = fewer DB hits, but staler data

3. **Monitor Memory**
   ```powershell
   redis-cli info memory
   # Shows used vs max memory
   ```

4. **Set Max Memory Policy** (for Redis Cloud)
   - Go to Advanced Settings
   - Set "Max Memory Policy" to `allkeys-lru`
   - This auto-removes old cache when memory full

---

## 8️⃣ DOCKER COMMANDS REFERENCE

```powershell
# Start Redis container
docker run -d --name redis-rentfit -p 6379:6379 redis:latest

# Start existing container
docker start redis-rentfit

# Stop container
docker stop redis-rentfit

# View logs
docker logs redis-rentfit

# Enter Redis CLI
docker exec -it redis-rentfit redis-cli

# Remove container (will delete all data)
docker rm redis-rentfit

# Persistent storage (alternative)
docker run -d --name redis-rentfit -p 6379:6379 -v redis-data:/data redis:latest
```

---

## ✅ NEXT STEPS

1. **Choose setup**: Local (Docker) or Redis Cloud
2. **Run Redis** following instructions above
3. **Verify** by checking logs: `Redis Ready`
4. **Test** by making API calls twice - 2nd should be faster
5. **Monitor** cache using commands in section 6

---

## 📞 QUICK REFERENCE

| Component | Local | Docker | Cloud |
|-----------|-------|--------|-------|
| Setup Time | 5-10 min | 2-3 min | 5 min |
| Setup Difficulty | Medium | Easy | Easy |
| Cost | Free | Free | Free (30MB tier) |
| Performance | Good | Good | Excellent |
| Best For | Dev | Dev/Testing | Production |

---

## 🔗 Useful Links

- [Redis Docs](https://redis.io/docs/)
- [Redis Cloud](https://redis.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node Redis Docs](https://github.com/redis/node-redis)
