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
PATCH /api/v1/volunteers/me/availability/:availId/activate
PATCH /api/v1/volunteers/me/availability/:availId/deactivate
DELETE /api/v1/volunteers/me/availability/:availId
```

## Service request endpoints

All service request endpoints need this header:

```txt
Authorization: Bearer ACCESS_TOKEN
```

```txt
POST /api/v1/service-requests
GET  /api/v1/service-requests/my
GET  /api/v1/service-requests/available
POST  /api/v1/service-requests/:requestId/accept
PATCH /api/v1/service-requests/:requestId/finish
PATCH /api/v1/service-requests/:requestId/cancel
```

### Notes

- `POST /api/v1/service-requests` is for `disabled` and `supervisor` users.
- If the requester is `disabled`, `disId` is taken from the access token.
- If the requester is `supervisor`, `disId` must be sent in the body and must belong to that supervisor.
- `GET /api/v1/service-requests/available` is for approved, online volunteers with fresh current location and matching availability.
- Distance and duration are currently estimated with a simple Haversine calculation. Google Routes API can replace this later.


## Emergency alert endpoints

All emergency alert endpoints need this header:

```txt
Authorization: Bearer ACCESS_TOKEN
```

```txt
POST  /api/v1/emergency-alerts
GET   /api/v1/emergency-alerts/my
PATCH /api/v1/emergency-alerts/:alertId/resolve
PATCH /api/v1/emergency-alerts/:alertId/cancel
```

### Notes

- Emergency alerts are for `disabled` and `supervisor` users.
- If the requester is `disabled`, `disId` is taken from the access token.
- If the disabled user has a supervisor, `sup_id` is saved automatically so the supervisor can see the alert.
- If the requester is `supervisor`, `disId` must be sent in the body and must belong to that supervisor.
- In this MVP, creating an emergency alert stores it with `alertStatus = sent`. Real police/ambulance integration can be added later.
