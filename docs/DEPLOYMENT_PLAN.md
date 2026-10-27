# StaffSync — Production Cloud Deployment Architecture & Plan

**Target Architecture:** Decoupled Cloud Deployment (PaaS / Static Hosting)  
**Database:** MongoDB Atlas (Cloud Managed)  
**Backend:** Node.js Web Service (Render / Railway)  
**Frontend:** React Static Web App (Vercel / Netlify)  
**Version:** 1.0.0 (Phase 1 Specification)  

---

## 1. Cloud Architecture Overview

StaffSync is architected to be deployed in a decoupled, cost-effective cloud topology:

```mermaid
flowchart LR
    subgraph Users ["Internet Users"]
        Browser["End User Browser<br/>(Desktop / Mobile)"]
    end

    subgraph CDN ["Frontend Edge Hosting (Vercel / Netlify)"]
        SPA["React 18 SPA Build<br/>(HTML, Minified JS, CSS, Assets)<br/>HTTPS: https://staffsync.vercel.app"]
    end

    subgraph PaaS ["Backend Application PaaS (Render / Railway)"]
        API["Node.js / Express Web Service<br/>HTTPS: https://staffsync-api.onrender.com<br/>(/api/v1/*, Health Checks)"]
    end

    subgraph DatabaseCloud ["Database Cloud (MongoDB Atlas)"]
        Atlas["MongoDB Atlas M0 / Serverless<br/>TLS Encrypted Connection<br/>SCRAM-SHA-256 Auth"]
    end

    Browser -->|1. Loads SPA Assets (HTTPS)| SPA
    Browser -->|2. REST API Requests (CORS + Cookies)| API
    API -->|3. Mongoose TLS Query Pool| Atlas
```

---

## 2. Platform Evaluation & Recommendations

| Layer | Platform Recommended | Alternative Option | Rationale for Recommendation |
| :--- | :--- | :--- | :--- |
| **Database** | **MongoDB Atlas** | Self-hosted MongoDB | Fully managed DBaaS, automated daily backups, web-based query performance metrics, free M0 sandbox cluster. |
| **Backend API** | **Render (Web Service)** | Railway / Fly.io | Native Node.js support, automatic Git commit deploys, zero-config environment variables, built-in SSL. |
| **Frontend UI** | **Vercel** | Netlify / Render Static | Optimized for React/Vite SPAs, global edge CDN distribution, fast build times, automatic preview deployments. |

> [!IMPORTANT]
> **Free-Tier Limits & Pricing Notice:** Hosting providers frequently adjust their free-tier policies, inactivity sleep windows, and execution limits. At the time of deployment (Phase 15), current limits and pricing tiers must be verified. Render free web services, for example, may spin down after 15 minutes of inactivity, resulting in a 30–50 second "cold start" delay upon the initial request.

---

## 3. Configuration & Environment Variables

### 3.1 Backend Service Environment Variables (Render / Railway)
The following variables must be configured in the cloud provider's environment settings dashboard:

* `NODE_ENV`: Set strictly to `production`.
* `PORT`: Set automatically by provider (usually `10000` on Render) or defaulted to `5000`.
* `MONGO_URI`: The MongoDB Atlas connection string with embedded username and password.
* `JWT_SECRET`: A cryptographically random, 64-character secret key generated for production.
* `JWT_EXPIRES_IN`: Session token duration (e.g., `8h`).
* `CLIENT_URL`: The production URL of the frontend (e.g., `https://staffsync.vercel.app`), required for strict CORS origin whitelisting.

### 3.2 Frontend Application Environment Variables (Vercel)
* `VITE_API_URL`: The absolute HTTPS URL of the live backend API (e.g., `https://staffsync-api.onrender.com/api/v1`).

---

## 4. Cross-Origin Resource Sharing (CORS) & Cookie Alignment

In a decoupled deployment, the frontend (`https://staffsync.vercel.app`) and backend (`https://staffsync-api.onrender.com`) operate on different top-level domains. To enable secure authentication cookies across domains:
1. **Cookie Attributes in Production:**
   * `httpOnly: true` (Protects against JavaScript access).
   * `secure: true` (Mandatory: browsers will discard cross-origin cookies unless sent over HTTPS).
   * `sameSite: 'none'` (Permits cookie transmission in cross-site contexts over secure HTTPS connections).
2. **CORS Options:**
   * `credentials: true` must be enabled on both Express CORS middleware and Axios client config (`withCredentials: true`).
   * `origin: process.env.CLIENT_URL` explicitly whitelists the Vercel frontend domain.

---

## 5. Build, Health Check & Deployment Verification

### 5.1 Build & Start Commands
* **Backend Build Command:** `npm install --omit=dev`
* **Backend Start Command:** `node src/server.js`
* **Frontend Build Command:** `npm install && npm run build`
* **Frontend Output Directory:** `dist`

### 5.2 Deployment Health Check & Smoke Test
Upon deployment, automated and manual verification must be executed:
1. **Health Endpoint Inspection:**
   ```bash
   curl -I https://staffsync-api.onrender.com/api/v1/health
   ```
   * Must return `HTTP/1.1 200 OK` with JSON body `{"status": "healthy", "database": {"status": "connected"}}`.
2. **Frontend Asset Integrity:**
   * Open `https://staffsync.vercel.app` in an incognito browser window.
   * Verify HTTP 200 on all `.js` and `.css` asset bundles.
   * Verify absence of Mixed Content warnings (all requests must be HTTPS).
3. **End-to-End User Authentication:**
   * Log in using seeded demo credentials.
   * Inspect browser DevTools Application tab to verify `token` cookie was set with `Secure` and `HttpOnly` flags.
   * Punch in on the Employee Dashboard to confirm database read/write persistence.

---

## 6. Logging, Monitoring & Maintenance

1. **Application Logs:** Available directly within the Render / Railway streaming log console. The centralized error middleware ensures errors log timestamped stack traces to stdout while returning clean messages to the user.
2. **Database Metrics:** MongoDB Atlas Metrics dashboard monitors connection pool utilization, read/write IOPS, and document storage.
3. **Disaster Recovery:** Daily automated snapshot backups configured in MongoDB Atlas allow one-click point-in-time recovery if required.

