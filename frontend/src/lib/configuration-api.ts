/**
 * Configuration API client for managing burnout analysis settings
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface IntegrationImpact {
  rootly: number
  github: number
  slack: number
}

export interface CBIWeights {
  personal: number
  work: number
}

export interface IntegrationImpacts {
  teamHealth: IntegrationImpact
  atRisk: IntegrationImpact
  workload: IntegrationImpact
  afterHours: IntegrationImpact
  weekendWork: IntegrationImpact
  responseTime: IntegrationImpact
  incidentLoad: IntegrationImpact
}

export interface Configuration {
  cbiWeights: CBIWeights
  integrationImpacts: IntegrationImpacts
  activePreset: string
  updated_at?: string
  organization_id?: number
}

/**
 * Get the current configuration
 */
export async function getConfiguration(): Promise<Configuration> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE}/api/configuration`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to load configuration: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Update the configuration
 */
export async function updateConfiguration(config: Omit<Configuration, 'updated_at' | 'organization_id'>): Promise<Configuration> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE}/api/configuration`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include',
    body: JSON.stringify(config)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to save configuration: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Reset configuration to defaults
 */
export async function resetConfiguration(): Promise<Configuration> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE}/api/configuration/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to reset configuration: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Export configuration as downloadable JSON
 */
export async function exportConfiguration(): Promise<Blob> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE}/api/configuration/export`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to export configuration: ${response.statusText}`)
  }

  const data = await response.json()

  // Convert to blob for download
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  return blob
}

/**
 * Import configuration from JSON file
 */
export async function importConfiguration(file: File): Promise<Configuration> {
  const token = localStorage.getItem('auth_token')

  // Read file contents
  const text = await file.text()
  const importData = JSON.parse(text)

  const response = await fetch(`${API_BASE}/api/configuration/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include',
    body: JSON.stringify(importData)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to import configuration: ${response.statusText}`)
  }

  return response.json()
}
