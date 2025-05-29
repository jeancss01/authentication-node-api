export default {
  mongoUrl: process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017/authentication-node-api',
  port: process.env.PORT ? Number(process.env.PORT) : 5050,
  salt: process.env.SALT ? Number(process.env.SALT) : 12
}
