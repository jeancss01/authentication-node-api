import type { Request, Response, NextFunction } from 'express'

export const cors = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('access-Control-Allow-Origin', '*')
  res.setHeader('access-Control-Allow-Headers', '*')
  res.setHeader('access-Control-Allow-Methods', '*')
  next()
}
