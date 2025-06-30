import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, getViews, getTables, getTableSchema } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, query, tableName } = body

    console.log(`MCP API called with action: ${action}`)

    switch (action) {
      case 'execute':
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }
        console.log(`Executing query: ${query}`)
        const result = await executeQuery(query)
        return NextResponse.json({ 
          success: true, 
          data: result.recordset,
          rowsAffected: result.rowsAffected 
        })

      case 'getViews':
        console.log('Getting views...')
        const views = await getViews()
        return NextResponse.json({ 
          success: true, 
          data: views.recordset || [] 
        })

      case 'getTables':
        console.log('Getting tables...')
        const tables = await getTables()
        return NextResponse.json({ 
          success: true, 
          data: tables.recordset || [] 
        })

      case 'getSchema':
        if (!tableName) {
          return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
        }
        console.log(`Getting schema for table: ${tableName}`)
        const schema = await getTableSchema(tableName)
        return NextResponse.json({ 
          success: true, 
          data: schema.recordset || [] 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('MCP API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error'
    
    // Check if it's a connection error
    if (errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot connect to database server. Please check if the SQL Server is accessible and credentials are correct.',
        details: errorMessage
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: 'Database operation failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'MCP Database API is running',
    endpoints: {
      'POST /api/mcp': {
        actions: ['execute', 'getViews', 'getTables', 'getSchema'],
        description: 'SQL Server MCP interface'
      }
    }
  })
}