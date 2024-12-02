import type { ResponseType } from '../response/types'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export type QueryValue = string | number | boolean | null | undefined | object | Array<string | number | boolean>
export type QueryParams = Record<string, QueryValue>

export interface RequestConfig {
  url: string
  method: HttpMethod
  headers?: Record<string, string>
  params?: QueryParams
  data?: any
  timeout?: number
  signal?: AbortSignal
  responseType?: ResponseType
}

export interface PetrixResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
}

export interface PetrixError extends Error {
  config: RequestConfig
  status?: number
  statusText?: string
  headers?: Record<string, string>
  response?: PetrixResponse
}

export interface PetrixClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  responseType?: ResponseType
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
export type ResponseInterceptor = (response: PetrixResponse) => PetrixResponse | Promise<PetrixResponse>
export type ErrorInterceptor = (error: PetrixRequestError) => PetrixRequestError | Promise<PetrixRequestError>

export interface Interceptors {
  request: {
    use: (interceptor: RequestInterceptor) => () => void
  }
  response: {
    use: (interceptor: ResponseInterceptor, error?: ErrorInterceptor) => () => void
  }
}

export interface PetrixInstance {
  request<T = any>(config: RequestConfig): Promise<PetrixResponse<T>>

  get<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<PetrixResponse<T>>

  post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<PetrixResponse<T>>

  put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<PetrixResponse<T>>

  delete<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<PetrixResponse<T>>

  patch<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<PetrixResponse<T>>

  head<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<PetrixResponse<T>>

  options<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<PetrixResponse<T>>

  interceptors: Interceptors
}
