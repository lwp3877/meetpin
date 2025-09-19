# MeetPin Database Integration Guide

> **Status**: Real database integration is **CONFIGURED** and ready for schema deployment  
> **Environment Variables**: ✅ 4/4 configured  
> **Database Connection**: ✅ Working  
> **Schema Status**: ❌ Needs deployment  

## 🎯 Current Integration Status

### What's Working ✅
- **Environment Variables**: All Supabase keys properly configured
- **Connection**: Successfully connecting to Supabase instance
- **API Framework**: All endpoints responding correctly
- **Real DB Mode**: `NEXT_PUBLIC_USE_MOCK_DATA=false` working
- **Health Check API**: Properly detecting missing schema

### What's Missing ❌
- **Database Schema**: Tables and policies need to be created
- **Sample Data**: Test data for development

## 🚀 Quick Deployment Steps

### Step 1: Apply Database Schema
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project
2. Navigate to **SQL Editor**
3. Copy the entire contents of `scripts/complete-setup.sql`
4. Paste into the SQL Editor
5. Click **"Run"** to execute

### Step 2: Verify Schema Creation
```bash
# Run the integration test
node scripts/test-db-integration.js

# Expected output after schema deployment:
# ✅ Environment Variables: 4/4 configured
# ✅ Health Check: PASS 
# ✅ Database Schema: EXISTS
# ✅ API Endpoints: 3/3 responding
```

### Step 3: Test Application
1. Start development server: `pnpm dev`
2. Visit `http://localhost:3000`
3. Try creating a room and making requests
4. Verify real-time features work

## 📋 Database Schema Overview

### Core Tables Created
- **profiles** - User profiles (linked to auth.users)
- **rooms** - Meeting rooms with location data  
- **requests** - Join requests from users
- **matches** - Accepted requests enabling chat
- **messages** - 1:1 chat messages
- **host_messages** - Messages to room hosts
- **reports** - User reporting system
- **blocked_users** - User blocking relationships

### Security Features
- **Row Level Security (RLS)** - Enabled on all tables
- **User Isolation** - Blocked users cannot see each other's data
- **Permission System** - Room hosts control their rooms
- **Admin Access** - Admin users can manage reports

### Performance Optimizations
- **50+ Optimized Indexes** - For geographic search and joins
- **Real-time Subscriptions** - WebSocket support for chat
- **Efficient Queries** - Bbox filtering instead of PostGIS

## 🔧 Development Workflow

### Real DB Mode (Production-like)
```bash
# Enable real database
echo "NEXT_PUBLIC_USE_MOCK_DATA=false" >> .env.local

# Test integration
node scripts/test-db-integration.js

# Start development
pnpm dev
```

### Mock Mode (Fast Development)
```bash
# Enable mock data
echo "NEXT_PUBLIC_USE_MOCK_DATA=true" >> .env.local

# Start development
pnpm dev
```

## 🏥 Health Check API

The `/api/health` endpoint provides comprehensive status:

```bash
curl http://localhost:3000/api/health
```

**Response Format:**
```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "environment": "production",
    "services": {
      "database": "connected",
      "auth": "configured", 
      "maps": "configured",
      "payments": "configured"
    },
    "performance": {
      "uptime": 30.5,
      "memory_usage": 156.61
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```
Error: fetch failed
```
**Solution**: Check Supabase URL and keys in environment variables

#### 2. Schema Missing Errors  
```
Database schema missing or corrupted
```
**Solution**: Apply `scripts/complete-setup.sql` in Supabase SQL Editor

#### 3. RLS Policy Errors
```
new row violates row-level security policy
```
**Solution**: Ensure user is authenticated and has proper permissions

#### 4. Environment Variable Issues
```
Environment variable not set
```
**Solution**: Check `.env.local` file exists and contains all required variables

### Debugging Commands

```bash
# Check environment variables
node scripts/validate-env.js development

# Test database integration
node scripts/test-db-integration.js

# Check health status
curl http://localhost:3000/api/health

# Test specific API endpoint
curl "http://localhost:3000/api/rooms?bbox=37.4,126.8,37.7,127.2"
```

## 📊 Integration Test Results

After successful schema deployment, expect these results:

```
MeetPin Database Integration Test
============================================================

🔧 Environment Variables Test
✅ NEXT_PUBLIC_SUPABASE_URL: https://xnrqfkecpabucnoxxtwa.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGci...
✅ SUPABASE_SERVICE_ROLE_KEY: eyJhbGci...  
✅ NEXT_PUBLIC_USE_MOCK_DATA: false (real DB mode)

🏥 Health Check API Test
✅ Environment: production
✅ Version: 1.3.1
✅ database: connected
✅ auth: configured
✅ maps: configured  
✅ payments: configured
✅ Overall health: healthy

🗄️ Database Schema Test
✅ Database schema exists and working
✅ Rooms API returned 0 rooms

🔗 API Endpoints Test  
✅ Rooms API: responding (200)
✅ Auth API: responding (401)
✅ Health API: responding (200)

============================================================
📊 Database Integration Test Report
Environment Variables: 4/4 configured
Health Check: PASS
Database Schema: EXISTS  
API Endpoints: 3/3 responding
============================================================

🎉 Database Integration Status
✅ Real database integration is working!
✅ Environment variables configured
✅ Supabase connection established
✅ Database schema exists
✅ API endpoints responding

🚀 Ready for Step 6: Full Test Suite
Run: pnpm test && pnpm e2e
```

## 🎯 Next Steps

1. **Deploy Schema**: Apply `scripts/complete-setup.sql` to Supabase
2. **Verify Integration**: Run `node scripts/test-db-integration.js`  
3. **Create Test Data**: Use the UI to create rooms and test functionality
4. **Run Full Tests**: Execute `pnpm test && pnpm e2e`
5. **Production Deploy**: Ready for Vercel deployment

---

**Note**: This guide assumes the database schema deployment step is completed manually in Supabase Dashboard. All other integration steps are automated and tested.