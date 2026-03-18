# 빠른 시작: 헬스 체크 설정

## 🚨 한 번만 필요한 필수 설정

### Fix Health Check URL Issue

The health checks are currently failing because the workflow uses a hardcoded URL that points to the wrong project ("Reducer Todo" instead of your actual todo-app-2 project).

### ⚡ 빠른 수정 (2분)

```bash
# Step 1: Find your actual Vercel URL
vercel ls
# Or check: https://vercel.com/dashboard > todo-app-2 > Settings > Domains

# Step 2: Set the GitHub secret (replace with your actual URL)
gh secret set VERCEL_PRODUCTION_URL --body "https://your-actual-url.vercel.app"

# Step 3: Test the fix
gh workflow run alerts.yml

# Step 4: Check the logs
gh run list --workflow=alerts.yml --limit 1
gh run view [run-id] --log
```

### 예상 결과

After setting the secret, health checks should pass:

```
✅ HTTP Code: 200
✅ Response: {"status":"healthy","timestamp":"..."}
✅ Health check passed
```

## 📋 What Was Changed

1. **Updated `VERCEL_URL` resolution**:
   - Now checks `VERCEL_PRODUCTION_URL` secret first
   - Falls back to deployment URL during deployments
   - Hardcoded URL as last resort (should never be used)

2. **Added debugging information**:
   - Shows which URL is being used
   - Displays bypass token status
   - Logs full health check response

3. **Enhanced error messages**:
   - Better visibility into configuration
   - Clear indication of bypass token usage

## 🔗 Full Documentation

- **SECRETS-CONFIG.md**: Complete setup guide with troubleshooting
- **HEALTH-CHECK-FIX.md**: Detailed explanation of the fix
- **alerts.yml**: Updated workflow file

## ❓ Common Issues

### Health check still fails

1. Verify the secret is set:

   ```bash
   gh secret list | grep VERCEL_PRODUCTION_URL
   ```

2. Check the URL is correct:

   ```bash
   curl https://your-actual-url.vercel.app/api/health
   ```

3. Review workflow logs for the actual URL being used

### 403 Forbidden errors

Add the bypass token:

```bash
gh secret set VERCEL_PROTECTION_BYPASS --body "your-bypass-token"
```

Get the token from: Vercel Dashboard > Settings > Deployment Protection

## 📊 Health Check Details

- **Endpoint**: `/api/health`
- **Method**: `GET`
- **Expected Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-03-18T..."
  }
  ```
- **Schedule**: Every 5 minutes
- **Failure Action**: Creates GitHub issue + Slack alert (if configured)

## 🎯 Project Info

- **Project**: todo-app-2
- **Vercel ID**: `prj_XDFHxDzEVgRkUbnyb6hO3H7SGH6t`
- **Health Check**: `/api/health`
- **Required Secret**: `VERCEL_PRODUCTION_URL` ⚠️ **SET THIS NOW**

---

**Need Help?** See `SECRETS-CONFIG.md` for detailed troubleshooting
