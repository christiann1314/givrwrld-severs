import { createClient } from '@supabase/supabase-js'
import { config } from '@/config/environment'

const supabase = createClient(config.supabase.url, config.supabase.anonKey)

class ApiClient {
  private baseUrl: string
  
  constructor() {
    this.baseUrl = config.supabase.functionsUrl
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': config.supabase.anonKey
    }

    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    return headers
  }

  async get(path: string): Promise<any> {
    const headers = await this.getHeaders()
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async post(path: string, body?: any): Promise<any> {
    const headers = await this.getHeaders()
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async put(path: string, body?: any): Promise<any> {
    const headers = await this.getHeaders()
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async delete(path: string): Promise<any> {
    const headers = await this.getHeaders()
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP ${response.status}`)
    }

    return response.json()
  }
}

export const api = new ApiClient()
