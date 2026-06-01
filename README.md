# prowler — GCP Security Audit Automation

[![CI](https://github.com/rohioffl/prowler/actions/workflows/ci.yml/badge.svg)](https://github.com/rohioffl/prowler/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-GCP%20%7C%20Python%20%7C%20Slack-informational)](#tech-stack)

Automated security audit platform for Google Cloud Platform — scans multiple GCP projects, generates severity-based reports, sends Slack alerts, and provides AI-assisted remediation workflow suggestions with human validation.

## Table of Contents

- [What This Does](#what-this-does)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Usage](#usage)

## What This Does

Security teams managing multiple GCP projects face the challenge of continuously auditing configurations across environments. This tool automates:

1. **Audit** — Scans IAM, network, storage, and compute configurations across 20+ GCP projects
2. **Report** — Generates findings categorized by severity (CRITICAL/HIGH/MEDIUM/LOW)
3. **Alert** — Pushes Slack notifications for high/critical findings
4. **Remediate** — Provides AI-generated remediation suggestions with human approval gates

## Features

- Automated security audits across multiple GCP projects
- Severity-based findings: CRITICAL, HIGH, MEDIUM, LOW
- Slack alerting for high-priority findings
- AI-assisted remediation recommendations
- Human validation workflow before any automated action
- Scheduled/on-demand audit runs

## Architecture

```
GCP Projects (20+)
      |
      v
Audit Engine (Python)
      |-- IAM Policy Check
      |-- Network Config Check
      |-- Storage Bucket Check
      |-- Compute Config Check
      |
      v
Findings Processor
      |-- Severity Classification
      |-- Deduplication
      |
      v
Outputs:
  |-- Severity Report (JSON/CSV)
  |-- Slack Alert (HIGH/CRITICAL)
  |-- AI Remediation Suggestions
           |
           v
      Human Review & Validation
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Core audit engine | Python |
| GCP integration | google-cloud-* SDKs |
| Alerting | Slack API (webhook) |
| AI recommendations | LLM integration |
| Scheduling | Cloud Scheduler / cron |

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Configure GCP credentials
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

# Configure Slack webhook
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Configure target projects
export GCP_PROJECTS="project-1,project-2,project-3"
```

## Usage

```bash
# Run audit across all configured projects
python main.py --audit

# Run audit for specific project
python main.py --project my-gcp-project

# Generate report only (no Slack alerts)
python main.py --audit --no-slack --output report.json
```

---

**Author:** Rohit P T | Cloud Automation Engineer @ Ankercloud | [GCP ACE Certified](https://www.credential.net/b65b7bf829334eaea4301becf1ec9e41)
