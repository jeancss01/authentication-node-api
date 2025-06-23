export interface HttpResponse {
  statusCode: number
  body: any
  isRedirect?: boolean
}

export interface HttpRequest {
  body?: any
  params?: any
  query?: any
  headers?: any
}
