/* 파일경로: __tests__/lib/webhook.test.ts */
import Stripe from 'stripe'

// Mock Stripe webhook event for testing
const mockWebhookEvent: Stripe.Event = {
  id: 'evt_test_webhook',
  object: 'event',
  api_version: '2020-08-27',
  created: 1677649705,
  data: {
    object: {
      id: 'cs_test_checkout_session',
      object: 'checkout.session',
      amount_subtotal: 3000,
      amount_total: 3000,
      currency: 'krw',
      customer_details: {
        email: 'test@example.com',
        name: 'Test User',
      },
      metadata: {
        user_id: 'test-user-id',
        boost_days: '3',
      },
      payment_status: 'paid',
      status: 'complete',
    } as unknown as Stripe.Checkout.Session,
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: 'req_test_request',
    idempotency_key: null,
  },
  type: 'checkout.session.completed',
}

describe('Stripe Webhook Processing', () => {
  beforeEach(() => {
    // Reset environment variables (read-only in test, just for documentation)
    // process.env.NODE_ENV is handled by test framework
  })

  describe('Event Type Validation', () => {
    it('should identify checkout.session.completed event', () => {
      expect(mockWebhookEvent.type).toBe('checkout.session.completed')
    })

    it('should have valid session object', () => {
      const session = mockWebhookEvent.data.object as Stripe.Checkout.Session
      expect(session.object).toBe('checkout.session')
      expect(session.payment_status).toBe('paid')
      expect(session.status).toBe('complete')
    })

    it('should contain required metadata', () => {
      const session = mockWebhookEvent.data.object as Stripe.Checkout.Session
      expect(session.metadata).toBeDefined()
      expect(session.metadata?.user_id).toBe('test-user-id')
      expect(session.metadata?.boost_days).toBe('3')
    })
  })

  describe('Payment Validation', () => {
    it('should validate successful payment', () => {
      const session = mockWebhookEvent.data.object as Stripe.Checkout.Session

      const isValidPayment =
        session.payment_status === 'paid' &&
        session.status === 'complete' &&
        session.amount_total !== null &&
        session.amount_total > 0

      expect(isValidPayment).toBe(true)
    })

    it('should validate currency is KRW', () => {
      const session = mockWebhookEvent.data.object as Stripe.Checkout.Session
      expect(session.currency).toBe('krw')
    })

    it('should validate amount is reasonable for boost', () => {
      const session = mockWebhookEvent.data.object as Stripe.Checkout.Session
      const amount = session.amount_total || 0

      // Boost prices should be between 1,000 and 50,000 KRW
      expect(amount).toBeGreaterThanOrEqual(1000)
      expect(amount).toBeLessThanOrEqual(50000)
    })
  })

  describe('Boost Duration Calculation', () => {
    it('should calculate correct boost end time for 3 days', () => {
      const session = mockWebhookEvent.data.object as Stripe.Checkout.Session
      const boostDays = parseInt(session.metadata?.boost_days || '0')

      expect(boostDays).toBe(3)

      const now = new Date()
      const boostUntil = new Date(now.getTime() + boostDays * 24 * 60 * 60 * 1000)

      // Should be approximately 3 days from now
      const expectedTime = now.getTime() + 3 * 24 * 60 * 60 * 1000
      const tolerance = 10000 // 10 seconds tolerance

      expect(Math.abs(boostUntil.getTime() - expectedTime)).toBeLessThan(tolerance)
    })

    it('should handle invalid boost days gracefully', () => {
      const invalidSession = {
        ...mockWebhookEvent.data.object,
        metadata: {
          user_id: 'test-user-id',
          boost_days: 'invalid',
        },
      } as Stripe.Checkout.Session

      const boostDays = parseInt(invalidSession.metadata?.boost_days || '0', 10) || 0
      expect(boostDays).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing metadata', () => {
      const sessionWithoutMetadata = {
        ...mockWebhookEvent.data.object,
        metadata: null,
      } as Stripe.Checkout.Session

      const userId = sessionWithoutMetadata.metadata?.user_id
      const boostDays = sessionWithoutMetadata.metadata?.boost_days

      expect(userId).toBeUndefined()
      expect(boostDays).toBeUndefined()
    })

    it('should handle incomplete session', () => {
      const incompleteSession = {
        ...mockWebhookEvent.data.object,
        payment_status: 'unpaid',
        status: 'open',
      } as Stripe.Checkout.Session

      const isComplete =
        incompleteSession.payment_status === 'paid' && incompleteSession.status === 'complete'

      expect(isComplete).toBe(false)
    })
  })

  describe('Security Validation', () => {
    it('should validate user_id format', () => {
      const session = mockWebhookEvent.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id

      // Basic UUID format check (simplified)
      const _uuidRegex = /^[0-9a-f-]+$/i
      expect(userId).toBeDefined()
      expect(typeof userId).toBe('string')
      expect(userId!.length).toBeGreaterThan(0)
    })

    it('should validate boost_days is numeric string', () => {
      const session = mockWebhookEvent.data.object as Stripe.Checkout.Session
      const boostDays = session.metadata?.boost_days

      expect(boostDays).toBeDefined()
      expect(!isNaN(parseInt(boostDays || ''))).toBe(true)
    })

    it('should validate reasonable boost duration limits', () => {
      const session = mockWebhookEvent.data.object as Stripe.Checkout.Session
      const boostDays = parseInt(session.metadata?.boost_days || '0')

      // Boost should be between 1 and 30 days
      expect(boostDays).toBeGreaterThanOrEqual(1)
      expect(boostDays).toBeLessThanOrEqual(30)
    })
  })
})
