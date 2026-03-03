import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xygrjrqvfxuytkeupdlt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Z3JqcnF2Znh1eXRrZXVwZGx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkwNjk3NSwiZXhwIjoyMDg3NDgyOTc1fQ.gSMStxsHImQTm7ihSumvxO4eQhHeq71v9ozB5f3UOPU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    console.log("--- Checking Schema and RLS ---")

    // Check columns and types for invoices
    const { data: columns, error: colErr } = await supabase.rpc('get_table_info', { t_name: 'invoices' })
    if (colErr) {
        // Fallback: use a raw query if RPC isn't available
        const { data: info, error: infoErr } = await supabase.from('invoices').select('*').limit(1)
        if (info && info.length > 0) {
            console.log("Invoices first row keys:", Object.keys(info[0]))
        }
    } else {
        console.log("Invoices columns:", columns)
    }

    // Check RLS policies
    const { data: policies, error: polErr } = await supabase.rpc('get_policies', { t_name: 'invoices' })
    console.log("RLS Policies (Invoices):", policies || "Query failed or no policies")
    if (polErr) console.error("Policies Error:", polErr)

    // Check if business_id is actually a UUID or text
    const { data: meta } = await supabase.from('invoices').select('business_id').limit(1)
    if (meta && meta[0]) {
        console.log("business_id value type:", typeof meta[0].business_id)
        console.log("business_id value:", meta[0].business_id)
    }
}

checkSchema()
