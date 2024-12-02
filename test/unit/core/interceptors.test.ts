import { beforeEach, describe, it, expect, vi } from 'vitest'
import { createClient } from '../../../src/core/client'
import type { PetrixRequestError } from '../../../src/core/errors'

describe('Interceptors', () => {
  const mockFetch = vi.fn()
  global.fetch = mockFetch

  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should run request interceptors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
      headers: new Headers(),
    })

    const client = createClient({ baseURL: 'http://mock.api' })
    const removeInterceptor = client.interceptors.request.use((config) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          'X-Custom-Header': 'test',
        },
      }
    })

    await client.get('/test')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://mock.api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom-Header': 'test',
        }),
      }),
    )

    removeInterceptor()
  })

  it('should run response interceptors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ data: 'test' }),
      headers: new Headers(),
    })

    const client = createClient({ baseURL: 'http://mock.api' })
    const removeInterceptor = client.interceptors.response.use((response) => {
      return {
        ...response,
        data: { transformed: response.data },
      }
    })

    const response = await client.get('/test')
    expect(response.data).toEqual({ transformed: { data: 'test' } })

    removeInterceptor()
  })

  it('should run error interceptors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ error: 'test' }),
      headers: new Headers(),
    })

    const client = createClient({ baseURL: 'http://mock.api' })
    const removeInterceptor = client.interceptors.response.use(
      (response) => response,
      (error: PetrixRequestError) => {
        error.message = 'Intercepted: ' + error.message
        return error
      },
    )

    try {
      await client.get('/test')
      expect.fail('Should have thrown an error')
    } catch (error) {
      const petrixError = error as PetrixRequestError
      expect(petrixError.message).toContain('Intercepted:')
    }

    removeInterceptor()
  })

  it('should allow removing interceptors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
      headers: new Headers(),
    })

    const client = createClient({ baseURL: 'http://mock.api' })
    const removeInterceptor = client.interceptors.request.use((config) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          'X-Custom-Header': 'test',
        },
      }
    })

    removeInterceptor()

    await client.get('/test')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://mock.api/test',
      expect.not.objectContaining({
        headers: expect.objectContaining({
          'X-Custom-Header': 'test',
        }),
      }),
    )
  })
})
