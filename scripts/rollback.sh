#!/bin/bash

################################################################################
# Rollback Script
#
# REQ-010: WHEN 에러율이 임계값(5%)을 초과하면, THEN 시스템은 자동으로
#          이전 버전으로 롤백하고 알림을 발송해야 한다.
# REQ-017: IF 롤백이 요청되면, THEN 시스템은 1분 이내에 이전 안정 버전으로
#          복구해야 한다.
#
# Usage:
#   ./scripts/rollback.sh                    # Rollback to previous deployment
#   ./scripts/rollback.sh --confirm         # Skip confirmation prompt
#   VERCEL_TOKEN=xxx ./scripts/rollback.sh  # With custom token
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VERCEL_TOKEN="${VERCEL_TOKEN:-}"
VERCEL_ORG_ID="${VERCEL_ORG_ID:-}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-}"
CONFIRM="${1:-}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI not found${NC}"
    echo "Please install it with: npm install -g vercel"
    exit 1
fi

# Check if token is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}Error: VERCEL_TOKEN environment variable not set${NC}"
    echo "Please set it with: export VERCEL_TOKEN=your_token"
    exit 1
fi

# Function to log with timestamp
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to log error
error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

# Function to log warning
warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Confirm rollback
if [ "$CONFIRM" != "--confirm" ]; then
    echo -e "${YELLOW}⚠️  This will rollback to the previous deployment${NC}"
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " confirmation

    if [ "$confirmation" != "yes" ]; then
        log "Rollback cancelled"
        exit 0
    fi
fi

log "Starting rollback process..."

# Get current deployment info
log "Fetching current deployment info..."
CURRENT_DEPLOYMENT=$(vercel ls --yes --token="$VERCEL_TOKEN" --scope="$VERCEL_ORG_ID" 2>/dev/null | head -n 1)

if [ -z "$CURRENT_DEPLOYMENT" ]; then
    error "Failed to fetch current deployment"
    exit 1
fi

log "Current deployment: $CURRENT_DEPLOYMENT"

# Get previous deployment
log "Fetching previous deployment..."
PREVIOUS_DEPLOYMENTS=$(vercel ls --yes --token="$VERCEL_TOKEN" --scope="$VERCEL_ORG_ID" --number=2 2>/dev/null | tail -n 1)

if [ -z "$PREVIOUS_DEPLOYMENTS" ]; then
    error "No previous deployment found"
    exit 1
fi

PREVIOUS_URL=$(echo "$PREVIOUS_DEPLOYMENTS" | awk '{print $2}')
PREVIOUS_TIME=$(echo "$PREVIOUS_DEPLOYMENTS" | awk '{print $1, $2}')

log "Rolling back to: $PREVIOUS_URL ($PREVIOUS_TIME)"

# Perform rollback
log "Initiating rollback..."
if vercel rollback --yes --token="$VERCEL_TOKEN"; then
    log "✅ Rollback completed successfully"

    # Log rollback event
    log "Recording rollback event..."

    # Send notification (you can integrate with Slack, Discord, etc.)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        log "Sending Slack notification..."
        curl -s -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{
                \"text\": \"🚨 Rollback Alert\",
                \"blocks\": [
                    {
                        \"type\": \"section\",
                        \"text\": {
                            \"type\": \"mrkdwn\",
                            \"text\": \":warning: *Deployment Rolled Back*\n\n*Previous:* $CURRENT_DEPLOYMENT\n*Now:* $PREVIOUS_URL\n*Time:* $(date '+%Y-%m-%d %H:%M:%S')\"
                        }
                    }
                ]
            }" > /dev/null 2>&1 && log "Slack notification sent" || warning "Failed to send Slack notification"
    fi

    # Health check verification
    log "Waiting for deployment to stabilize..."
    sleep 10

    # Perform health check
    PRODUCTION_URL="https://todo-app.vercel.app"
    log "Performing health check on $PRODUCTION_URL/api/health..."

    if curl -f -s "$PRODUCTION_URL/api/health" > /dev/null 2>&1; then
        log "✅ Health check passed"
    else
        error "❌ Health check failed - manual intervention required"
        exit 1
    fi

    log "Rollback process completed successfully"
    echo ""
    log "Next steps:"
    log "1. Verify application functionality"
    log "2. Check error rates in Sentry"
    log "3. Create post-mortem if needed"
    log "4. Push fix for the issue"

else
    error "❌ Rollback failed"
    error "Manual intervention required:"
    error "1. Go to Vercel dashboard"
    error "2. Navigate to Deployments"
    error "3. Find previous stable deployment"
    error "4. Promote it to production"

    # Send emergency notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -s -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{
                \"text\": \"🚨 Rollback Failed\",
                \"blocks\": [
                    {
                        \"type\": \"section\",
                        \"text\": {
                            \"type\": \"mrkdwn\",
                            \"text\": \":x: *Automated Rollback Failed*\n\n*Time:* $(date '+%Y-%m-%d %H:%M:%S')\n\n*Action Required:* Manual rollback needed\"
                        }
                    }
                ]
            }" > /dev/null 2>&1
    fi

    exit 1
fi
