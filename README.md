# 🌌 Collabryx: The Ultimate Real-Time Collaborative Coding OS

**A Hyper-Futuristic, Secure, and High-Performance Collaborative Development Environment.**

Collabryx is a next-generation web platform built for high-stakes collaborative coding. It blends a premium "Synapse" glassmorphic interface with a hardened, containerized execution engine to provide a professional, secure, and lightning-fast developer experience.

---

## 🏛️ System Architecture

![Architecture Diagram](image.png)

Collabryx is built on a distributed **Event-Driven MVC** architecture:

1.  **Client (React/Monaco)**: A dynamic, high-fidelity UI that captures and emits real-time events.
2.  **Server (Node/Express)**: A stateless API gateway managing authentication and workspace metadata.
3.  **Real-time synchronization (Socket.IO)**: A bi-directional, room-isolated communication layer.
4.  **Data Persistence (MongoDB)**: High-availability storage for workspace states and user identities.
5.  **Execution Layer (Docker)**: An isolated, resource-capped sandbox for running untrusted code.

---

## 🚀 Exhaustive Feature Matrix

| Feature | Implementation Process | Core Technologies |
| :--- | :--- | :--- |
| **Real-Time Code Sync** | Capture delta changes from Monaco Editor, broadcast via room-isolated WebSockets, and debounced MongoDB persistence. | Socket.IO, Monaco Editor, Mongoose |
| **Secure Containerized Execution** | Spawning ephemeral Docker containers using `child_process.spawn()` with strict resource capping and network isolation. | Docker, Node.js `spawn()` |
| **Language Synchronization** | Real-time propagation of syntax highlighting and runtime environment state changes across all collaborators. | Socket.IO, Monaco `language` API |
| **Atomic Snapshots** | Capture current workspace state into a versioned document for instant restoration and recovery. | MongoDB, Versioning Strategy |
| **Workspace Security** | Dynamic 6-character join codes with creator-level ownership transfer and membership verification. | AuthMiddleware, Bcrypt, JWT |
| **Synapse UI/UX** | A curated design system featuring glassmorphism, fluid micro-animations, and hyper-premium dark/light modes. | Tailwind CSS, Framer Motion |

---

## 📋 Comprehensive Technical Reference (Backend Logic)

This section provides a line-for-line logic trace for every backend function.

### 🔑 Authentication (`authController.ts`)

- **`signup(req, res)`**:
    - **How**: Extracts name, email, and password. It uses `bcrypt.hash` with **10 salt rounds** to cryptographically secure the password. After ensuring the email is unique in the `User` collection, it saves the record and issues a **HS256 signed JWT** containing the `userId`.
    - **Technology**: Bcrypt, JWT (jsonwebtoken library), Mongoose.
- **`login(req, res)`**:
    - **How**: Performs a lookup of the user by email. If found, it uses `bcrypt.compare()` to verify the plaintext input against the stored hash. Returns a new JWT on success.
    - **Security**: Includes protection against timing attacks via generic error messages.

### 🍱 Workspace Management (`workspaceController.ts`)

- **`createWorkspace(req, res)`**:
    - **How**: Generates a random **6-character alphanumeric join code** using `Math.random().toString(36).substring(2, 8)`. Creates a new document with the current user as the `createdBy` and first `member`.
- **`getWorkspace(req, res)`**:
    - **How**: Simple `findById` with error handling. Returns workspace metadata and current code to initialize the client state.
- **`joinWorkspace(req, res)`**:
    - **How**: Searches by `joinCode`. If the user is missing from the `members` array, it uses `$push` to add the user's ObjectId. This keeps a live list of the active team.
- **`getUserWorkspaces(req, res)`**:
    - **How**: Uses a `{ members: userId }` query to find all workspaces where the user has been granted access.
- **`deleteWorkspace(req, res)`**:
    - **How**: Verified via `createdBy` check. Deletes both the workspace and all associated snapshots.
- **`leaveWorkspace(req, res)`**:
    - **How**: If the user is the creator, logic requires a `newOwnerId` transfer to prevent "orphaned" workspaces. If it's the last person, the workspace is deleted.
