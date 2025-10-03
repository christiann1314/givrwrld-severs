# Get Price IDs for existing Stripe products
$stripeKey = "sk_test_51QZ8XqP7XGvKbsOm9J4k"

# Product IDs you provided earlier
$productIds = @(
    "prod_T7XGMfa2DsR0cr",
    "prod_T7XGh1voEEwVOE", 
    "prod_T7XGCpVghY55gL",
    "prod_T7XGkJHHMI9mkW",
    "prod_T7XGvMgPDosjOJ",
    "prod_T7XGKbqLzJk5Pg",
    "prod_T7XGIUGkmQh4EL",
    "prod_T7XG4d4Yt6KGfY",
    "prod_T7XG1xOCjmdrdf",
    "prod_T7XGwBpqzceu3G",
    "prod_T7XG03d4hqOUPk",
    "prod_T7XGaa8uOn3Ksd",
    "prod_T7XGkgfdftBgsV",
    "prod_T7XGpRq16DyC7C",
    "prod_T7Xis5MdwjiIW",
    "prod_T7XGvKbsOm9J4k",
    "prod_T7XFh6or6Pg40e",
    "prod_T7XFzzrkkAFcfn",
    "prod_T7XFqwUEyY1fDt",
    "prod_T7XCbtiiah3SgO"
)

Write-Host "Getting price IDs for existing products..."

foreach ($productId in $productIds) {
    try {
        $response = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products/$productId" -Method Get -Headers @{
            "Authorization" = "Bearer $stripeKey"
        }
        
        Write-Host "Product: $($response.name) (ID: $productId)"
        
        # Get prices for this product
        $pricesResponse = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices?product=$productId" -Method Get -Headers @{
            "Authorization" = "Bearer $stripeKey"
        }
        
        foreach ($price in $pricesResponse.data) {
            $interval = $price.recurring.interval
            $amount = [math]::Round($price.unit_amount / 100, 2)
            Write-Host "  - $interval`: $($price.id) ($$amount)"
        }
        Write-Host "---"
    }
    catch {
        Write-Host "Error getting product $productId : $($_.Exception.Message)"
    }
}
