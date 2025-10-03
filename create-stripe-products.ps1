# Create Stripe Products and Prices
$stripeKey = "sk_test_51QZ8XqP7XGvKbsOm9J4k"

# Minecraft Plans
$minecraftPlans = @(
    @{name="Minecraft 1GB"; plan_id="mc-1gb"; price=500; ram=1},
    @{name="Minecraft 2GB"; plan_id="mc-2gb"; price=1000; ram=2},
    @{name="Minecraft 4GB"; plan_id="mc-4gb"; price=2000; ram=4},
    @{name="Minecraft 8GB"; plan_id="mc-8gb"; price=4000; ram=8}
)

# Rust Plans  
$rustPlans = @(
    @{name="Rust 2GB"; plan_id="rust-2gb"; price=1000; ram=2},
    @{name="Rust 4GB"; plan_id="rust-4gb"; price=2000; ram=4},
    @{name="Rust 8GB"; plan_id="rust-8gb"; price=4000; ram=8},
    @{name="Rust 16GB"; plan_id="rust-16gb"; price=8000; ram=16}
)

# Palworld Plans
$palworldPlans = @(
    @{name="Palworld 4GB"; plan_id="palworld-4gb"; price=2000; ram=4},
    @{name="Palworld 8GB"; plan_id="palworld-8gb"; price=4000; ram=8},
    @{name="Palworld 16GB"; plan_id="palworld-16gb"; price=8000; ram=16}
)

$allPlans = $minecraftPlans + $rustPlans + $palworldPlans

foreach ($plan in $allPlans) {
    Write-Host "Creating product: $($plan.name)"
    
    # Create product
    $productBody = @{
        name = $plan.name
        description = "Game server hosting - $($plan.ram)GB RAM"
        metadata = @{
            plan_id = $plan.plan_id
            game_type = if ($plan.plan_id -like "mc-*") { "minecraft" } elseif ($plan.plan_id -like "rust-*") { "rust" } else { "palworld" }
            ram_gb = $plan.ram
        }
    } | ConvertTo-Json -Depth 3
    
    $productResponse = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products" -Method Post -Headers @{
        "Authorization" = "Bearer $stripeKey"
        "Content-Type" = "application/x-www-form-urlencoded"
    } -Body $productBody
    
    $productId = $productResponse.id
    Write-Host "Created product: $productId"
    
    # Create monthly price
    $priceBody = @{
        product = $productId
        unit_amount = $plan.price * 100  # Convert to cents
        currency = "usd"
        recurring = @{
            interval = "month"
        }
    } | ConvertTo-Json -Depth 3
    
    $priceResponse = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" -Method Post -Headers @{
        "Authorization" = "Bearer $stripeKey"
        "Content-Type" = "application/x-www-form-urlencoded"
    } -Body $priceBody
    
    $priceId = $priceResponse.id
    Write-Host "Created monthly price: $priceId"
    
    # Create yearly price (20% discount)
    $yearlyPrice = [math]::Round($plan.price * 12 * 0.8)
    $yearlyPriceBody = @{
        product = $productId
        unit_amount = $yearlyPrice * 100
        currency = "usd"
        recurring = @{
            interval = "year"
        }
    } | ConvertTo-Json -Depth 3
    
    $yearlyPriceResponse = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" -Method Post -Headers @{
        "Authorization" = "Bearer $stripeKey"
        "Content-Type" = "application/x-www-form-urlencoded"
    } -Body $yearlyPriceBody
    
    $yearlyPriceId = $yearlyPriceResponse.id
    Write-Host "Created yearly price: $yearlyPriceId"
    
    Write-Host "Plan: $($plan.plan_id) - Monthly: $priceId, Yearly: $yearlyPriceId"
    Write-Host "---"
}
