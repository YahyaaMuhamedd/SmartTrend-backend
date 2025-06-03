//! Handle Uncaught Exceptions at Startup
process.on("uncaughtException", (error) => {
   console.error("Uncaught Exception:", error);
   process.exit(1);
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import env from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { dbConnection } from './DataBase/dbConnection.js';
import { initApp } from './src/initApp.js';
import configGoogle from './src/services/configGoogle.js';
import { loginWithGoogle } from './src/modules/authentication/auth.controller.js';
import { webhookMiddleWre } from './src/modules/order/order.controller.js';

//! Load .env variables
env.config();

const app = express();
const PORT = process.env.PORT || 5000;

//!================= MIDDLEWARE SECURITY SETUP ==================
// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Prevent request pollution (duplicate query params)
app.use(hpp());

// Limit request body size
app.use(express.json({ limit: '10kb' }));

// Sanitize input against NoSQL injection
app.use(mongoSanitize());

// Sanitize input against XSS attacks
app.use(xss());

// Rate Limiting (prevent brute-force attacks)
const limiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 100,
   message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use('/api', limiter);

//!================= GOOGLE AUTH ==================
app.use(configGoogle());
app.use(passport.initialize());
app.use(passport.session());

passport.use(
   new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
   }, (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
   })
);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Google login endpoints
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', {
   failureRedirect: '/'
}), loginWithGoogle);

//!================= STATIC FILES ==================
app.use("/", express.static("Uploads"));
app.use("/pdf", express.static("Docs"));

//!================= WEBHOOK ==================
app.post("/webhook", webhookMiddleWre);

//!================= ROUTES ==================
import userRoutes from './src/modules/user/user.routes.js';
import authRoutes from './src/modules/authentication/auth.routes.js';
import orderRoutes from './src/modules/order/order.routes.js';
import priceRoutes from './src/modules/Price/price.routes.js';
import cartRoutes from './src/modules/cart/cart.routes.js';

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/order", orderRoutes);
app.use("/price", priceRoutes);
app.use("/cart", cartRoutes);

//!================= DB INIT & SERVER START ==================
console.log("🚀 New version deployed!");
initApp(app);
dbConnection();

export const server = app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));

//!================= HANDLE REJECTION ==================
process.on("unhandledRejection", (error) => {
   console.error("Unhandled Rejection:", error);
   server.close(() => process.exit(1));
});

// Optionally enable socket.io
// import { socketConnect } from './src/services/socketConnection.js';
// socketConnect(server);
