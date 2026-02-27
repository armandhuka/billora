import { createAdminClient } from '../lib/supabase/admin'
import fs from 'fs'
import path from 'path'

// Custom env loader
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8')
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=')
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
            }
        })
    }
}

loadEnv()

async function checkTables() {
    const supabase = createAdminClient()
    const tables = ['customers', 'products', 'invoices', 'invoice_items']

    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
            console.log(`Table "${table}" result: ${error.message}`)
        } else {
            console.log(`Table "${table}" exists.`)
        }
    }
}

checkTables()
