# GitHub Secrets Configuration

GitHub Actions를 위한 시크릿 설정 가이드입니다. 이 설정은 배포 모니터링 및 헬스 체크 시스템의 정상 작동을 위해 필수적입니다.

## 필수 GitHub 시크릿 설정

### 1. `VERCEL_PRODUCTION_URL` ⚠️ **가장 중요**

**목적**: 헬스 체크를 위한 실제 프로덕션 URL을 지정합니다.

**중요성**: 기본 하드코딩된 URL(`https://todo-app-2.vercel.app`)은 다른 프로젝트("Reducer Todo")를 반환합니다. 이 시크릿 설정 없이 헬스 체크는 실패합니다.

**How to Set**:

1. **Get your actual Vercel production URL**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project: `todo-app-2` (project ID: `prj_XDFHxDzEVgRkUbnyb6hO3H7SGH6t`)
   - Copy the production domain from the **Domains** section
   - It should look like: `https://todo-app-2-xyz.vercel.app` or your custom domain

2. **Add the GitHub Secret**:

   ```bash
   # Using GitHub CLI
   gh secret set VERCEL_PRODUCTION_URL --body "https://your-actual-url.vercel.app"

   # Or via GitHub UI:
   # Navigate to: Repository > Settings > Secrets and variables > Actions > New repository secret
   # Name: VERCEL_PRODUCTION_URL
   # Value: https://your-actual-url.vercel.app
   ```

3. **Verify the configuration**:
   - Go to **Actions** tab in your repository
   - Run the workflow manually: **Deployment Alerts and Monitoring** > **Run workflow**
   - Check the logs for the "Display URL configuration" step
   - Verify it shows your correct URL

### 2. `VERCEL_PROTECTION_BYPASS` (권장 선택 사항)

**목적**: Vercel Deployment Protection을 건너뛰기 위한 토큰으로, 보호된 배포에서 헬스 체크를 허용합니다.

**How to Get**:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** > **Deployment Protection**
4. Copy the **Bypass Token**

**How to Set**:

```bash
gh secret set VERCEL_PROTECTION_BYPASS --body "your-bypass-token"
```

### 3. `SLACK_WEBHOOK_URL` (선택 사항)

**목적**: 배포 및 헬스 체크 알림을 Slack으로 전송합니다.

**How to Get**:

1. Create an Incoming Webhook in your Slack workspace
2. Copy the webhook URL

**How to Set**:

```bash
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

## URL Resolution Priority

The workflow uses the following priority order for determining `VERCEL_URL`:

1. **`VERCEL_PRODUCTION_URL` secret** (highest priority - use this!)
2. **`github.event.deployment_status.target_url`** (only during deployment events)
3. **Hardcoded fallback** `https://todo-app-2.vercel.app` (incorrect - don't rely on this)

## Testing Your Configuration

### Manual Workflow Test

1. Go to **Actions** tab
2. Select **Deployment Alerts and Monitoring** workflow
3. Click **Run workflow**
4. Check the logs for the "Display URL configuration" step
5. Verify the URL is correct

### Expected Output

```
=== Health Check Configuration ===
VERCEL_URL: https://your-actual-url.vercel.app
VERCEL_BYPASS_TOKEN: configured
Event: workflow_dispatch
=================================
```

### Health Check Endpoint

The workflow checks: `https://your-actual-url.vercel.app/api/health`

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2026-03-18T..."
}
```

## Troubleshooting

### Issue: Health check returns 404 or wrong project

**Cause**: `VERCEL_PRODUCTION_URL` is not set or is set to the wrong URL.

**Solution**:

1. Verify the secret is set: `gh secret list | grep VERCEL_PRODUCTION_URL`
2. Check the value (you'll need to re-set it to see it):
   ```bash
   gh secret set VERCEL_PRODUCTION_URL --body "https://correct-url.vercel.app"
   ```
3. Run the workflow manually and check the logs

### Issue: Health check fails with 403 Forbidden

**Cause**: Vercel Deployment Protection is blocking the health check.

**Solution**:

1. Add the `VERCEL_PROTECTION_BYPASS` secret
2. The workflow will automatically use the bypass token
3. Verify the bypass token is valid in Vercel Dashboard

### Issue: Health check returns wrong project ("Reducer Todo")

**Cause**: The default hardcoded URL is being used.

**Solution**: Set the `VERCEL_PRODUCTION_URL` secret as described above.

## Project Information

- **Project Name**: todo-app-2
- **Vercel Project ID**: `prj_XDFHxDzEVgRkUbnyb6hO3H7SGH6t`
- **Health Check Endpoint**: `/api/health`
- **Required Method**: GET
- **Expected Status**: 200 OK
- **Expected Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "ISO-8601-timestamp"
  }
  ```

## Additional Resources

- [Vercel Deployment Protection Documentation](https://vercel.com/docs/security/deployment-protection)
- [GitHub Actions Workflow Documentation](https://docs.github.com/en/actions)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
