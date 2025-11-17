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

      UserProfile.setEmail(formData.email)
      UserProfile.setName(formData.name)
      router.push('/join')
    } catch (error) {
      console.error('Sign up failed:', error)
      setErrorMsg(error.message || 'Sign up failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left side - Signup form */}
      <div className="login-page__left">
        <form className="login-form" onSubmit={handleSubmit} aria-live="polite">
          {/* Header */}
          <div className="login-form__header">
            <h1 className="login-form__title">DOCS COMPLIANCE</h1>
          </div>

          {/* Welcome section */}
          <div className="login-form__welcome">
            <h2 className="login-form__welcome-heading">Nice to meet you!</h2>
            <p className="login-form__welcome-text">Sign up to start save your time & money.</p>
          </div>

          {/* Form fields */}
          <div className="login-form__form">
            <div className="login-form__field">
              <label htmlFor="email" className="login-form__label">E-mail</label>
              <div className="login-form__input-wrapper">
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="login-form__input"
                  required
                  aria-required="true"
                  aria-invalid={errorMsg ? 'true' : 'false'}
                />
              </div>
            </div>

            <div className="login-form__field">
              <label htmlFor="name" className="login-form__label">Your Name</label>
              <div className="login-form__input-wrapper">
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  className="login-form__input"
                  required
                  aria-required="true"
                  aria-invalid={errorMsg ? 'true' : 'false'}
                />
              </div>
            </div>

            <div className="login-form__field">
              <label htmlFor="password" className="login-form__label">Password</label>
              <div className="login-form__input-wrapper">
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="login-form__input"
                  required
                  aria-required="true"
                  aria-invalid={errorMsg ? 'true' : 'false'}
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div role="alert" style={{ color: 'var(--color-destructive)', marginTop: '10px', fontSize: '14px' }}>
              {errorMsg}
            </div>
          )}

          {/* Sign Up button */}
          <button type="submit" className="login-form__button" disabled={isLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>

          {/* Login link */}
          <p className="login-form__signup">
            Already have an account?{' '}
            <Link href="/login" className="login-form__signup-link">
              Log in
            </Link>
          </p>

          {/* Mobile info - only visible on small screens */}
          <div className="login-form__mobile-info">
            <p className="login-form__mobile-info-text">
              <span className="login-form__mobile-info-brand">Docs Compliance</span> – kompleksowy system do
              zarządzania wszystkimi terminami i wymaganiami regulacyjnymi Twojej firmy.
            </p>
          </div>
        </form>
      </div>

      {/* Right side - Info panel */}
      <div className="login-page__right" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
        <div className="login-page__right-content">
          <div>
            <h2 className="info-panel__title">Docs Compliance</h2>
            <p className="info-panel__description">
              – kompleksowy system do zarządzania wszystkimi terminami i wymaganiami regulacyjnymi Twojej firmy.
            </p>
          </div>
          <p className="info-panel__copyright">copyright © 2025 Docs Compliance</p>
        </div>
      </div>
    </div>
  )
}