# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at SteamBite. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **Do NOT open a public GitHub issue** for security vulnerabilities
2. Send an email to [security contact - replace with your email]
3. Include detailed information about the vulnerability:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Initial Response**: Within 48 hours
- **Status Update**: Within 1 week
- **Resolution Timeline**: Depends on severity, typically within 30 days

### Scope

The following are in scope for security reports:

- Chrome extension code (content.js, popup.js)
- Data handling and storage
- Communication with external APIs
- Permission abuse potential

### Out of Scope

- Issues in third-party services we use (Frankfurter API, Steam)
- Social engineering attacks
- Physical attacks
- Issues requiring physical access to the user's device

## Security Practices

SteamBite follows these security practices:

### Data Handling
- We do NOT collect any personal data
- Settings are stored locally using Chrome's storage API
- No data is transmitted to our servers

### External API Usage
- Exchange rates from Frankfurter API (public, no auth required)
- Product data from our public CDN (no user data involved)

### Permissions
We request only the minimum required permissions:
- `storage`: For saving user preferences locally
- `activeTab`: For injecting badges on Steam pages
- Host permissions: For fetching exchange rates and product data

### Code Review
- All code changes are reviewed before merging
- We avoid using `innerHTML` with user-provided content
- We validate and sanitize all external data

## OWASP Top 10 Considerations

We specifically guard against:
- **Injection**: No dynamic code execution with user input
- **XSS**: Content Security Policy and careful DOM manipulation
- **Sensitive Data Exposure**: No sensitive data handled
- **Security Misconfiguration**: Minimal permissions requested

Thank you for helping keep SteamBite secure!
