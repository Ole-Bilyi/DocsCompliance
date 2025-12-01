'use client'

import Link from 'next/link'
import { useState } from 'react'
import UserProfile from '@/app/session/UserProfile'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setErrorMsg(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsLoading(true)

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required')
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const loginData = await res.json()

      if (!loginData.success) {
        throw new Error(loginData.error || 'Login failed')
      }
      
      await UserProfile.syncWithServer()

      router.push('/mainPage')
    } catch (error) {
      console.error('Login failed:', error)
      setErrorMsg(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <p className="auth-hero__eyebrow">DocsCompliance</p>
        <h1>Streamline Your Contract Management Workflow</h1>
        <p>
          DocsCompliance is your all-in-one platform for managing document approvals, renewals, 
          and compliance deadlines. Never miss a critical contract date again with automated 
          tracking and intelligent reminders.
        </p>
        <p>
          Collaborate seamlessly with your team. Assign deadlines, track progress, and maintain 
          complete visibility across all contracts and compliance requirements from a single dashboard.
        </p>
        <ul className="auth-hero__list">
          <li>Smart deadline tracking with automated email reminders</li>
          <li>Group-based collaboration with role-based permissions</li>
          <li>Contract text extraction for automatic date discovery</li>
          <li>Real-time calendar integration for upcoming deadlines</li>
          <li>Secure document storage with version control</li>
        </ul>
        <div className="auth-hero__meta">
          <span>Secure Supabase backend with PostgreSQL</span>
          <span>Built with Next.js 14 for optimal performance</span>
          <span>Iron-session authentication for enhanced security</span>
        </div>
      </section>

      <section className="auth-card">
        <header className="auth-card__header">
          <p className="auth-card__kicker">Sign in</p>
          <h2>Welcome back</h2>
          <p>Enter your credentials to reach your Docs Compliance dashboard.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} aria-live="polite">
          <div className="auth-form__field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              aria-required="true"
              aria-invalid={errorMsg ? 'true' : 'false'}
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              aria-required="true"
              aria-invalid={errorMsg ? 'true' : 'false'}
            />
          </div>

          {errorMsg && (
            <div role="alert" className="auth-form__status">
              {errorMsg}
            </div>
          )}

          <div className="auth-form__actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="auth-card__switch">
          Don&apos;t have an account? <Link href="/signup">Create one</Link>
        </p>
      </section>
    </div>
  )
}