import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, getViews, getTableSchema } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, action, tableName } = body

    console.log(`Phil API called with action: ${action}`)

    switch (action) {
      case 'query':
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }
        
        // Additional safety check for Phil's queries
        const safeQuery = query.trim()
        if (!safeQuery.toUpperCase().startsWith('SELECT')) {
          return NextResponse.json({ 
            error: 'Only SELECT queries are allowed for Phil' 
          }, { status: 400 })
        }

        console.log(`Phil executing query: ${safeQuery}`)
        const result = await executeQuery(safeQuery)
        
        return NextResponse.json({ 
          success: true, 
          data: result.recordset,
          rowCount: result.recordset.length,
          message: `Query executed successfully. ${result.recordset.length} rows returned.`,
          debugInfo: `🔍 Executing SQL query... ✅ Query completed successfully. 📊 Retrieved ${result.recordset.length} rows from database.`
        })

      case 'listViews':
        console.log('Phil requesting views list...')
        const views = await getViews()
        return NextResponse.json({ 
          success: true, 
          views: views.recordset.map(v => v.VIEW_NAME || v.TABLE_NAME),
          message: `Found ${views.recordset.length} views available for querying.`,
          debugInfo: `🔍 Connecting to database... ✅ Connected successfully. 👁️ Retrieved ${views.recordset.length} views from database.`
        })

      case 'describeView':
        if (!tableName) {
          return NextResponse.json({ error: 'View name is required' }, { status: 400 })
        }
        console.log(`Phil requesting schema for view: ${tableName}`)
        const schema = await getTableSchema(tableName)
        return NextResponse.json({ 
          success: true, 
          schema: schema.recordset,
          message: `Schema retrieved for view: ${tableName}`,
          debugInfo: `🔍 Analyzing view structure for "${tableName}"... ✅ Found ${schema.recordset.length} columns with data types and constraints.`
        })

      case 'sampleData':
        if (!tableName) {
          return NextResponse.json({ error: 'View name is required' }, { status: 400 })
        }
        console.log(`Phil requesting sample data from view: ${tableName}`)
        const sampleQuery = `SELECT TOP 5 * FROM ${tableName}`
        const sampleResult = await executeQuery(sampleQuery)
        return NextResponse.json({ 
          success: true, 
          data: sampleResult.recordset,
          message: `Sample data from view ${tableName} (first 5 rows)`,
          debugInfo: `🔍 Executing: SELECT TOP 5 * FROM ${tableName}... ✅ Query completed. Retrieved ${sampleResult.recordset.length} sample records.`
        })

      default:
        return NextResponse.json({ error: 'Invalid action for Phil API' }, { status: 400 })
    }
  } catch (error) {
    console.error('Phil API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error'
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      message: 'I encountered an error while querying the database.'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Phil Database API is running',
    availableActions: ['query', 'listViews', 'describeView', 'sampleData'],
    description: 'Read-only database view access for Phil AI Assistant'
  })
}