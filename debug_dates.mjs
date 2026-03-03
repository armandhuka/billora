import { createClient } from '@supabase/supabase-js'
import { startOfMonth, endOfMonth } from 'date-fns'

const supabaseUrl = 'https://xygrjrqvfxuytkeupdlt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Z3JqcnF2Znh1eXRrZXVwZGx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkwNjk3NSwiZXhwIjoyMDg3NDgyOTc1fQ.gSMStxsHImQTm7ihSumvxO4eQhHeq71v9ozB5f3UOPU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDateRange() {
    const now = new Date()
    const start = startOfMonth(now).toISOString()
    const end = endOfMonth(now).toISOString()
    const userId = '22c4724b-3342-49c9-a7ba-1b550bf8adb6'

    console.log("Range:", { start, end })

    const { data: q1 } = await supabase.from('invoices').select('id, created_at').eq('business_id', userId).gte('created_at', start).lte('created_at', end)
    console.log("Invoices in range:", q1?.length)
    if (q1) console.log("Sample Invoice Dates:", q1.map(i => i.created_at))

    const { data: q2 } = await supabase.from('purchases').select('id, created_at').eq('business_id', userId).gte('created_at', start).lte('created_at', end)
    console.log("Purchases in range:", q2?.length)

    const { data: q3 } = await supabase.from('expenses').select('id, created_at').eq('business_id', userId).gte('created_at', start).lte('created_at', end)
    console.log("Expenses in range:", q3?.length)

    // Total count without date filter
    const { count: totalCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('business_id', userId)
    console.log("Total Invoices for user (no dates):", totalCount)
}

checkDateRange()
