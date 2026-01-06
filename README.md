## VerifiChain
<img width="800" height="800" alt="logo - Copy" src="https://github.com/user-attachments/assets/8b77bddb-face-4ed3-b955-af829178e16b" />

VerifiChain is a full‑stack dApp for **issuing and verifying academic credentials** using **Ethereum smart contracts**, **IPFS**, and a **MongoDB/Node.js/React** stack.  
Universities (or other issuers) can create tamper‑evident credentials, and anyone with the credential ID or QR code can verify them on‑chain.

---

## Features

- **Secure credential issuance**
  - Admin / issuer authentication with JWT
  - Credential metadata stored in MongoDB
  - On‑chain proof stored in the `CredentialRegistry` smart contract
- **Tamper‑proof verification**
  - Public verification page that checks the credential status directly on the blockchain
  - Shows issuer, degree, major, issue date, and IPFS hash
- **IPFS document storage (optional)**
  - Credential documents can be uploaded to IPFS
  - Safe fallback mode with deterministic mock hashes when IPFS is unavailable
- **QR code flow**
  - Issued credentials include a QR code pointing to the verification URL
- **Docker‑ready**
  - `docker-compose.yml` to spin up backend, frontend, MongoDB and Ganache
- **Windows‑friendly**
  - Dedicated troubleshooting guide for common Truffle / Ganache issues on Windows

---

## High‑Level Architecture

VerifiChain is organized into three main layers: **Frontend (React)**, **Backend API (Node/Express)**, and **Blockchain + Storage (Ethereum + IPFS + MongoDB)**.

### 


Logical Architecture

### Logic Flow

