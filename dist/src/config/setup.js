import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import * as Models from '../models/index.js';
import { dark, light, noSidebar } from '@adminjs/themes';
import { COOKIE_PASSWORD } from '../../secrets.js';
import session from 'express-session';
import connectMongo from 'connect-mongodb-session';
// Register the AdminJS adapter for Mongoose
AdminJS.registerAdapter(AdminJSMongoose);
// Create the AdminJS instance
export const admin = new AdminJS({
    resources: [
        { resource: Models.User },
        { resource: Models.Locker },
        { resource: Models.LockerStation },
        { resource: Models.Rating },
        { resource: Models.Review },
        { resource: Models.Payment },
        { resource: Models.Booking }
    ],
    branding: {
        companyName: 'MLock',
        withMadeWithLove: false
    },
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
    rootPath: '/admin'
});
// Define the session store
const MongoDBStore = connectMongo(session);
// Set up the session store with MongoDB
const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions'
});
sessionStore.on('error', function (error) {
    console.error('Session store error:', error);
});
// Create the Express router for AdminJS
export const buildAdminRouter = (app) => {
    // Use session middleware before setting up AdminJS
    app.use(session({
        secret: COOKIE_PASSWORD,
        resave: false,
        saveUninitialized: true,
        store: sessionStore
        // cookie: {
        //     httpOnly: process.env.NODE_ENV === 'production',
        //     secure: process.env.NODE_ENV === 'production'
        // }
    }));
    // Now, build the AdminJS router
    app.use(admin.options.rootPath, AdminJSExpress.buildRouter(admin));
};
//# sourceMappingURL=setup.js.map