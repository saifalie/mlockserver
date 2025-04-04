import express, { Request, Response, Express, NextFunction } from 'express';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import { handleSocketConnection } from './sockets/socket.js';
import { errorMiddleware } from './middlewares/errors.js';
import { connectDB } from './config/connect.js';
import { notFoundMiddleware } from './middlewares/not-found.js';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from './utils/apiResponse.js';
import { buildAdminRouter } from './config/setup.js';
import { Locker } from './models/locker.model.js';
import rootRouter from './routes/index.routes.js';
import helmet from 'helmet';
import cors from 'cors';
import { initializeCronJobs } from './jobs/index.js';
import { ledRouter } from './websocket/led.routes.js';
import { ESPWebSocketClient } from './websocket/espClient.js';
import { RelayMQTTClient } from './mqtt/mqttClients.js';

dotenv.config();

// Initialize express app
const app: Express = express();
// app.enable('trust proxy');
app.use(express.json());
// app.use(helmet());

app.use(cors({
    origin:['http://localhost:7000', 'http://192.168.10.109:7000', 'http://49.43.5.123:7000'],
    credentials: true
}))

// server instance
const server = http.createServer(app);

// io instance (WebSocket)
const corsOrigin = process.env.NODE_ENV === 'production' ? process.env.CORS : 'http://localhost:3000';

const io = new Server(server, {
    cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
        // credentials:true
    }
});


// Attach the websocket instance to the request object
app.use((req: Request, res: Response, next: NextFunction) => {
    req.io = io;
    return next();
});

// Initialize the websocket handling logic
handleSocketConnection(io);

// Use the admin router
buildAdminRouter(app);

// routes
app.use('/api', rootRouter);

const  espAddress = process.env.ESP_WEBSOCKET_ADDRESS || '';
// const espClient = new ESPWebSocketClient(espAddress)
//ws esp
// app.use('/esp',ledRouter(espClient))

// MQTT initialize

const mqttClient = new RelayMQTTClient({
    maxReconnectAttempts: 5,
    reconnectTimeout: 3000
});

// initializeMQTT();


// Middlewares
app.use(errorMiddleware);
app.use(notFoundMiddleware);

// Start the server and connect to MongoDB
const startServer = async () => {
    try {
        await connectDB();
        const port = Number(process.env.PORT) || 3000; 

          // Initialize cron jobs after DB connection
          initializeCronJobs();

        server.listen(
            {
                port: port,
                host: '0.0.0.0'
            },
            () => {
                console.log(`Server running on port ${port}`);
            }
        );
    } catch (error) {
        console.error('Server initialization error:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

startServer();
