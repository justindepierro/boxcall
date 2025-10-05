# Database Backup Automation Setup Guide

**Status**: 🟡 Workflow Created - Awaiting Configuration  
**Created**: January 9, 2025  
**Location**: `.github/workflows/backup-database.yml`

## 📋 Overview

Automated daily database backups with verification, S3 storage, and Slack notifications.

**Features**:

- ✅ Daily automated backups (2 AM UTC)
- ✅ Integrity verification before upload
- ✅ S3 storage with encryption (AES-256)
- ✅ Slack notifications (success/failure)
- ✅ Local cleanup (7 day retention)
- ✅ Artifact fallback for debugging
- ✅ Manual trigger capability

---

## 🚀 Quick Setup Checklist

- [ ] Create S3 bucket
- [ ] Configure AWS IAM user
- [ ] Add GitHub secrets
- [ ] Set up Slack webhook (optional)
- [ ] Test manual workflow
- [ ] Monitor first automated run

---

## 🪣 Step 1: Create S3 Bucket

### 1.1 Create Bucket

```bash
# Using AWS CLI
aws s3 mb s3://boxcall-backups --region us-east-1

# Or via AWS Console:
# 1. Go to S3 → Create bucket
# 2. Name: boxcall-backups
# 3. Region: us-east-1
# 4. Block all public access: ✅ Enabled
# 5. Create bucket
```

### 1.2 Enable Encryption

```bash
# Enable default encryption
aws s3api put-bucket-encryption \
  --bucket boxcall-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

**Via Console**:

1. Select bucket → Properties
2. Default encryption → Edit
3. Server-side encryption: Amazon S3-managed keys (SSE-S3)
4. Save

### 1.3 Enable Versioning

```bash
aws s3api put-bucket-versioning \
  --bucket boxcall-backups \
  --versioning-configuration Status=Enabled
```

**Via Console**:

1. Select bucket → Properties
2. Bucket Versioning → Edit
3. Enable
4. Save

### 1.4 Configure Lifecycle Policy

```bash
# Create lifecycle-policy.json
cat > lifecycle-policy.json <<'EOF'
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Prefix": "database/",
      "Expiration": {
        "Days": 30
      },
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 7
      }
    },
    {
      "Id": "KeepWeeklyBackups",
      "Status": "Enabled",
      "Prefix": "database/weekly/",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
EOF

# Apply lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket boxcall-backups \
  --lifecycle-configuration file://lifecycle-policy.json
```

**Via Console**:

1. Select bucket → Management
2. Lifecycle rules → Create lifecycle rule
3. Rule name: "DeleteOldBackups"
4. Prefix: `database/`
5. Expiration: 30 days
6. Save

---

## 👤 Step 2: Create IAM User

### 2.1 Create User

```bash
aws iam create-user --user-name github-actions-backup
```

**Via Console**:

1. IAM → Users → Create user
2. User name: `github-actions-backup`
3. No console access needed
4. Create user

### 2.2 Create Policy

```bash
# Create backup-policy.json
cat > backup-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::boxcall-backups/database/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::boxcall-backups"
    }
  ]
}
EOF

# Create policy
aws iam create-policy \
  --policy-name GitHubActionsBackupPolicy \
  --policy-document file://backup-policy.json

# Attach to user (replace ACCOUNT_ID with your AWS account ID)
aws iam attach-user-policy \
  --user-name github-actions-backup \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/GitHubActionsBackupPolicy
```

**Via Console**:

1. IAM → Policies → Create policy
2. JSON tab → Paste policy above
3. Name: `GitHubActionsBackupPolicy`
4. Create policy
5. IAM → Users → github-actions-backup
6. Add permissions → Attach policies
7. Select `GitHubActionsBackupPolicy`
8. Attach

### 2.3 Create Access Keys

```bash
aws iam create-access-key --user-name github-actions-backup
```

**Save the output!** You'll need:

- `AccessKeyId`
- `SecretAccessKey`

**Via Console**:

1. IAM → Users → github-actions-backup
2. Security credentials → Create access key
3. Use case: Application running outside AWS
4. Create
5. **Download CSV immediately** (can't retrieve secret later)

---

## 🔐 Step 3: Add GitHub Secrets

Go to: `https://github.com/justindepierro/boxcall/settings/secrets/actions`

### Required Secrets

| Secret Name                 | Value                              | Description                                |
| --------------------------- | ---------------------------------- | ------------------------------------------ |
| `VITE_SUPABASE_URL`         | `https://your-project.supabase.co` | Supabase project URL                       |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...`                           | Service role key (from Supabase dashboard) |
| `AWS_ACCESS_KEY_ID`         | `AKIA...`                          | From Step 2.3                              |
| `AWS_SECRET_ACCESS_KEY`     | `wJa...`                           | From Step 2.3                              |

### Optional Secrets

| Secret Name         | Value                                  | Description       |
| ------------------- | -------------------------------------- | ----------------- |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/services/...` | For notifications |

### Adding Secrets

1. Click "New repository secret"
2. Name: (from table above)
3. Secret: (paste value)
4. Click "Add secret"
5. Repeat for each secret

---

## 🔔 Step 4: Set Up Slack Notifications (Optional)

### 4.1 Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. App name: "BoxCall Backups"
4. Pick workspace → Create

### 4.2 Enable Incoming Webhooks

1. Features → Incoming Webhooks
2. Activate Incoming Webhooks: **ON**
3. Click "Add New Webhook to Workspace"
4. Select channel (e.g., `#alerts`, `#devops`)
5. Allow
6. Copy the webhook URL
7. Add as `SLACK_WEBHOOK_URL` secret in GitHub

