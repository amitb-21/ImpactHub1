import express from 'express';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'impacthub-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

export default app;
