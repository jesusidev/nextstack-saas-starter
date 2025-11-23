# S3 Presigned PUT – End‑to‑End Flow (Diagrams)

**⚠️ UPDATED:** This document describes the S3 presigned URL mechanics. For the new secure implementation with authentication, authorization, and tracking, see [S3 Operations API Documentation](./api/s3-operations.md).

This doc visualizes the **minimal presigned upload flow** and highlights where a **403** can occur. This version fixes Mermaid parsing errors by quoting any labels that contain curly braces or parentheses.

---

## 1) High‑Level Sequence (Browser ↔ API ↔ S3)

```mermaid
sequenceDiagram
    autonumber
    participant U as Browser (Client)
    participant A as Next.js API (/api/s3/presign)
    participant S3 as Amazon S3 (Bucket)
    participant STS as AWS STS (Role/Creds)

    rect rgb(245,245,245)
    Note over A: Server has AWS credentials via default provider (env / role)
    end

    U->>A: POST /api/s3/presign { filename }
    A->>STS: (implicit) Get credentials via default provider chain
    A->>S3: Create presigned URL (PutObject) for key
    S3-->>A: Signed URL (includes region, expiry, signature)
    A-->>U: { key, uploadUrl }

    U->>S3: PUT file to uploadUrl (must match signed headers)
    alt PUT matches signature
        S3-->>U: 200 OK (ETag in response header)
    else signature mismatch / policy denies / CORS fail
        S3-->>U: 403 Forbidden (XML error explains reason)
    end
```

---

## 2) Request Path Flow (with Decision Points) — Fixed

```mermaid
flowchart TD
    A["Browser requests presign<br/>POST /api/s3/presign"] --> B["API builds PutObjectCommand<br/>no optional headers"]
    B --> C["S3 signs URL with<br/>X-Amz-* params"]
    C --> D["API returns {key, uploadUrl}"]
    D --> E["Browser PUT file to uploadUrl"]

    subgraph "Validation at S3"
      E --> F{"Do request headers match signed headers?"}
      F -- "No" --> F1["403 SignatureDoesNotMatch"]
      F -- "Yes" --> G{"Does bucket policy permit PutObject?"}
      G -- "No" --> G1["403 AccessDenied"]
      G -- "Yes" --> H{"CORS / Preflight OK?"}
      H -- "No" --> H1["403 from browser (preflight fails)"]
      H -- "Yes" --> I["200 OK<br/>ETag returned"]
    end
```

---

## 3) Quick Troubleshooting Map (403 → culprit)

| Symptom | Likely Cause | Fix |
|---|---|---|
| `403 SignatureDoesNotMatch` | Header mismatch (e.g., presign included `Content-Type` but PUT didn’t) | Make presign minimal; or **send exact same headers** in PUT |
| `403 AccessDenied` | Bucket policy denies `PutObject` (SSE required, VPC endpoint condition, wrong key prefix) | Satisfy conditions (e.g., sign & send SSE), or relax policy for presign principal |
| Browser shows CORS error | CORS missing `PUT` or `AllowedHeaders` | Add `PUT` and `AllowedHeaders=["*"]` (or explicit headers) |
| Works with curl, fails in browser | CORS/preflight issue | Same as above; avoid `no-cors` mode |
| Randomly fails later | URL expired or clock skew | Reduce time to test; ensure server clock synced (NTP) |
| Upload to CloudFront URL | Presigned S3 URL used against CF | Use the **S3** endpoint from presign, not CloudFront |

---

## 4) Diagram of Bucket Permissions (Modern “No‑ACL”)

```mermaid
flowchart LR
    subgraph S3["Bucket: nextstack-saas-starter-assets"]
      direction TB
      O["Object Ownership =<br/>BucketOwnerEnforced"]
      P["Bucket Policy:<br/>Allow GetObject (optional)<br/>No explicit Deny for PutObject<br/>If SSE required, document it"]
      C["CORS:<br/>PUT/GET allowed,<br/>AllowedHeaders:*"]
    end
    U["Browser"] -->|"Presigned PUT"| S3
    A["Next.js API"] -->|"Create Presign"| S3
```

---
