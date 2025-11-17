# 📦 Dockerize API

This is the backend API for the **SERVER** project, built with **Node.js**, **Bun**, **TypeScript**, and **Prisma**, containerized using **Docker**.

---

## 🚀 Features

- ✨ Bun-powered fast build
- ⚙️ Prisma + MongoDB integration
- 🛡 Environment-based configuration using `.env`
- 🐳 Docker + Docker Compose support
- 📦 Easily portable & deployable backend

---

## 📁 Folder Structure

```
.
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── prisma/
├── src/
│   └── index.ts
├── dist/
└── ...
```

---

## ⚙️ Environment Setup

Copy the `.env.example` file and fill in your own secrets:

```bash
cp .env.example .env
```

> Make sure MongoDB credentials and Cloudinary/SMTP keys are correctly set.

---

## 🐳 Run the App with Docker

### 1️⃣ Build the Docker image

```bash
docker-compose build
```

### 2️⃣ Run the container

```bash
docker-compose up
```

The API will now be available at:  
👉 [http://localhost:7548](http://localhost:7548)

---

## 👨‍💼 Developer Guide (without Docker)

> If you don’t want Docker, install dependencies manually:

```bash
bun install
bun run build
bun run dist/index.js
```

---

## ✅ Project Commands (inside container)

- `bun install` – install dependencies
- `bun run build` – build TypeScript project
- `bun run dist/index.js` – start app

---

## 🔐 Secrets (.env)

All runtime config is loaded from `.env` via [envalid](https://github.com/af/envalid).  
Make sure to keep your real `.env` **out of Git**.

Sample `.env.example`:

```
PORT=7548
DATABASE_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/mydb
JWT_ACCESS_TOKEN=youraccesstokensecret
JWT_REFRESH_TOKEN=yourrefreshtokensecret
SMTP_HOST=smtp.mailtrap.io
SMTP_USER=username
SMTP_PASS=password
TRANSPORT_EMAIL=you@example.com
```

---

## 📦 Docker Image Push (Optional)

To share your Docker image via [Docker Hub](https://hub.docker.com):

### 1. Tag your image

```bash
docker tag chance-collective-app yourdockerhubusername/chance-collective:latest
```

### 2. Login to Docker Hub

```bash
docker login
```

### 3. Push the image

```bash
docker push yourdockerhubusername/chance-collective:latest
```

### 4. Pull from any server (like VPS)

```bash
docker pull yourdockerhubusername/chance-collective:latest
docker run -p 7548:7548 yourdockerhubusername/chance-collective:latest
```

---

## 👥 Team Collaboration

If another developer joins:

```bash
git clone <repo-url>
cp .env.example .env # then fill in secrets
docker-compose up --build
```

No need to install Bun, Node, or even dependencies. Docker takes care of all of it ✅

---

## 🧐 Troubleshooting

- ❌ App exits? Check logs: `docker logs -f chance-collective`
- ❌ Port not working? Make sure 7548 is exposed in Dockerfile and mapped in `docker-compose.yml`
- ❌ Prisma not generating? Ensure `prisma generate` is included in Docker build

---

## ⚡ Runs via Bun (Not NPM)

This project uses **Bun** instead of NPM/Yarn:

- Bun is a fast all-in-one JavaScript runtime that replaces `npm`, `node`, and `tsc`

> Make sure your team installs Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

Then all you need is:

```bash
bun install
bun run build
bun run dist/index.js
```

You don't need to run `npm i`, `tsc`, or `node` separately.

---
