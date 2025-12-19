const { Pool } = require('pg')

let pool
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.NEON_CONNECTION_STRING || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  }
  return pool
}

exports.handler = async (event) => {
  const pool = getPool()
  try {
    // Basic API secret protection: if API_SECRET is set in environment,
    // require clients to send it in the `x-api-key` header for mutating requests.
    const needsAuth = ['POST', 'DELETE']
    if (needsAuth.includes(event.httpMethod)) {
      const apiSecret = process.env.API_SECRET
      if (apiSecret) {
        const provided = (event.headers && (event.headers['x-api-key'] || event.headers['X-API-KEY'])) || ''
        if (provided !== apiSecret) {
          return { statusCode: 401, body: 'Unauthorized' }
        }
      }
    }
    if (event.httpMethod === 'GET') {
      const res = await pool.query('SELECT id, item FROM shopping_list ORDER BY created_at DESC')
      return { statusCode: 200, body: JSON.stringify(res.rows) }
    }

    if (event.httpMethod === 'POST') {
      const { item } = JSON.parse(event.body || '{}')
      if (!item || !item.trim()) {
        return { statusCode: 400, body: 'Invalid item' }
      }
      const insert = await pool.query(
        'INSERT INTO shopping_list (item) VALUES ($1) ON CONFLICT (item) DO NOTHING RETURNING id, item',
        [item.trim()]
      )
      if (insert.rowCount === 0) {
        return { statusCode: 409, body: 'Item already exists' }
      }
      return { statusCode: 201, body: JSON.stringify(insert.rows[0]) }
    }

    if (event.httpMethod === 'DELETE') {
      const { id } = event.queryStringParameters || {}
      if (!id) return { statusCode: 400, body: 'Missing id' }
      await pool.query('DELETE FROM shopping_list WHERE id = $1', [id])
      return { statusCode: 204, body: '' }
    }

    return { statusCode: 405, body: 'Method Not Allowed' }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: 'Server error' }
  }
}
