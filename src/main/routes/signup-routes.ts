import type { Router } from 'express'

export default (router: Router): void => {
  router.post('/signup', async (req, res) => {
    res.json({ message: 'Signup route is working' })
  })
}