---

## 🧪 Step 5: Test the Workflow

### 5.1 Manual Trigger

1. Go to: `https://github.com/justindepierro/boxcall/actions/workflows/backup-database.yml`
2. Click "Run workflow" dropdown
3. Select branch: `main`
4. Click green "Run workflow" button
5. Wait ~2-5 minutes
6. Check run status

### 5.2 Verify Success

**Check GitHub Actions**:

```
✅ Checkout repository
✅ Setup Node.js
✅ Install dependencies
✅ Run database backup
✅ Get backup filename
✅ Verify backup integrity
✅ Upload to S3
✅ Sync to S3 bucket
✅ Send success notification
```

**Check S3**:

```bash
aws s3 ls s3://boxcall-backups/database/
```

Expected output:

```
2025-01-09 02:05:23    1234567 boxcall-backup-2025-01-09T02-05-20.json
```

**Check Slack** (if configured):
You should see a message like:

> ✅ **Database Backup Successful**  
> Backup: `boxcall-backup-2025-01-09T02-05-20.json`  
> Time: Jan 9, 2025 at 2:05 AM

### 5.3 Test Failure Handling

To test failure notifications:

1. Temporarily remove one of the secrets
2. Trigger workflow manually
3. Verify failure notification sent
4. Restore secret

---

## 📅 Step 6: Monitor First Automated Run

### Schedule

The workflow runs **daily at 2:00 AM UTC**:

- **PST**: 6:00 PM previous day (winter)
- **PDT**: 7:00 PM previous day (summer)
- **EST**: 9:00 PM previous day (winter)
- **EDT**: 10:00 PM previous day (summer)

### Monitoring

**First 7 Days**:

- Check GitHub Actions tab daily
- Verify S3 uploads
- Monitor Slack notifications
- Review backup file sizes

**After 7 Days**:

- Weekly spot checks
- Monthly review of S3 costs
- Quarterly test restore

---

## 🔍 Troubleshooting

### Issue: Workflow Fails at "Run database backup"

**Symptoms**:

```
Error: Missing required environment variables
Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

**Solution**:

1. Verify secrets are set in GitHub
2. Check secret names match exactly (case-sensitive)
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` not `SUPABASE_SERVICE_KEY`

### Issue: S3 Upload Fails

**Symptoms**:

```
error: Unable to locate credentials
```

**Solution**:

1. Verify AWS secrets are set
2. Check IAM policy is attached to user
3. Verify bucket name matches workflow
4. Confirm bucket exists in correct region

### Issue: Slack Notification Not Received

**Symptoms**:
No message in Slack after backup

**Solution**:

1. Check `SLACK_WEBHOOK_URL` secret is set
2. Test webhook manually:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test message"}' \
     YOUR_WEBHOOK_URL
   ```
3. Verify webhook is for correct channel
4. Check Slack app is not disabled

### Issue: Backup File Size is 0

**Symptoms**:

```
Backup created but verify fails: No data
```

**Solution**:

1. Check Supabase service role key has read permissions
2. Verify RLS policies allow service role
3. Test script locally:
   ```bash
   npm run backup
   npm run backup:verify backups/latest.json
   ```

---

## 📊 Monitoring & Maintenance

### Daily Checks (Automated)

- ✅ Workflow runs successfully
- ✅ Backup uploaded to S3
- ✅ Notification received

### Weekly Checks

- Review backup file sizes (should be consistent)
- Check S3 storage usage
- Verify old backups are deleted

### Monthly Tasks

- Test backup restore procedure
- Review AWS costs
- Update documentation if needed

### Quarterly Tasks

- Full disaster recovery test
- Review and update lifecycle policies
- Security audit of IAM permissions

---

## 💰 Cost Estimation

### AWS S3 Costs

**Assumptions**:

- Backup size: 50 MB (compressed)
- Daily backups: 30 per month
- Storage: 30-day retention

**Monthly Costs** (us-east-1):

- Storage: 1.5 GB × $0.023/GB = **$0.03**
- PUT requests: 30 × $0.005/1000 = **$0.0002**
- GET requests: ~10 × $0.0004/1000 = **$0.00004**

**Total: ~$0.03/month** (essentially free)

### GitHub Actions

- Free tier: 2,000 minutes/month
- Our workflow: ~5 minutes/day × 30 = 150 minutes/month
- Cost: **$0** (well within free tier)

### Slack

- Free tier: Unlimited webhooks
- Cost: **$0**

**Grand Total: ~$0.03/month**

---

## 🎯 Next Steps

### Immediate (After Setup)

- [ ] Create S3 bucket
- [ ] Configure IAM user and policy
- [ ] Add all GitHub secrets
- [ ] Test workflow manually
- [ ] Monitor first automated run

### Short Term (1-2 weeks)

- [ ] Document restore procedure
- [ ] Create runbook for common issues
- [ ] Set up additional monitoring (CloudWatch)
- [ ] Test backup restore

### Long Term (1-3 months)

- [ ] Implement backup rotation (keep weekly, monthly)
- [ ] Add backup encryption at rest
- [ ] Set up cross-region replication
- [ ] Automate restore testing

---

## 📚 Related Documentation

- [`DATABASE_BACKUP_STRATEGY.md`](./DATABASE_BACKUP_STRATEGY.md) - Overall backup strategy
- [`scripts/backup/README.md`](../scripts/backup/README.md) - Backup scripts usage
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS S3 Lifecycle Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)

---

**Last Updated**: January 9, 2025  
**Maintained By**: Development Team  
**Questions?**: Check troubleshooting section or team documentation
