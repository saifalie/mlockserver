import 'dotenv/config';
import session from 'express-session';
import connectMongo from 'connect-mongodb-session';


import { DB_URL } from '../../secrets.js';

const MongoDBStore = connectMongo(session);

// MongoDB session store configuration
export const sessionStore = new MongoDBStore({
    uri: DB_URL as string,
    collection: 'sessions'
});

sessionStore.on('error', (error) => {
    console.log('Session store error', error);
});

// Authentication function
export const authenticate = async (email: string, password: string) => {
    let user = null;

    if (email === 'saifalie14@gmail.com' && password === '1234') {
        return Promise.resolve({ email: email, password: password });
    } else {
        return null;
    }
};
