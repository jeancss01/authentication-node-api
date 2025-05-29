import { Router } from 'express'
import type Express from 'express'
import fg from 'fast-glob'

export default (app: Express.Application): void => {
  const router = Router()
  app.use('/api', router)
  void (async () => {
    try {
      const files = fg.sync('**/src/main/routes/**routes.ts')
      await Promise.all(
        files.map(async file => {
          const route = await import(`../../../${file}`)
          return route.default(router)
        })
      )
    } catch (error) {
      console.error('Erro ao carregar rotas:', error)
    }
  })()
}
