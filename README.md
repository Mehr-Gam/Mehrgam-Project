# MehrGam Backend

Express.js backend for the MehrGam project.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Then test:

```txt
GET http://localhost:5000/api/v1/health
```

## Auth endpoints

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Volunteer endpoints

All volunteer endpoints need this header:

```txt
Authorization: Bearer ACCESS_TOKEN
```

```txt
GET   /api/v1/volunteers/me
PATCH /api/v1/volunteers/me/location
PATCH /api/v1/volunteers/me/online
PATCH /api/v1/volunteers/me/offline
POST  /api/v1/volunteers/me/availability
GET   /api/v1/volunteers/me/availability
PATCH /api/v1/volunteers/me/availability/:availId/deactivate
```
