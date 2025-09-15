'use client'

import { useState } from 'react'

export default function LoginTestPage() {
  const [result, setResult] = useState('')
  const [step, setStep] = useState('')

  const testLogin = async () => {
    try {
      setStep('Starting login test...')
      setResult('Testing login flow...\n')

      // Step 1: Login
      setStep('Attempting login...')
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'member@luxylyfe.com',
          password: 'member123',
          role: 'MEMBER'
        }),
        credentials: 'include' // Important: include cookies
      })

      const loginData = await loginResponse.json()
      setResult(prev => prev + `\n--- LOGIN RESPONSE ---\n`)
      setResult(prev => prev + `Status: ${loginResponse.status}\n`)
      setResult(prev => prev + `Response: ${JSON.stringify(loginData, null, 2)}\n`)

      if (loginResponse.status !== 200) {
        setStep('Login failed')
        return
      }

      setStep('Login successful, testing authentication...')

      // Wait a moment for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 2: Test authentication
      const authResponse = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include' // Important: include cookies
      })

      const authData = await authResponse.json()
      setResult(prev => prev + `\n--- AUTH CHECK RESPONSE ---\n`)
      setResult(prev => prev + `Status: ${authResponse.status}\n`)
      setResult(prev => prev + `Response: ${JSON.stringify(authData, null, 2)}\n`)

      if (authResponse.status === 200) {
        setStep('✅ Authentication successful!')
      } else {
        setStep('❌ Authentication failed!')
      }

    } catch (error) {
      setStep('Error occurred')
      setResult(prev => prev + `\nError: ${error instanceof Error ? error.message : String(error)}\n`)
      console.error('Test error:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Login Flow Test</h1>
      
      <div className="mb-4">
        <button 
          onClick={testLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Test Login Flow
        </button>
      </div>

      <div className="mb-4">
        <strong>Current Step:</strong> {step}
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Test Results:</h3>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>

      <div className="mt-6">
        <h3 className="font-bold mb-2">Test Credentials:</h3>
        <p>Email: member@luxylyfe.com</p>
        <p>Password: member123</p>
        <p>Role: MEMBER</p>
      </div>
    </div>
  )
}