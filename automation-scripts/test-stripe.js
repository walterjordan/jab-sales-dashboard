const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "EdgeMax AI CORE" },
          unit_amount: 199 * 100,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: "https://jab-sales.com/success",
      cancel_url: "https://jab-sales.com/cancel",
      customer_email: "unknown",
    });
    console.log(session.url);
  } catch (err) {
    console.error(err.message);
  }
}
test();