import helmet from 'helmet';
import cors from 'cors';
import express from 'express';

const CORS_ORIGIN = process.env.WEB_URL || 'http://localhost:5173';

export const securityMiddleware = [
  // Security headers
  helmet(),
  
  // Strict CORS
  cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
  
  // Request body size limit
  express.json({ limit: '1mb' }),
  express.urlencoded({ extended: true, limit: '1mb' })
];
