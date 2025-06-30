import { NextResponse } from 'next/server'
import { getDbConnection } from '@/lib/database'

export async function GET() {
  try {
    console.log('Testing database connection...')
    const pool = await getDbConnection()
    const result = await pool.request().query('SELECT 1 as test')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      testResult: result.recordset
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database connection failed'
    }, { status: 500 })
  }
}