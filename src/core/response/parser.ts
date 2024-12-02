import type { ResponseType } from './types'

export async function parseResponse(response: Response, responseType: ResponseType = 'json') {
  try {
    return await response[responseType]()
  } catch (error) {
    if (responseType === 'json') {
      return await response.text()
    }
    throw error
  }
}
