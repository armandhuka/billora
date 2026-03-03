import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xygrjrqvfxuytkeupdlt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Z3JqcnF2Znh1eXRrZXVwZGx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkwNjk3NSwiZXhwIjoyMDg3NDgyOTc1fQ.gSMStxsHImQTm7ihSumvxO4eQhHeq71v9ozB5f3UOPU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    console.log("--- Checking Databases ---")

    // Check Invoices
    const { data: invoices, error: invErr } = await supabase.from('invoices').select('id, business_id, total_amount, created_at').limit(5)
    console.log("Sample Invoices:", invoices)
    if (invErr) console.error("Invoices Error:", invErr)

    // Check Purchases
    const { data: purchases, error: purErr } = await supabase.from('purchases').select('id, business_id, total_amount, created_at').limit(5)
    console.log("Sample Purchases:", purchases)
    if (purErr) console.error("Purchases Error:", purErr)

    // Check Expenses
    const { data: expenses, error: expErr } = await supabase.from('expenses').select('id, business_id, amount, created_at').limit(5)
    console.log("Sample Expenses:", expenses)
    if (expErr) console.error("Expenses Error:", expErr)

    // Check Products
    const { data: products, error: prodErr } = await supabase.from('products').select('id, business_id, name, stock_quantity').limit(5)
    console.log("Sample Products:", products)
    if (prodErr) console.error("Products Error:", prodErr)

    // Check Users/Auth (metadata only)
    const { data: { users }, error: userErr } = await supabase.auth.admin.listUsers()
    console.log("Auth Users Count:", users?.length)
    if (users && users.length > 0) {
        console.log("First User ID:", users[0].id)
        console.log("First User Email:", users[0].email)
    }
}

debug()
