import { MongoHelper } from '../infra/db/mongodb/helpers/mongo-helpers'
import env from './config/env'

MongoHelper.connect(env.mongoUrl)
  .then(async () => {
    const app = (await import('./config/app')).default
    app.listen(env.port, () => { console.log(`Server is running on port ${env.port}`) })
  }).catch((error) => {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1) // Exit the process with a failure code
  })
