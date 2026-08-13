const { createClient } = require('@supabase/supabase-js')

const LANDING_PAGE_URL = 'https://lp.yankovich-lawfirm.com/Debts'
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

function clean(value) {
  const str = String(value || '').trim()
  return str || null
}

async function notifyMake(payload) {
  if (!MAKE_WEBHOOK_URL) return
  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[lead] make webhook error:', err.message)
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body || {}

  const name  = clean(body.name)
  const phone = clean(body.phone)

  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' })
  }

  const companyId = process.env.CRM_COMPANY_ID
  if (!companyId) {
    console.error('[lead] CRM_COMPANY_ID not set')
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const customFields = {
    landing_page: LANDING_PAGE_URL,
    lead_source:  clean(body.lead_source),
    utm_source:   clean(body.utm_source),
    utm_medium:   clean(body.utm_medium),
    utm_campaign: clean(body.utm_campaign),
    utm_content:  clean(body.utm_content),
    utm_term:     clean(body.utm_term),
    fbclid:       clean(body.fbclid),
    submitted_at: new Date().toISOString(),
  }

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('leads')
    .insert({
      company_id:    companyId,
      name,
      phone,
      email:         clean(body.email),
      city:          clean(body.city),
      notes:         clean(body.message),
      source:        'landing_page',
      status:        'new',
      custom_fields: customFields,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[lead] insert error:', error.message)
    return res.status(500).json({ error: 'Failed to save lead' })
  }

  await notifyMake({
    lead_id:      data.id,
    name,
    phone,
    email:        clean(body.email),
    city:         clean(body.city),
    message:      clean(body.message),
    source:       'landing_page',
    lead_source:  clean(body.lead_source),
    landing_page: LANDING_PAGE_URL,
    submitted_at: customFields.submitted_at,
  })

  console.log('[lead] inserted:', data.id)
  return res.status(201).json({ status: 'ok', id: data.id })
}