- **`regenerateJoinCode(req, res)`**:
    - **How**: Issues a new unique 6-character code, effectively invalidating the previous invitation link/code.

### ⚡ Secure Execution Engine (`executorController.ts`)

- **`executeCode(req, res)`**:
    - **The Process**:
        1.  Validates the language and code.
        2.  Calculates the Docker command based on the language (Python, JS, Java, C++).
        3.  Spawns a Docker container using a unique list of **High-Security Flags**:
            -   `--memory=64m`: Hard RAM limit. Terminated by OOM if exceeded.
            -   `--cpus=0.5`: Throttles CPU usage to avoid server-level denial of service.
            -   `--network=none`: Disables all internet access. Blocks malware exfiltration.
            -   `--pids-limit=64`: Stops fork-bombs and runaway process threads.
            -   `--rm`: Ensures zero-trace disk usage by destroying the filesystem on exit.
        4.  Pipes user-provided `input` (from the UI) into `child.stdin`.
        5.  Sets a **10-second hard kill timeout** to clear hung containers.
    - **Technology**: Docker, Node.js `child_process`, `sh -c` for command chaining.

### 🔌 Real-Time Event Sync (`server.ts`)

- **`join-workspace` Event**:
    - **How**: Associates the socket ID with a project-specific room.
- **`code-change` Event**:
    - **How**: Broadcasts the new code string to all peers using `socket.to(room).emit()`. Simultaneously updates MongoDB for persistence.
- **`language-change` Event**:
    - **How**: Propagates the new syntax highlighting mode to all users and updates the workspace's primary language state in the database.

---

## 🕒 Snapshot System (`snapshotController.ts`)

- **`saveSnapshot`**:
    - **Process**: Performs a `workspace.members` membership check before capturing the current `code` and assigning it a unique name in the `Snapshot` collection.
- **`restoreSnapshot`**:
    - **Process**: Fetches the old code from the snapshot and performs a bulk update on the `Workspace` model. It returns the restored code to the client to refresh the Monaco instance.

---

## 🛡️ Security Hardening Overview

Collabryx follows a **"Zero-Trust Architecture"**:
- **Stateless Authentication**: JWTs are used for all REST requests, ensuring no session storage is required on the server.
- **CORS Restricted**: Backend restricts origins to prevent cross-site scripting/request attacks.
- **Isolated Runtimes**: Docker provides a hardware-level sandbox for every execution request.
- **Input Sanitization**: Strictly uses environment variables (`CODE=$CODE`) to pass user code into containers, avoiding shell injection risks.

---

## ⚙️ Installation & Setup (Full Procedure)

### Hardware/Software Prerequisites
*   **Operating System**: Linux (Ubuntu 20.04+ recommended) or macOS.
*   **Node.js**: v18.0 or higher.
*   **MongoDB**: Local installation or MongoDB Atlas cluster.
*   **Docker**: Docker Desktop or Docker Engine (must be running in the background).

### 1. Repository Setup
```bash
git clone https://github.com/your-username/collabryx.git
cd collabryx
```

### 2. Environment Configuration
Create a `.env` file in `/backend` with the following:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/collabryx
JWT_SECRET=your_super_secret_high_entropy_key
PORT=5000
```

### 3. Backend Deployment
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend Deployment
```bash
cd ../frontend
npm install
npm run dev
```

### 5. Running Code Execution
The system will automatically pull the following images on the first "Run Code" click. Ensure you have internet access for the initial pull:
*   `python:3-alpine`
*   `node:18-alpine`
*   `frolvlad/alpine-gxx` (C++)
*   `eclipse-temurin:17-jdk-alpine` (Java)

---

## 🤝 Usage & Workflow
1.  **Signup/Login**: Create a secure account.
2.  **Dashboard**: Create a new workspace or join one using a 6-digit code.
3.  **Code**: Start typing; changes sync live to your team.
4.  **Run**: Click run code to execute in our secure sandbox.
5.  **Snapshot**: Periodically save snapshots to version your progress.
