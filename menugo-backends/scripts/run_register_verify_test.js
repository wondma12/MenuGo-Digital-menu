require('dotenv').config()
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

const rawRoot = (process.env.API_URL || process.env.API_ROOT || 'https://menugo-saas-digital-menu-api.onrender.com').replace(/\/$/, '')
const API_ROOT = rawRoot.replace(/\/api$/i, '')

;(async () => {
  try {
    const testEmail = `test+${Date.now()}@example.com`
    const payload = {
      email: testEmail,
      password: 'TestPass123!',
      full_name: 'Auto Tester',
      phone: '0000000000',
      role: 'restaurant_admin',
      restaurant_name: `AutoTest-${uuidv4()}`,
      subscription_plan: 'monthly',
      restaurant_address: '123 Test St',
      restaurant_city: 'Testville',
      restaurant_country: 'Nowhere',
    }

    console.log('Posting register to', `${API_ROOT}/api/auth/register`)
    const regResp = await axios.post(`${API_ROOT}/api/auth/register`, payload, { timeout: 180000 })
    console.log('Register response status:', regResp.status)
    console.log('Register response data:', JSON.stringify(regResp.data).slice(0, 1000))

    // Attempt verify without token
    const restaurantId = regResp?.data?.data?.restaurant?.id || (regResp?.data?.restaurant?.id)
    console.log('Detected restaurantId:', restaurantId)
    if (!restaurantId) {
      console.log('No restaurantId in response; cannot call verify endpoint reliably. Exiting.')
      return
    }

    try {
      console.log('Calling verify endpoint without auth...')
      const verifyResp = await axios.post(`${API_ROOT}/api/restaurants/${restaurantId}/verify`, { is_verified: true }, { timeout: 20000 })
      console.log('Verify response (unauth) status:', verifyResp.status)
      console.log('Verify response data:', JSON.stringify(verifyResp.data))
    } catch (ve) {
      if (ve.response) {
        console.log('Verify response status (expected unauth):', ve.response.status)
        console.log('Verify response data:', JSON.stringify(ve.response.data))
      } else {
        console.error('Verify request failed without response:', ve.message)
      }
    }

  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.status, JSON.stringify(err.response.data))
    } else {
      console.error('Request error:', err.message)
    }
  }
})()
