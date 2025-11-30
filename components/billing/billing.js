'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../styles/Billing.scss'
import UserProfile from '@/app/session/UserProfile'

export default function Billing() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handlePayment = async () => {
        setLoading(true)
        setError('')

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            const paymentSuccess = true
            
            if (!paymentSuccess) {
                throw new Error('Payment failed. Please try again or use a different payment method.')
            }

            // Call subscription update API
            const response = await fetch('/api/subscription/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscriptionData: "premium"
                })
            })

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Failed to update subscription')
            }

            alert('Payment successful! Your subscription has been upgraded.')
            
            // Redirect to main page after success
            UserProfile.setSubscriptionAccess(null);
            setTimeout(() => {
                router.push('/mainPage')
            }, 1500)

        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="billing-page">
            <div className="billing-header">
                <h1>Upgrade Your Workspace</h1>
                <p>Choose the plan that fits your team's needs</p>
            </div>

            {error && (
                <div className="billing-error">
                    {error}
                </div>
            )}

                <div className={`billing-plan  billing-plan--selected`}>
                    <div className="billing-plan__header">
                        <h3>Premium</h3>
                        <div className="billing-plan__price">
                            <span className="billing-plan__amount">$29</span>
                            <span className="billing-plan__period">/month</span>
                        </div>
                    </div>
                    <div className="billing-plan__features">
                        <div className="billing-plan__feature">
                            <span className="billing-plan__check">✓</span>
                            Unlimited contracts
                        </div>
                        <div className="billing-plan__feature">
                            <span className="billing-plan__check">✓</span>
                            Advanced date tracking
                        </div>
                        <div className="billing-plan__feature">
                            <span className="billing-plan__check">✓</span>
                            Team collaboration
                        </div>
                        <div className="billing-plan__feature">
                            <span className="billing-plan__check">✓</span>
                            Automated email reminders
                        </div>
                    </div>
                </div>

            <div className="billing-payment">
                <div className="billing-payment__section">
                    <h4>Payment Information</h4>
                    <div className="billing-payment__form">
                        <div className="billing-payment__field">
                            <label>Card Number</label>
                            <input 
                                type="text" 
                                placeholder="1234 5678 9012 3456"
                                className="billing-payment__input"
                            />
                        </div>
                        <div className="billing-payment__row">
                            <div className="billing-payment__field">
                                <label>Expiry Date</label>
                                <input 
                                    type="text" 
                                    placeholder="MM/YY"
                                    className="billing-payment__input"
                                />
                            </div>
                            <div className="billing-payment__field">
                                <label>CVC</label>
                                <input 
                                    type="text" 
                                    placeholder="123"
                                    className="billing-payment__input"
                                />
                            </div>
                        </div>
                        <div className="billing-payment__field">
                            <label>Cardholder Name</label>
                            <input 
                                type="text" 
                                placeholder="John Doe"
                                className="billing-payment__input"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="billing-payment__button"
                >
                    {loading ? 'Processing Payment...' : `Pay $29`}
                </button>

                <p className="billing-payment__notice">
                    This is a demo payment system. No real charges will be made.
                </p>
            </div>
        </div>
    )
}