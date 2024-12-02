import type { PetrixInstance, PetrixClientConfig, RequestConfig, PetrixResponse } from './types'
import { PetrixRequestError } from '../errors'
import { ERROR_CODE } from '../../constants/errors'
import { resolveUrl } from '../../utils/url'
import { InterceptorManager } from './interceptors'
import { parseResponse } from '../response/parser'

export function createClient(config: PetrixClientConfig = {}): PetrixInstance {
  const defaultConfig: PetrixClientConfig = {
    timeout: 0,
    headers: {},
    responseType: 'json',
    ...config,
  }

  const interceptorManager = new InterceptorManager()

  async function request<T = any>(requestConfig: RequestConfig): Promise<PetrixResponse<T>> {
    const finalConfig = await interceptorManager.runRequestInterceptors({
      ...defaultConfig,
      ...requestConfig,
      headers: {
        ...defaultConfig.headers,
        ...requestConfig.headers,
      },
    })

    const url = resolveUrl(defaultConfig.baseURL, finalConfig.url, finalConfig.params)

    // Setup request with timeout
    const timeoutController = new AbortController()
    const timeoutId =
      finalConfig.timeout && finalConfig.timeout > 0 ? setTimeout(() => timeoutController.abort(), finalConfig.timeout) : null

    // Combine user's AbortSignal with timeout's if both exist
    const signal = finalConfig.signal || timeoutController.signal

    try {
      const response = await fetch(url, {
        method: finalConfig.method,
        headers: {
          'Content-Type': 'application/json',
          ...finalConfig.headers,
        },
        body: finalConfig.data ? JSON.stringify(finalConfig.data) : undefined,
        signal,
      })

      if (timeoutId) clearTimeout(timeoutId)

      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      const data = await parseResponse(response, finalConfig.responseType)

      if (!response.ok) {
        const errorResponse = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers,
          config: finalConfig,
        }

        const error = new PetrixRequestError({
          code: ERROR_CODE.RESPONSE,
          message: response.statusText || 'Request failed',
          config: finalConfig,
          status: response.status,
          statusText: response.statusText,
          headers,
          response: errorResponse,
        })

        const interceptedError = await interceptorManager.runErrorInterceptors(error)
        throw interceptedError
      }

      const successResponse = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers,
        config: finalConfig,
      }

      return await interceptorManager.runResponseInterceptors(successResponse)
    } catch (error: unknown) {
      if (timeoutId) clearTimeout(timeoutId)

      if (error instanceof PetrixRequestError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const petrixError = new PetrixRequestError({
            code: ERROR_CODE.TIMEOUT,
            message: 'Request timed out',
            config: finalConfig,
            cause: error,
          })
          const interceptedError = await interceptorManager.runErrorInterceptors(petrixError)
          throw interceptedError
        }

        const petrixError = new PetrixRequestError({
          code: ERROR_CODE.NETWORK,
          message: error.message,
          config: finalConfig,
          cause: error,
        })

        const interceptedError = await interceptorManager.runErrorInterceptors(petrixError)
        throw interceptedError
      }

      const petrixError = new PetrixRequestError({
        code: ERROR_CODE.NETWORK,
        message: 'An unknown error occurred',
        config: finalConfig,
      })

      const interceptedError = await interceptorManager.runErrorInterceptors(petrixError)
      throw interceptedError
    }
  }

  const instance: PetrixInstance = {
    request,
    get: (url, config = {}) => request({ ...config, url, method: 'GET' }),
    post: (url, data, config = {}) => request({ ...config, url, method: 'POST', data }),
    put: (url, data, config = {}) => request({ ...config, url, method: 'PUT', data }),
    delete: (url, config = {}) => request({ ...config, url, method: 'DELETE' }),
    patch: (url, data, config = {}) => request({ ...config, url, method: 'PATCH', data }),
    head: (url, config = {}) => request({ ...config, url, method: 'HEAD' }),
    options: (url, config = {}) => request({ ...config, url, method: 'OPTIONS' }),
    interceptors: interceptorManager,
  }

  return instance
}
