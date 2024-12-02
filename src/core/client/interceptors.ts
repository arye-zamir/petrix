import type { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './types'

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  request = {
    use: (interceptor: RequestInterceptor): (() => void) => {
      this.requestInterceptors.push(interceptor)
      return () => {
        const index = this.requestInterceptors.indexOf(interceptor)
        if (index !== -1) {
          this.requestInterceptors.splice(index, 1)
        }
      }
    },
  }

  response = {
    use: (responseInterceptor: ResponseInterceptor, errorInterceptor?: ErrorInterceptor): (() => void) => {
      this.responseInterceptors.push(responseInterceptor)
      if (errorInterceptor) {
        this.errorInterceptors.push(errorInterceptor)
      }
      return () => {
        const responseIndex = this.responseInterceptors.indexOf(responseInterceptor)
        if (responseIndex !== -1) {
          this.responseInterceptors.splice(responseIndex, 1)
        }
        if (errorInterceptor) {
          const errorIndex = this.errorInterceptors.indexOf(errorInterceptor)
          if (errorIndex !== -1) {
            this.errorInterceptors.splice(errorIndex, 1)
          }
        }
      }
    },
  }

  async runRequestInterceptors(config: any) {
    let currentConfig = { ...config }
    for (const interceptor of this.requestInterceptors) {
      currentConfig = await interceptor(currentConfig)
    }
    return currentConfig
  }

  async runResponseInterceptors(response: any) {
    let currentResponse = { ...response }
    for (const interceptor of this.responseInterceptors) {
      currentResponse = await interceptor(currentResponse)
    }
    return currentResponse
  }

  async runErrorInterceptors(error: any) {
    let currentError = error
    for (const interceptor of this.errorInterceptors) {
      currentError = await interceptor(currentError)
    }
    return currentError
  }
}
