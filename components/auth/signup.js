'use client'

import Link from 'next/link'
import { useState } from 'react'
import UserProfile from '../../app/session/UserProfile'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    name: '',
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
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error('All fields are required')
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const signUpData = await res.json()

      if (!signUpData.success) {
        throw new Error(signUpData.error || 'Sign up failed')
      }

      await UserProfile.syncWithServer()
      router.push('/join')
    } catch (error) {
      console.error('Sign up failed:', error)
      setErrorMsg(error.message || 'Sign up failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <p className="auth-hero__eyebrow">Docs Compliance</p>
        <h1>Launch a secure workspace for every stakeholder</h1>
        <p>
          Spin up a shared environment where procurement, legal, finance, and outside partners can
          collaborate without losing the paper trail.
        </p>
        <p>
          We guide you through setting roles, invite flows, and review reminders so your team is
          productive on day one.
        </p>
        <ul className="auth-hero__list">
          <li>Unlimited groups and granular permissions</li>
          <li>Built-in NDA + contract templates ready to customize</li>
          <li>Real-time dashboards for expirations and approvals</li>
        </ul>
        <div className="auth-hero__meta">
          <span>Unlimited groups</span>
          <span>Role-based access</span>
          <span>Onboarding support included</span>
        </div>
      </section>

      <section className="auth-card">
        <header className="auth-card__header">
          <p className="auth-card__kicker">Create account</p>
          <h2>Let&apos;s get started</h2>
          <p>Tell us who you are so we can prepare your workspace.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} aria-live="polite">
          <div className="auth-form__field">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Taylor Jenkins"
              value={formData.name}
              onChange={handleChange}
              required
              aria-required="true"
              aria-invalid={errorMsg ? 'true' : 'false'}
            />
          </div>

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
              placeholder="At least 6 characters"
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
              {isLoading ? 'Creating account…' : 'Sign up'}
            </button>
          </div>
        </form>

        <p className="auth-card__switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>
    </div>
  )
}