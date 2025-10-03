// Script to get Price IDs for existing Stripe products
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const productIds = [
  'prod_T7XGMfa2DsR0cr',
  'prod_T7XGh1voEEwVOE', 
  'prod_T7XGCpVghY55gL',
  'prod_T7XGkJHHMI9mkW',
  'prod_T7XGvMgPDosjOJ',
  'prod_T7XGKbqLzJk5Pg',
  'prod_T7XGIUGkmQh4EL',
  'prod_T7XG4d4Yt6KGfY',
  'prod_T7XG1xOCjmdrdf',
  'prod_T7XGwBpqzceu3G',
  'prod_T7XG03d4hqOUPk',
  'prod_T7XGaa8uOn3Ksd',
  'prod_T7XGkgfdftBgsV',
  'prod_T7XGpRq16DyC7C',
  'prod_T7XGis5MdwjiIW',
  'prod_T7XGvKbsOm9J4k',
  'prod_T7XFh6or6Pg40e',
  'prod_T7XFzzrkkAFcfn',
  'prod_T7XFqwUEyY1fDt',
  'prod_T7XCbtiiah3SgO'
];

async function getPriceIds() {
  console.log('Getting Price IDs for existing products...\n');
  
  for (const productId of productIds) {
    try {
      // Get product details
      const product = await stripe.products.retrieve(productId);
      
      // Get prices for this product
      const prices = await stripe.prices.list({
        product: productId,
        active: true
      });
      
      console.log(`📦 ${product.name} (${productId}):`);
      console.log(`   Description: ${product.description || 'No description'}`);
      
      if (prices.data.length > 0) {
        for (const price of prices.data) {
          const amount = (price.unit_amount / 100).toFixed(2);
          console.log(`   💰 Price ID: ${price.id} - $${amount}/${price.recurring?.interval || 'one-time'}`);
        }
      } else {
        console.log(`   ❌ No prices found for this product`);
      }
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error getting product ${productId}:`, error.message);
    }
  }
}

getPriceIds().catch(console.error);
