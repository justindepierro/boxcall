# Uptime Monitoring Setup Guide

**Status**: 🟡 Pending Setup  
**Created**: January 9, 2025  
**Provider**: Uptime Robot (Free Tier)

## 📋 Overview

Professional uptime monitoring with real-time alerts and public status page.

**Features**:
- ✅ Free tier (50 monitors, 5-minute intervals)
- ✅ Multiple monitor types (HTTP, Ping, Keyword)
- ✅ SMS, Email, Slack, webhook alerts
- ✅ Public status pages
- ✅ SSL certificate monitoring
- ✅ 90-day response time graphs

---

## 🚀 Quick Setup (15 minutes)

1. [Create Account](#step-1-create-uptime-robot-account)
2. [Add Monitors](#step-2-create-monitors)
3. [Configure Alerts](#step-3-set-up-alerts)
4. [Create Status Page](#step-4-create-public-status-page)
5. [Test Monitors](#step-5-test-monitors)

---

## 📝 Step 1: Create Uptime Robot Account

### 1.1 Sign Up

1. Go to: https://uptimerobot.com/signUp
2. Enter email address
3. Choose password
4. Verify email
5. Log in

### 1.2 Upgrade to Pro (Optional)

**Free Tier Includes**:
- 50 monitors
- 5-minute checks
- Email/SMS/Slack alerts
- 2-month logs
- 10 status pages

**Pro Tier ($7/month)**:
- 1-minute checks
- Unlimited alerts
- 12-month logs
- Advanced notifications

**Recommendation**: Start with free tier, upgrade if needed.

---

## 🎯 Step 2: Create Monitors

### Monitor 1: Main Application Health

**Purpose**: Comprehensive health check including database, storage, and auth

Click "+ Add New Monitor"

**Settings**:
```
Monitor Type: HTTP(s)
Friendly Name: BoxCall - Health Check
URL: https://boxcall.app/health
Monitoring Interval: 5 minutes (free) or 1 minute (pro)
Monitor Timeout: 30 seconds
```

**Advanced Settings**:
```
Alert when:
  ☑ Down
  ☑ Seems down (optional)
  ☐ SSL certificate issues (auto-enabled)

HTTP Method: GET
HTTP Expected Status Code: 200

Custom HTTP Headers: (leave empty unless needed)

Keyword Monitoring:
  ☑ Enable
  Keyword Type: Exists
  Case Sensitivity: Not important
  Keyword Value: "status":"operational"
```

**Why this works**: Our `/health` endpoint returns JSON with `"status":"operational"` when healthy.

---

### Monitor 2: Readiness Check

**Purpose**: Load balancer health checks

Click "+ Add New Monitor"

**Settings**:
```
Monitor Type: HTTP(s)
Friendly Name: BoxCall - Ready
URL: https://boxcall.app/ready
Monitoring Interval: 5 minutes
Monitor Timeout: 15 seconds
```

**Advanced Settings**:
```
Alert when:
  ☑ Down
  ☐ Seems down

HTTP Method: GET
HTTP Expected Status Code: 200

Keyword Monitoring:
  ☑ Enable
  Keyword Value: "ready":true
```

---

### Monitor 3: Liveness Check

**Purpose**: Basic application responsiveness

Click "+ Add New Monitor"

**Settings**:
```
Monitor Type: HTTP(s)
Friendly Name: BoxCall - Live
URL: https://boxcall.app/live
Monitoring Interval: 5 minutes
Monitor Timeout: 10 seconds
```

**Advanced Settings**:
```
Alert when:
  ☑ Down
  ☐ Seems down

HTTP Method: GET
HTTP Expected Status Code: 200

Keyword Monitoring:
  ☑ Enable
  Keyword Value: "alive":true
```

---

### Monitor 4: Main Domain

**Purpose**: Overall site availability

Click "+ Add New Monitor"

**Settings**:
```
Monitor Type: HTTP(s)
Friendly Name: BoxCall - Homepage
URL: https://boxcall.app
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
```

**Advanced Settings**:
```
Alert when:
  ☑ Down
  ☑ Seems down
  ☑ SSL certificate expires soon

HTTP Method: GET
HTTP Expected Status Code: 200

Keyword Monitoring:
  ☑ Enable
  Keyword Value: BoxCall
```

---

### Monitor 5: API Response Time

**Purpose**: Performance degradation detection

Click "+ Add New Monitor"

**Settings**:
```
Monitor Type: HTTP(s)
Friendly Name: BoxCall - Performance
URL: https://boxcall.app/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
```

**Advanced Settings**:
```
Alert when:
  ☑ Down
  ☑ Response time > 2000ms

HTTP Method: GET
HTTP Expected Status Code: 200
```

---

## 🔔 Step 3: Set Up Alerts

### 3.1 Email Alerts (Default)

**Already configured** with your account email.

**Settings**:
- Click Settings → Alert Contacts
- Your email is added automatically
- Configure notifications:
  - ☑ When monitor goes down
  - ☑ When monitor comes back up
  - ☐ When SSL expires (optional)

---

### 3.2 Slack Alerts (Recommended)

**Setup**:
1. In Uptime Robot: Settings → Alert Contacts
2. Click "+ Add Alert Contact"
3. Select "Slack"
4. Click "Authorize Uptime Robot"
5. Choose Slack workspace
6. Select channel (e.g., `#alerts`, `#devops`)
7. Allow

**Configure**:
```
Contact Type: Slack
Friendly Name: DevOps Alerts
Channel: #alerts

Send alerts for:
  ☑ Down
  ☑ Up
  ☐ Paused
  ☑ Started
```

**Test**:
1. Go to Dashboard
2. Find any monitor
3. Click "..." → "Pause Monitoring"
4. Wait 5 seconds
5. Click "..." → "Resume Monitoring"
6. Check Slack for test notification

---

### 3.3 SMS Alerts (Optional)

**Free Tier**: Limited SMS credits  
**Pro Tier**: Unlimited SMS

**Setup**:
1. Settings → Alert Contacts
2. "+ Add Alert Contact"
3. Select "SMS"
4. Enter phone number (with country code)
5. Verify via code
6. Configure when to send

**Recommendation**: Use for critical monitors only (e.g., main health check).

---

### 3.4 Webhook Alerts (Advanced)

For integration with PagerDuty, Opsgenie, or custom systems.

**Setup**:
1. Settings → Alert Contacts
2. "+ Add Alert Contact"
3. Select "Webhook"
4. Enter webhook URL
5. Configure POST data

**Example for PagerDuty**:
```
URL: https://events.pagerduty.com/v2/enqueue
POST Value: {
  "routing_key": "YOUR_INTEGRATION_KEY",
  "event_action": "*alertTypeFriendlyName*",
  "payload": {
    "summary": "*monitorFriendlyName* is *alertTypeFriendlyName*",
    "severity": "critical",
    "source": "uptimerobot"
  }
}
```

---

## 📊 Step 4: Create Public Status Page

### 4.1 Create Status Page

1. Go to: Status Pages
2. Click "+ Add Status Page"
3. Enter details:

```
Status Page Name: BoxCall Status
Status Page URL: boxcall-status (becomes boxcall-status.uptimerobot.com)
```

### 4.2 Configure Monitors

**Select monitors to display**:
- ☑ BoxCall - Health Check
- ☑ BoxCall - Homepage
- ☑ BoxCall - Performance
- ☐ BoxCall - Ready (internal use)
- ☐ BoxCall - Live (internal use)

### 4.3 Customize Appearance

**Design Tab**:
```
Header: BoxCall System Status
Logo: (upload boxcall-logo.png)
Custom Domain: status.boxcall.app (requires DNS setup)

Theme:
  ☑ Light mode
  ☐ Dark mode
  ☑ Auto (based on user preference)

Colors:
  Primary: #1e40af (brand blue)
  Success: #10b981 (green)
  Warning: #f59e0b (yellow)
  Error: #ef4444 (red)
```

**Announcement**:
```
Welcome to BoxCall Status Page
Real-time monitoring of our services and systems.
```

### 4.4 Advanced Settings

```
Show Uptime Percentages: ☑ Yes
Show Response Times: ☑ Yes
Historical Data: 90 days

Timezone: America/New_York (or your preference)

Email Subscriptions:
  ☑ Allow users to subscribe
  ☑ Send daily summary
  ☐ Send weekly summary
```

### 4.5 Custom Domain (Optional)

**Requires DNS setup**:

1. Go to Status Page → Custom Domain
2. Enter: `status.boxcall.app`
3. Add CNAME record to your DNS:
   ```
   Type: CNAME
   Name: status
   Value: stats.uptimerobot.com
   TTL: 3600
   ```
4. Wait for DNS propagation (5-30 minutes)
5. Verify in Uptime Robot

---

## 🧪 Step 5: Test Monitors

### 5.1 Verify All Monitors are Up

Go to Dashboard and check:
```
✅ BoxCall - Health Check (Up - 100%)
✅ BoxCall - Ready (Up - 100%)
✅ BoxCall - Live (Up - 100%)
✅ BoxCall - Homepage (Up - 100%)
✅ BoxCall - Performance (Up - 100%)
```

### 5.2 Test Alert Flow

**Method 1: Pause Monitor**
1. Select any monitor
2. Click "..." → "Pause Monitoring"
3. Wait 30 seconds
4. Verify alert received (Email/Slack)
5. Click "..." → "Resume Monitoring"
6. Verify recovery alert received

**Method 2: Temporarily Break Endpoint** (more realistic)
1. Deploy a test change that breaks `/health`
2. Wait for monitor to detect
3. Verify alerts received
4. Fix endpoint
5. Verify recovery alerts

### 5.3 Check Status Page

1. Visit: `https://boxcall-status.uptimerobot.com`
2. Verify monitors are displayed
3. Check uptime percentages
4. Verify response time graphs
5. Test email subscription

---

## 📈 Monitoring Best Practices

### Daily

- **Automated**: Receive alerts if issues occur
- **Manual**: None required (only if alerts received)

### Weekly

- Review uptime percentages (should be > 99.9%)
- Check response time trends
- Review any downtime incidents

### Monthly

- Analyze response time trends
- Review alert accuracy (false positives?)
- Update monitor configurations if needed
- Test status page functionality

### Quarterly

- Full review of all monitors
- Update alert contacts
- Review and update runbooks
- Test disaster recovery procedures

---

## 🔍 Troubleshooting

### Issue: Monitor Shows "Down" but Site Works

**Causes**:
- Keyword not found in response
- Timeout too short
- SSL certificate issue
- Geographic check location issue

**Solutions**:
1. Check monitor logs for specific error
2. Test endpoint manually:
   ```bash
   curl -v https://boxcall.app/health
   ```
3. Verify keyword exists in response
4. Increase timeout if needed
5. Check SSL certificate expiration

### Issue: Too Many False Positives

**Symptoms**:
Monitor goes down for 30 seconds, then recovers

**Solutions**:
1. Enable "Seems Down" instead of immediate "Down"
2. Increase check interval to 5 minutes
3. Increase timeout to 30 seconds
4. Add multiple check locations (Pro feature)

### Issue: Alerts Not Received

**Symptoms**:
Monitor shows down but no alert

**Solutions**:
1. Verify alert contact is active
2. Check spam/junk folder (email)
3. Test alert contact manually
4. Verify monitor has alert contact assigned
5. Check alert threshold settings

### Issue: Status Page Not Updating

**Symptoms**:
Monitor is up but status page shows old data

**Solutions**:
1. Refresh page (Ctrl+F5)
2. Check if monitor is included in status page
3. Verify status page is published
4. Clear browser cache

---

## 💰 Cost Analysis

### Free Tier

**Included**:
- 50 monitors
- 5-minute intervals
- Unlimited alert contacts
- 10 status pages
- 2-month logs
- Email + SMS (limited) alerts

**Cost**: **$0/month**

**Sufficient for**: Small to medium applications

### Pro Tier ($7/month)

**Additional Features**:
- 1-minute intervals
- Advanced notifications
- 12-month logs
- Multi-location checks
- Custom alert timing

**Cost**: **$84/year**

**Worth it if**:
- Need faster detection (1 min vs 5 min)
- Require longer historical data
- Need multi-location redundancy

**Recommendation**: Start with free, upgrade if you experience:
- Frequent 5-minute outages you want to catch faster
- Need historical data beyond 2 months
- Require SLA reporting

---

## 🎯 Success Metrics

### Uptime Targets

| Service | Target | Alert Threshold |
|---------|--------|-----------------|
| Health Check | 99.9% | < 99.5% |
| Homepage | 99.9% | < 99.5% |
| API Performance | 99.5% | < 99.0% |

### Response Time Targets

| Endpoint | Target | Alert Threshold |
|----------|--------|-----------------|
| /health | < 500ms | > 2000ms |
| /ready | < 300ms | > 1000ms |
| /live | < 200ms | > 500ms |
| Homepage | < 1000ms | > 3000ms |

### Alert Response Time

| Severity | Response Time | Resolution Time |
|----------|---------------|-----------------|
| Critical | < 5 minutes | < 30 minutes |
| High | < 15 minutes | < 2 hours |
| Medium | < 1 hour | < 24 hours |
| Low | < 4 hours | < 3 days |

---

## 📝 Incident Response Runbook

### When Alert Received

1. **Acknowledge Alert** (< 5 min)
   - Reply to Slack thread: "Investigating"
   - Check status page
   - Verify issue is real (not false positive)

2. **Assess Impact** (< 10 min)
   - How many monitors affected?
   - What services are down?
   - How many users impacted?

3. **Communicate** (< 15 min)
   - Update status page if public-facing
   - Notify team in Slack
   - Start incident log

4. **Investigate** (< 30 min)
   - Check recent deployments
   - Review application logs
   - Check server resources
   - Review database status

5. **Resolve** (varies)
   - Apply fix
   - Verify monitors return to green
   - Update status page
   - Document in incident log

6. **Post-Mortem** (< 24 hours)
   - Write incident report
   - Identify root cause
   - Document preventive measures
   - Update runbooks

---

## 🔗 Integration with Existing Systems

### GitHub Actions

Add uptime status to README:

```markdown
[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m123456789-1234567890abcdef)](https://status.boxcall.app)
[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/30/m123456789-1234567890abcdef)](https://status.boxcall.app)
```

### Slack Commands

Create custom slash commands:
- `/status` - Quick uptime check
- `/incidents` - Recent incidents
- `/perf` - Performance metrics

### PagerDuty (Optional)

For 24/7 on-call rotation:
1. Create PagerDuty service
2. Get integration key
3. Add webhook alert contact in Uptime Robot
4. Configure escalation policies

---

## 📚 Related Documentation

- [`HEALTH_CHECK_SYSTEM.md`](./HEALTH_CHECK_SYSTEM.md) - Health endpoint documentation
- [`PRODUCTION_READINESS_STATUS.md`](./PRODUCTION_READINESS_STATUS.md) - Overall status
- [Uptime Robot Documentation](https://uptimerobot.com/api/)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)

---

## ✅ Setup Completion Checklist

- [ ] Uptime Robot account created
- [ ] 5 monitors configured and active
- [ ] Email alerts verified
- [ ] Slack alerts configured and tested
- [ ] Public status page created
- [ ] Custom domain configured (optional)
- [ ] Status page badge added to README
- [ ] Team notified of new monitoring
- [ ] Incident response runbook reviewed
- [ ] First week monitored for false positives

---

**Last Updated**: January 9, 2025  
**Maintained By**: Development Team  
**Estimated Setup Time**: 15-30 minutes
