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

## Map endpoints

All map endpoints need this header:

```txt
Authorization: Bearer ACCESS_TOKEN
```

```txt
POST /api/v1/maps/distance-estimate
```

This endpoint is for `disabled` and `supervisor` users. It receives origin and destination coordinates, calls Neshan Distance Matrix from the backend, and returns approximate driving distance and duration.

Example request body:

```json
{
  "origin": {
    "lat": 35.70055649823277,
    "lng": 51.37851198900432
  },
  "destination": {
    "lat": 35.70081002764168,
    "lng": 51.389169318887724
  },
  "type": "car"
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "estimate": {
      "provider": "neshan",
      "type": "car",
      "distance": {
        "value": 1641,
        "text": "۲ کیلومتر"
      },
      "duration": {
        "value": 550,
        "text": "۹ دقیقه",
        "minutes": 10
      }
    }
  }
}
```

## Matching radius

Approved volunteers only see pending service requests that:

```txt
1. match their active availability time
2. are inside MAX_VOLUNTEER_MATCH_DISTANCE_METERS from their current location to the request origin
```

The same radius is checked again when a volunteer accepts a request, so a volunteer cannot accept a far request manually by request id.

Default radius is `10000` meters if `MAX_VOLUNTEER_MATCH_DISTANCE_METERS` is not set.

## Required environment variables

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/mehrgam
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=change_this_to_a_long_random_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_DAYS=7
NESHAN_SERVICE_API_KEY=service.your_neshan_service_api_key
MAX_VOLUNTEER_MATCH_DISTANCE_METERS=10000
```

## Neshan map/search endpoints

The frontend location picker uses these backend proxy endpoints so the Neshan service API key stays on the server:

```txt
GET /api/v1/maps/search?term=تهران&lat=35.6892&lng=51.389
GET /api/v1/maps/reverse?lat=35.6892&lng=51.389
POST /api/v1/maps/distance-estimate
```

Required backend key:

```env
NESHAN_SERVICE_API_KEY=service.your_neshan_service_api_key
```

Use a Neshan service API key for Search, Reverse Geocoding and Distance Matrix. Do not put this key in the React code.
