const session = require('express-session');
const MongoStore = require('connect-mongo').default;

function buildSessionMiddleware() {
  const isProd = process.env.NODE_ENV === 'production';

  return session({
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: process.env.MONGO_DB || 'fitlife',
      collectionName: 'sessions',
    }),

    cookie: {
      httpOnly: true,
      secure: isProd,     
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  });
}

module.exports = { buildSessionMiddleware };
