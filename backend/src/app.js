import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './modules/auth/auth.routes.js';
import volunteerRoutes from './modules/volunteers/volunteer.routes.js';
import serviceRequestRoutes from './modules/service-requests/serviceRequest.routes.js';
import emergencyAlertRoutes from './modules/emergency-alerts/emergencyAlert.routes.js';
import supervisorRoutes from './modules/supervisors/supervisor.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiError } from './utils/ApiError.js';

const app = express();

// Security headers
app.use(helmet());

//Connecting React to backend
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

//Test
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'MehrGam API is running'
  });
});

//Forwarding route to its file
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/volunteers', volunteerRoutes);
app.use('/api/v1/service-requests', serviceRequestRoutes);
app.use('/api/v1/emergency-alerts', emergencyAlertRoutes);
app.use('/api/v1/supervisors', supervisorRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

app.use(errorHandler);

export default app;
