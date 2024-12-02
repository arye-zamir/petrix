import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../../src/core/client'
import { ERROR_CODE } from '../../../src/constants/errors'
import type { PetrixRequestError } from '../../../src/core/errors'

describe('Petrix Client', () => {
  const mockFetch = vi.fn()
  global.fetch = mockFetch

  beforeEach(() => {
    mockFetch.mockReset()
  })

  // region Basic HTTP Methods
  describe('Basic HTTP Methods', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { success: true }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })
      const response = await client.get('/success')

      expect(response.status).toBe(200)
      expect(response.data).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://mock.api/success',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      )
    })

    it('should make successful POST request with data', async () => {
      const testData = { test: 'data' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(testData),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })
      const response = await client.post('/test', testData)

      expect(response.status).toBe(200)
      expect(response.data).toEqual(testData)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://mock.api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(testData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      )
    })

    it('should handle server errors', async () => {
      const errorResponse = { error: 'Server Error' }
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve(errorResponse),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })

      try {
        await client.get('/error')
        expect.fail('Should have thrown an error')
      } catch (error) {
        const petrixError = error as PetrixRequestError
        expect(petrixError.status).toBe(500)
        expect(petrixError.code).toBe(ERROR_CODE.RESPONSE)
        expect(petrixError.response?.data).toEqual(errorResponse)
      }
    })
  })

  // endregion

  // region HTTP methods
  describe('HTTP Methods', () => {
    const successResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ success: true }),
      headers: new Headers(),
    }

    beforeEach(() => {
      mockFetch.mockReset()
      mockFetch.mockResolvedValue(successResponse)
    })

    it('should make PUT request', async () => {
      const data = { id: 1, name: 'test' }
      await createClient({ baseURL: 'http://mock.api' }).put('/test', data)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://mock.api/test',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      )
    })

    it('should make DELETE request', async () => {
      await createClient({ baseURL: 'http://mock.api' }).delete('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://mock.api/test',
        expect.objectContaining({
          method: 'DELETE',
        }),
      )
    })

    it('should make PATCH request', async () => {
      const data = { name: 'updated' }
      await createClient({ baseURL: 'http://mock.api' }).patch('/test', data)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://mock.api/test',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data),
        }),
      )
    })

    it('should make HEAD request', async () => {
      await createClient({ baseURL: 'http://mock.api' }).head('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://mock.api/test',
        expect.objectContaining({
          method: 'HEAD',
        }),
      )
    })

    it('should make OPTIONS request', async () => {
      await createClient({ baseURL: 'http://mock.api' }).options('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://mock.api/test',
        expect.objectContaining({
          method: 'OPTIONS',
        }),
      )
    })
  })

  describe('Signal Handling', () => {
    it('should use user provided signal instead of timeout signal', async () => {
      const userController = new AbortController()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        headers: new Headers(),
      })

      const client = createClient({
        baseURL: 'http://mock.api',
        timeout: 1000, // This would create a timeout signal
      })

      await client.get('/test', { signal: userController.signal })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://mock.api/test',
        expect.objectContaining({
          signal: userController.signal,
        }),
      )
    })

    it('should clear timeout if request completes', async () => {
      vi.useFakeTimers()
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        headers: new Headers(),
      })

      const client = createClient({
        baseURL: 'http://mock.api',
        timeout: 1000,
      })

      const promise = client.get('/test')
      await promise

      expect(clearTimeoutSpy).toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  // endregion

  // region Configuration
  describe('Configuration', () => {
    it('should merge headers correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        headers: new Headers(),
      })

      const client = createClient({
        baseURL: 'http://mock.api',
        headers: { 'X-Base-Header': 'base' },
      })

      await client.get('/test', {
        headers: { 'X-Request-Header': 'request' },
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://mock.api/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Base-Header': 'base',
            'X-Request-Header': 'request',
          }),
        }),
      )
    })
  })

  // endregion

  // region Error Handling
  describe('Error Handling', () => {
    it('should handle unknown errors', async () => {
      // Mock fetch to throw something that's not an Error
      mockFetch.mockRejectedValueOnce('not an error object')

      const client = createClient({ baseURL: 'http://mock.api' })

      try {
        await client.get('/test')
        expect.fail('Should have thrown an error')
      } catch (error) {
        const petrixError = error as PetrixRequestError
        expect(petrixError.code).toBe(ERROR_CODE.NETWORK)
        expect(petrixError.message).toBe('An unknown error occurred')
        expect(petrixError.config).toBeDefined()
        // Ensure no status is set for network errors
        expect(petrixError.status).toBeUndefined()
        expect(petrixError.response).toBeUndefined()
      }
    })

    it('should run interceptors for unknown errors', async () => {
      mockFetch.mockRejectedValueOnce('not an error object')

      const client = createClient({ baseURL: 'http://mock.api' })
      const interceptorSpy = vi.fn((error: PetrixRequestError) => {
        error.message = 'Intercepted: ' + error.message
        return error
      })

      client.interceptors.response.use((response) => response, interceptorSpy)

      try {
        await client.get('/test')
        expect.fail('Should have thrown an error')
      } catch (error) {
        const petrixError = error as PetrixRequestError
        expect(interceptorSpy).toHaveBeenCalled()
        expect(petrixError.message).toBe('Intercepted: An unknown error occurred')
        expect(petrixError.code).toBe(ERROR_CODE.NETWORK)
      }
    })

    it('should handle request timeouts', async () => {
      const abortError = new Error()
      abortError.name = 'AbortError'
      mockFetch.mockRejectedValueOnce(abortError)

      const client = createClient({ baseURL: 'http://mock.api' })

      try {
        await client.get('/test')
        expect.fail('Should have thrown an error')
      } catch (error) {
        const petrixError = error as PetrixRequestError
        expect(petrixError.code).toBe(ERROR_CODE.TIMEOUT)
      }
    })
  })

  // endregion

  // region Response Type
  describe('Response Type Handling', () => {
    it('should handle text response type', async () => {
      const textResponse = 'Hello, World!'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(textResponse),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })
      const response = await client.get('/test', { responseType: 'text' })

      expect(response.data).toBe(textResponse)
    })

    it('should fallback to text when JSON parsing fails', async () => {
      const invalidJson = 'Invalid JSON'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.reject(new Error('Invalid JSON')),
        text: () => Promise.resolve(invalidJson),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })
      const response = await client.get('/test')

      expect(response.data).toBe(invalidJson)
    })

    it('should respect responseType in client config', async () => {
      const textResponse = 'Hello, World!'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(textResponse),
        headers: new Headers(),
      })

      const client = createClient({
        baseURL: 'http://mock.api',
        responseType: 'text',
      })
      const response = await client.get('/test')

      expect(response.data).toBe(textResponse)
    })

    it('should override client config responseType with request config', async () => {
      const jsonResponse = { hello: 'world' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(jsonResponse),
        headers: new Headers(),
      })

      const client = createClient({
        baseURL: 'http://mock.api',
        responseType: 'text',
      })
      const response = await client.get('/test', { responseType: 'json' })

      expect(response.data).toEqual(jsonResponse)
    })
  })

  // endregion

  // region Response Parsing
  describe('Response Parsing', () => {
    it('should throw when text response fails to parse', async () => {
      // Mock a Response object that fails on text() method
      const mockError = new Error('Failed to parse text response')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        text: () => Promise.reject(mockError),
        json: () => Promise.reject(new Error('JSON parse failed')),
      })

      const client = createClient({ baseURL: 'http://mock.api' })

      try {
        await client.get('/test', { responseType: 'text' })
        expect.fail('Should have thrown an error')
      } catch (error) {
        const petrixError = error as PetrixRequestError
        expect(petrixError.code).toBe(ERROR_CODE.NETWORK)
        expect(petrixError.cause).toBe(mockError)
        expect(petrixError.message).toBe('Failed to parse text response')
      }
    })

    it('should fallback to text only when JSON parsing fails', async () => {
      const textContent = 'plain text content'
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        text: vi.fn().mockResolvedValue(textContent),
        json: vi.fn().mockRejectedValue(new Error('JSON parse failed')),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const client = createClient({ baseURL: 'http://mock.api' })

      // Request with responseType: 'json' that falls back to text
      const response = await client.get('/test')

      // Verify json() was attempted first
      expect(mockResponse.json).toHaveBeenCalled()
      expect(mockResponse.text).toHaveBeenCalled()
      expect(response.data).toBe(textContent)

      // Verify text() is not used as fallback when explicitly requesting text
      mockResponse.json.mockClear()
      mockResponse.text.mockClear()
      mockFetch.mockResolvedValueOnce(mockResponse)

      await client.get('/test', { responseType: 'text' })
      expect(mockResponse.json).not.toHaveBeenCalled()
      expect(mockResponse.text).toHaveBeenCalled()
    })
  })

  // endregion

  // region Error Response
  describe('Error Response Handling', () => {
    it('should use default message when statusText is empty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: '', // Empty statusText
        json: () => Promise.resolve({ error: 'test' }),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })

      try {
        await client.get('/test')
        expect.fail('Should have thrown an error')
      } catch (error) {
        const petrixError = error as PetrixRequestError
        expect(petrixError.message).toBe('Request failed')
      }
    })
  })

  // endregion

  // region Query Parameter
  describe('Query Parameter Handling', () => {
    it('should handle simple query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })
      await client.get('/test', {
        params: { foo: 'bar', count: 42 },
      })

      expect(mockFetch).toHaveBeenCalledWith('http://mock.api/test?foo=bar&count=42', expect.any(Object))
    })

    it('should handle array query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })
      await client.get('/test', {
        params: { ids: [1, 2, 3] },
      })

      expect(mockFetch).toHaveBeenCalledWith('http://mock.api/test?ids=1&ids=2&ids=3', expect.any(Object))
    })

    it('should handle object query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })
      const filter = { name: 'test', age: 25 }
      await client.get('/test', {
        params: { filter },
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `http://mock.api/test?filter=${encodeURIComponent(JSON.stringify(filter))}`,
        expect.any(Object),
      )
    })

    it('should skip null and undefined query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })
      await client.get('/test', {
        params: {
          a: 1,
          b: null,
          c: undefined,
          d: 'test',
        },
      })

      expect(mockFetch).toHaveBeenCalledWith('http://mock.api/test?a=1&d=test', expect.any(Object))
    })

    it('should handle query parameters with existing URL query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        headers: new Headers(),
      })

      const client = createClient({ baseURL: 'http://mock.api' })
      await client.get('/test?existing=true', {
        params: { additional: 'param' },
      })

      expect(mockFetch).toHaveBeenCalledWith('http://mock.api/test?existing=true&additional=param', expect.any(Object))
    })
  })
})
