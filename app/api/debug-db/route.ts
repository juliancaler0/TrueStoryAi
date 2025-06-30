import { NextResponse } from 'next/server'
import { getDbConnection } from '@/lib/database'

export async function GET() {
  try {
    console.log('Debug: Testing various database queries...')
    const pool = await getDbConnection()
    
    // Test different queries to find views
    const queries = [
      {
        name: "INFORMATION_SCHEMA.VIEWS",
        query: "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS"
      },
      {
        name: "sys.views",
        query: "SELECT s.name as schema_name, v.name as view_name FROM sys.views v INNER JOIN sys.schemas s ON v.schema_id = s.schema_id"
      },
      {
        name: "All schemas",
        query: "SELECT name FROM sys.schemas ORDER BY name"
      },
      {
        name: "All objects in DWH",
        query: "SELECT s.name as schema_name, o.name as object_name, o.type_desc FROM sys.objects o INNER JOIN sys.schemas s ON o.schema_id = s.schema_id WHERE o.type IN ('V', 'U') ORDER BY s.name, o.type_desc, o.name"
      }
    ]
    
    const results: any = {}
    
    for (const test of queries) {
      try {
        const result = await pool.request().query(test.query)
        results[test.name] = {
          success: true,
          count: result.recordset.length,
          data: result.recordset.slice(0, 10) // First 10 results
        }
      } catch (error) {
        results[test.name] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database debug information',
      results
    })
  } catch (error) {
    console.error('Database debug failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database debug failed'
    }, { status: 500 })
  }
}