![logic-flow](https://github.com/user-attachments/assets/f1832820-16da-4c5f-9265-7ceb1e3de360)

---

- **Issuing a credential**
  1. Admin logs in on the React frontend and receives a JWT.
  2. Admin fills the "Issue Credential" form (`IssueCredential` page).
  3. Frontend calls `POST /api/credentials/issue` with the form data and JWT.
  4. Backend:
     - Optionally pushes the document/metadata to IPFS via `ipfs.js` and gets an IPFS hash.
     - Calls `issueCredentialOnChain` in `blockchain.js`, which:
       - Uses Web3 to send a signed transaction to the `CredentialRegistry` contract.
       - Ensures the issuer is authorized and has enough gas.
       - Extracts `credentialId`, `transactionHash`, and `blockNumber` from the receipt.
     - Persists credential details plus chain metadata in MongoDB.
     - Generates a QR code pointing to the verification URL (`FRONTEND_URL/verify/:credentialId`).
  5. Frontend shows success details and QR code.

- **Verifying a credential**
  1. A user opens the Verify page (`/verify/:id?`) either manually or via QR code.
  2. Frontend calls `GET /api/verify/:credentialId`.
  3. Backend:
     - Looks up the credential in MongoDB.
     - Calls `verifyCredentialOnChain(credentialId)` from `blockchain.js` to fetch on‑chain state.
     - Optionally fetches document/metadata from IPFS via `ipfs.js`.
     - Returns a combined result: credential details, blockchain info, and validity flag.
  4. Frontend displays whether the credential is **valid**, **invalid**, or **revoked**.

---

## Project Structure

```text
VerifiChain/
├── backend/
│   ├── controllers/        # Route handlers (business logic)
│   ├── middleware/
│   │   └── auth.js         # JWT auth middleware
│   ├── models/
│   │   ├── User.js         # Admin / user model
│   │   └── Credential.js   # Credential persistence model
│   ├── routes/
│   │   ├── auth.js         # /api/auth/*
│   │   ├── credentials.js  # /api/credentials/*
│   │   └── verify.js       # /api/verify/*
│   ├── services/
│   │   ├── blockchain.js   # Web3 integration with CredentialRegistry
│   │   └── ipfs.js         # IPFS client + graceful fallbacks
│   ├── scripts/
│   │   ├── deploy-contract.js # Deploy CredentialRegistry
│   │   └── check-contract.js  # Validate contract address & issuer
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── server.js           # Express app & MongoDB bootstrap
│
├── blockchain/
│   ├── contracts/
│   │   └── CredentialRegistry.sol  # Smart contract
│   ├── migrations/
│   │   └── 2_deploy_contracts.js   # Truffle migration
│   ├── test/
│   │   └── credential.test.js      # Contract tests
│   └── truffle-config.js
│
├── frontend/
│   ├── public/             # Static assets, HTML shell
│   ├── src/
│   │   ├── app.js          # React Router & protected routes
│   │   ├── app.css
│   │   ├── pages/
│   │   │   ├── Login.js / Login.css
│   │   │   ├── Dashboard.js / Dashboard.css
│   │   │   ├── IssueCredential.js / IssueCredential.css
│   │   │   └── VerifyCredential.js / VerifyCredential.css
│   │   ├── services/
│   │   │   └── api.js      # Axios client for backend API
│   │   └── components/     # Reusable UI components
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Full stack (backend, frontend, MongoDB, Ganache)
├── SETUP_GUIDE.md          # Detailed environment & deployment instructions
├── TROUBLESHOOTING.md      # Windows / Truffle / Ganache issues
└── package.json            # Root scripts / tooling
```

---

## Tech Stack

- **Frontend**
  - React (SPA) + React Router
  - Tailwind / custom CSS
  - Axios‑based API client
- **Backend**
  - Node.js + Express
  - MongoDB + Mongoose
  - JWT‑based authentication
  - Web3‑based Ethereum integration
  - IPFS HTTP client with graceful fallbacks
- **Blockchain**
  - Solidity `^0.8.0`
  - Truffle for compilation/migrations/tests
  - Ganache for local development, or any EVM network
- **Infra / Tooling**
  - Docker & Docker Compose
  - dotenv for configuration

---

## Getting Started (Local)

> For **step‑by‑step environment setup, including Docker and blockchain deployment**, see `SETUP_GUIDE.md`.  
> Below is a minimal quick‑start.

### 1. Prerequisites

- Node.js v14+ (v18 LTS recommended)
- MongoDB (local or Atlas)
- (Optional) Ganache or another Ethereum RPC endpoint
- Git

### 2. Environment Variables

Create a `.env` file at the **project root** (or follow the template in `SETUP_GUIDE.md`):

```env
PORT=5000

MONGODB_URI=mongodb://localhost:27017/verifichain
JWT_SECRET=your-super-secret-jwt-key

BLOCKCHAIN_URL=http://localhost:7545
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

ADMIN_WALLET_ADDRESS=0x0000000000000000000000000000000000000000
ADMIN_PRIVATE_KEY=your-admin-wallet-private-key-without-0x-prefix

FRONTEND_URL=http://localhost:3000

# Optional IPFS config
# IPFS_GATEWAY_URL=https://ipfs.infura.io:5001
# IPFS_DISABLED=true
```

> **Important**:  
> - The backend **will refuse to start** if `MONGODB_URI` or `JWT_SECRET` is missing.  
> - For blockchain functionality, you must deploy `CredentialRegistry` and set a valid `CONTRACT_ADDRESS`, `ADMIN_WALLET_ADDRESS`, and `ADMIN_PRIVATE_KEY`.

### 3. Install Dependencies

```bash
# From project root
npm install

cd frontend
npm install
cd ..
```

### 4. Run Backend

```bash
npm run dev      # or: npm start
```

Backend API will be available at `http://localhost:5000`.

### 5. Run Frontend

```bash
cd frontend
npm start
```

Frontend will be available at `http://localhost:3000`.

---

## Running with Docker

The repository includes a `docker-compose.yml` that can start:

- Backend API (`backend`)
- Frontend build served via Nginx (`frontend`)
- MongoDB (`mongo`)
- Ganache (local Ethereum node) (`ganache`)

```bash
docker compose up --build
```

Then open `http://localhost:3000` in your browser.

> Before using blockchain features in Docker, follow `SETUP_GUIDE.md` to:
> - Deploy `CredentialRegistry` (either automatically via `DEPLOY_CONTRACT=true` or manually via `deploy-contract.js`).
> - Update `CONTRACT_ADDRESS`, `ADMIN_WALLET_ADDRESS`, and `ADMIN_PRIVATE_KEY` in `docker-compose.yml`.

---

## Smart Contract Overview

`CredentialRegistry.sol` (Solidity `^0.8.0`) manages the on‑chain lifecycle of credentials:

- **State**
  - `mapping(bytes32 => Credential) credentials`
  - `mapping(address => bool) authorizedIssuers`
  - `address public admin`
- **Credential struct**
  - `studentId`, `studentName`, `degree`, `major`
  - `issueDate`
  - `ipfsHash`
  - `isRevoked`
  - `issuer`
- **Key functions**
  - `authorizeIssuer(address _issuer)` — Admin‑only; grants issuing rights.
  - `issueCredential(...) returns (bytes32)` — Authorized issuers create a credential; returns `credentialId`.
  - `verifyCredential(bytes32 _credentialId)` — View function returning student/degree/major/issueDate and validity (`!isRevoked`).
  - `revokeCredential(bytes32 _credentialId)` — Authorized issuers can revoke.
- **Events**
  - `CredentialIssued(bytes32 indexed credentialId, string studentId)`
  - `CredentialRevoked(bytes32 indexed credentialId)`
  - `IssuerAuthorized(address indexed issuer)`

---

## Backend API (Summary)

> For full details and payloads, see `SETUP_GUIDE.md` (API Endpoints section).

- **Authentication**
  - `POST /api/auth/register` — Register a new admin user.
  - `POST /api/auth/login` — Admin login (returns JWT + user info).
  - `POST /api/auth/student/login` — Student login (if enabled).

- **Credentials**
  - `POST /api/credentials/issue` — Issue a new credential (auth required).
  - `GET /api/credentials/list` — List all issued credentials (auth required).
  - `GET /api/credentials/:id` — Fetch a single credential.
  - `PATCH /api/credentials/:id/status` — Update credential status (auth required).

- **Verification**
  - `GET /api/verify/:credentialId` — Verify a credential (public).

---

## Frontend Pages

- **Login**
  - Authenticates admin user and stores JWT + user in `localStorage`.
- **Dashboard**
  - Fetches credentials via `credentialAPI.getAll()`.
  - Shows issued credentials and QR codes; links to verification.
- **Issue Credential**
  - Form for `studentId`, `studentName`, `degree`, `major`.
  - Calls `credentialAPI.issue()` and displays on‑chain details + QR.
- **Verify Credential**
  - Accepts credential ID (from user input or route param).
  - Calls `verifyAPI.verify()` and shows validity, blockchain, and IPFS info.

---

## Troubleshooting

- Read `TROUBLESHOOTING.md` for:
  - Windows‑specific Truffle/Ganache issues
  - ABI verification notes
  - “Transaction succeeds but no events emitted” debugging steps
  - Recommended versions of Node.js, Truffle, and Ganache

Common checks:

- Ensure `.env` exists and required variables are set.
- Confirm MongoDB is running and reachable.
- Verify `BLOCKCHAIN_URL` and `CONTRACT_ADDRESS` match a deployed `CredentialRegistry` instance.
- Check that the admin wallet is authorized in the contract and has enough ETH for gas.

---

## Future Improvements / Ideas

- Role‑based access control for multiple universities.
- Richer IPFS document schema with signed PDFs.
- Multi‑network support (e.g., Polygon, L2s).
- Audit‑grade contract security review and formal verification.
---

## MVP Build

https://github.com/user-attachments/assets/d6dff106-3244-4b8a-84b8-bb9cd8574632

