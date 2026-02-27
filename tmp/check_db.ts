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

async function checkTable() {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('products').select('*').limit(1)

    if (error) {
        console.log('Table "products" error:', error.message)
        if (error.message.includes('not found')) {
            console.log('TABLE_MISSING')
        }
    } else {
        console.log('Table "products" exists.')
    }
}

checkTable()
