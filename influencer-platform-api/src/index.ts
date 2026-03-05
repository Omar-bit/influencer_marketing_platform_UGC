import 'module-alias/register';
import express, { Express, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from '@utils/logger';
import mongoose from 'mongoose';
import router from '@routes/router';
import {
  PORT,
  MONGO_URI,
  SECRET,
  FRONTEND_URL,
  BASE_URL,
} from '@utils/secrets';
import passport from 'passport';
import session from 'express-session';
import authMiddleware from '@middlewares/authMiddleware';
import path, { join } from 'path';
import initTokenRefreshJob from './cron/tokenRefresher';
import initMetricsUpdateJob from './cron/metricsUpdater';
import initContentMetricsUpdateJob from './cron/contentMetricsUpdater';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import initUpdateSubscriptionJob from './cron/subscriptionValidator';
const swaggerFile = require('./../swagger-output.json');

const passportSetup = require('@utils/passport');
const app: Express = express();
const httpServer = createServer(app);
console.log('FRONTEND_URL', FRONTEND_URL);
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    logger.info(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    logger.info(`User ${socket.id} left room: ${roomId}`);
  });

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 3000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8',
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Configure static files with proper CORS headers for model files
app.use(
  '/uploads',
  (req, res, next) => {
    // Set CORS headers specifically for the uploads directory
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // For GLB files, set appropriate content type
    if (req.path.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
    }

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(200).send();
      return;
    }

    next();
  },
  express.static(path.join(__dirname, '..', 'uploads'))
);

// app.set('trust proxy', 1);
app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      // secure: false,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(limiter);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow resources to be loaded from different origins
  })
);
app.use(
  morgan(
    ' [:date[clf]] :method :url :req[*] :status :res[content-length] :response-time ms'
  )
);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req: Request, res: Response) => {
  logger.info(`/  hit`);
  res.send('Influencer Platform server is running');
});

// Routes
app.use('/api', router);
app.get('/api/testProtected', authMiddleware, (req, res) => {
  res.json({
    message: 'This is a protected route',
    success: true,
    data: req.user,
  });
});
// init cron jobs
initTokenRefreshJob();
initMetricsUpdateJob();
initContentMetricsUpdateJob();
initUpdateSubscriptionJob();

// Connect to DB & Start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      logger.info(`[server]: Server is running at ${BASE_URL}`);
    });
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB', error);
  });

// to generate localhost.pem and localhost-key.pem use mkcert tool https://github.com/FiloSottile/mkcert
