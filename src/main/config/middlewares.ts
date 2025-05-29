import type Express from 'express'
import { bodyParser } from '../middlewares/body-parser'

export default (app: Express.Application): void => {
  app.use(bodyParser)
}
