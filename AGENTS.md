# AGENT & REPO INSTRUCTIONS

## 🔒 Source of Truth & Database Protection
- The primary method of modifying orders is through the active web app interface running on `http://localhost:3000`.
- The live database file is `/data/database.json`, managed by `server.ts` Express API routes (`/api/orders`, `/api/orders/sync`, `/api/orders/backup/restore`).
- **CRITICAL**: Do NOT overwrite `/data/database.json` with synthetic placeholder orders or delete user-generated records. All user edits made through the browser or desktop app are persisted to this database file automatically.
