// Script to create Stripe products and prices
// Run this with: node create-stripe-products.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const plans = [
  // Minecraft Plans
  { id: 'mc-1gb', name: 'Minecraft 1GB', price: 3.99, description: 'Perfect for small groups and testing' },
  { id: 'mc-2gb', name: 'Minecraft 2GB', price: 6.99, description: 'Great for friends and small communities' },
  { id: 'mc-4gb', name: 'Minecraft 4GB', price: 13.99, description: 'Ideal for medium-sized servers with mods' },
  { id: 'mc-8gb', name: 'Minecraft 8GB', price: 27.99, description: 'Perfect for large communities and heavy modpacks' },
  
  // Rust Plans
  { id: 'rust-3gb', name: 'Rust 3GB', price: 8.99, description: 'Small survival servers, 50-100 players' },
  { id: 'rust-6gb', name: 'Rust 6GB', price: 16.99, description: 'Medium servers with plugins, 100-200 players' },
  { id: 'rust-8gb', name: 'Rust 8GB', price: 24.99, description: 'Large servers with mods, 200-300 players' },
  { id: 'rust-12gb', name: 'Rust 12GB', price: 36.99, description: 'High-pop servers with extensive mods, 300+ players' },
  
  // Palworld Plans
  { id: 'palworld-4gb', name: 'Palworld 4GB', price: 11.99, description: 'Small co-op sessions (2-4 players)' },
  { id: 'palworld-8gb', name: 'Palworld 8GB', price: 23.99, description: 'Medium multiplayer servers (8-16 players)' },
  { id: 'palworld-16gb', name: 'Palworld 16GB', price: 47.99, description: 'Large dedicated servers (32+ players)' }
];

async function createProducts() {
  console.log('Creating Stripe products and prices...\n');
  
  for (const plan of plans) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          plan_id: plan.id,
          game_type: plan.id.split('-')[0]
        }
      });
      
      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          plan_id: plan.id
        }
      });
      
      console.log(`✅ ${plan.name}:`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Price ID: ${price.id}`);
      console.log(`   Plan ID: ${plan.id}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error creating ${plan.name}:`, error.message);
    }
  }
  
  console.log('Done! Copy the Price IDs to update your database.');
}

createProducts().catch(console.error);
