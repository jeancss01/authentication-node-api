import { type Controller, type HttpRequest } from '../../../presentation/protocols'
import { type Request, type Response } from 'express'

export const adapterRoute = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    const httpRequest: HttpRequest = {
      body: req.body,
      query: req.query
    }

    const httpResponse = await controller.handle(httpRequest)

    if (httpResponse.statusCode >= 200 && httpResponse.statusCode < 300) {
      if (httpResponse.body.isRedirect) {
        console.log(`Redirecting to: ${httpResponse.body.redirectForUri}`)
        res.set('Content-Type', 'text/html')
        res.status(httpResponse.statusCode).send(`
          <html>
            <body>
              <a href="${httpResponse.body.redirectForUri}" style="font-size:2em;">Clique aqui para retornar ao app</a>
              <script>
                window.location.href = "${httpResponse.body.redirectForUri}";
              </script>
            </body>
          </html>
        `)
      } else {
        res.status(httpResponse.statusCode).json(httpResponse.body)
      }
    } else {
      res.status(httpResponse.statusCode).json({
        error: httpResponse.body.message || 'An error occurred'
      })
    }
  }
}
