const Stripe = require('stripe')

async function main() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.error('Missing STRIPE_SECRET_KEY')
    process.exit(1)
  }
  const stripe = new Stripe(key)
  const id = process.argv[2]
  if (!id) {
    console.error('Usage: node scripts/test-stripe-confirm.js <payment_intent_id>')
    process.exit(1)
  }
  const current = await stripe.paymentIntents.retrieve(id)
  console.log('Current status:', current.status)
  try {
    const confirmed = await stripe.paymentIntents.confirm(id)
    console.log('Confirm status:', confirmed.status)
  } catch (e) {
    console.log('Confirm error code:', e.code)
    // Re-check status
    const check = await stripe.paymentIntents.retrieve(id)
    console.log('Re-check status:', check.status)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

