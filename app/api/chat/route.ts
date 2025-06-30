import { Ollama } from "ollama"
import { NextRequest } from "next/server"
import Fuse from 'fuse.js'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const ollama = new Ollama({ host: 'http://localhost:11434' })

// Database tool functions
async function callDatabaseTool(action: string, params: any = {}) {
  try {
    const response = await fetch(`http://localhost:3000/api/phil-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    return { success: false, error: 'Failed to execute database operation' }
  }
}

// Fuzzy search for view names
function findSimilarViews(searchTerm: string, views: string[], threshold = 0.4) {
  const fuse = new Fuse(views, {
    threshold,
    keys: [''] // Search the string directly
  })
  
  const results = fuse.search(searchTerm)
  return results.map(result => result.item)
}

// Extract potential view names and query intent from user message
function analyzeUserQuery(message: string, availableViews: string[] = []) {
  const lowerMessage = message.toLowerCase()
  
  // Extract potential table/view references with more aggressive matching
  const viewReferences = []
  const words = lowerMessage.split(/\s+/)
  
  // Look for exact view names mentioned first
  for (const view of availableViews) {
    if (lowerMessage.includes(view.toLowerCase())) {
      viewReferences.push(view)
    }
  }
  
  // If no exact matches, do fuzzy matching
  if (viewReferences.length === 0) {
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '')
      if (cleanWord.length > 3) {
        const matches = findSimilarViews(cleanWord, availableViews, 0.6)
        if (matches.length > 0) {
          viewReferences.push(...matches.slice(0, 2)) // Top 2 matches
        }
      }
    }
  }
  
  // Detect query intent patterns
  const queryIntents = []
  
  if (/\b(how many|count|total number|number of)\b/i.test(message)) {
    queryIntents.push('COUNT')
  }
  if (/\b(sum|total|add up)\b/i.test(message)) {
    queryIntents.push('SUM')
  }
  if (/\b(average|avg|mean)\b/i.test(message)) {
    queryIntents.push('AVERAGE')
  }
  if (/\b(show|list|display|get|find|do it|execute|run)\b/i.test(message)) {
    queryIntents.push('SELECT')
  }
  if (/\b(top|first|best|highest|largest)\b/i.test(message)) {
    queryIntents.push('TOP')
  }
  if (/\b(recent|latest|newest|last)\b/i.test(message)) {
    queryIntents.push('RECENT')
  }
  
  return {
    viewReferences: [...new Set(viewReferences)], // Remove duplicates
    queryIntents,
    hasCustomerKeywords: /\b(customer|client|buyer|user)\b/i.test(message),
    hasProductKeywords: /\b(product|item|goods|inventory)\b/i.test(message),
    hasSalesKeywords: /\b(sales|revenue|order|purchase|transaction)\b/i.test(message),
    hasTimeKeywords: /\b(today|yesterday|week|month|year|daily|monthly|yearly)\b/i.test(message)
  }
}

// Enhanced Phil with intelligent tool capabilities
async function processWithTools(messages: any[]) {
  const lastMessage = messages[messages.length - 1]?.content || ""
  
  // Check if user is asking about data/database
  const isDataQuery = /\b(data|database|view|table|query|sql|analytics|report|show|find|search|count|sum|total|revenue|sales|customer|product)\b/i.test(lastMessage)
  
  let toolResults = ""
  
  if (isDataQuery) {
    // Auto-execute database exploration
    console.log("🔍 Phil detected data query, exploring database...")
    console.log("🔍 User message:", lastMessage)
    
    // Get available views
    const viewsResult = await callDatabaseTool('listViews')
    console.log("🔍 Views result:", viewsResult)
    if (viewsResult.success && viewsResult.views) {
      const availableViews = viewsResult.views
      
      // Analyze user query for intent and view references  
      const analysis = analyzeUserQuery(lastMessage, availableViews)
      console.log("🧠 Query Analysis:", analysis)
      
      toolResults += `\n\n🧠 QUERY ANALYSIS:\n`
      toolResults += `User Message: "${lastMessage}"\n`
      toolResults += `Intent detected: ${analysis.queryIntents.join(', ') || 'General inquiry'}\n`
      
      if (analysis.viewReferences.length > 0) {
        toolResults += `Relevant views found: ${analysis.viewReferences.join(', ')}\n`
      } else {
        toolResults += `No specific views mentioned - will use contextual matching\n`
      }
      
      const keywordContext = []
      if (analysis.hasCustomerKeywords) keywordContext.push('Customer data')
      if (analysis.hasProductKeywords) keywordContext.push('Product data')  
      if (analysis.hasSalesKeywords) keywordContext.push('Sales data')
      if (analysis.hasTimeKeywords) keywordContext.push('Time-based analysis')
      
      if (keywordContext.length > 0) {
        toolResults += `Context: ${keywordContext.join(', ')}\n`
      }
      
      toolResults += `\n📊 AVAILABLE VIEWS:\n${availableViews.join(', ')}\n`
      if (viewsResult.debugInfo) {
        toolResults += `🔧 Debug: ${viewsResult.debugInfo}\n`
      }
      
      // Prioritize views based on analysis
      let viewsToExplore = analysis.viewReferences.length > 0 
        ? analysis.viewReferences 
        : availableViews.slice(0, 3)
      
      // If no specific matches but has context keywords, try to find relevant views
      if (analysis.viewReferences.length === 0) {
        if (analysis.hasCustomerKeywords) {
          const customerViews = findSimilarViews('customer', availableViews, 0.5)
          viewsToExplore = customerViews.slice(0, 2)
        } else if (analysis.hasProductKeywords) {
          const productViews = findSimilarViews('product', availableViews, 0.5)
          viewsToExplore = productViews.slice(0, 2)
        } else if (analysis.hasSalesKeywords) {
          const salesViews = findSimilarViews('sales', availableViews, 0.5)
          viewsToExplore = salesViews.slice(0, 2)
        }
      }
      
      // Get schemas for relevant views
      for (const viewName of viewsToExplore) {
        const schemaResult = await callDatabaseTool('describeView', { tableName: viewName })
        if (schemaResult.success) {
          toolResults += `\n📋 VIEW: ${viewName}\n`
          toolResults += `Columns: ${schemaResult.schema?.map((col: any) => `${col.COLUMN_NAME} (${col.DATA_TYPE})`).join(', ') || 'None'}\n`
          if (schemaResult.debugInfo) {
            toolResults += `🔧 Debug: ${schemaResult.debugInfo}\n`
          }
        }
      }
      
      // Execute suggested query if we can infer one
      if (analysis.viewReferences.length > 0 && analysis.queryIntents.length > 0) {
        const primaryView = analysis.viewReferences[0]
        let suggestedQuery = ""
        
        if (analysis.queryIntents.includes('COUNT')) {
          suggestedQuery = `SELECT COUNT(*) as Total_Count FROM ${primaryView}`
        } else if (analysis.queryIntents.includes('SELECT')) {
          suggestedQuery = `SELECT * FROM ${primaryView}`
        } else if (analysis.queryIntents.includes('TOP')) {
          suggestedQuery = `SELECT TOP 10 * FROM ${primaryView}`
        }
        
        if (suggestedQuery) {
          toolResults += `\n🔮 EXECUTING SUGGESTED QUERY:\n${suggestedQuery}\n`
          const queryResult = await callDatabaseTool('query', { query: suggestedQuery })
          if (queryResult.success) {
            toolResults += `✅ Query Results: ${queryResult.rowCount} rows returned\n`
            if (queryResult.debugInfo) {
              toolResults += `🔧 Debug: ${queryResult.debugInfo}\n`
            }
            
            // Include sample of results for context
            if (queryResult.data && queryResult.data.length > 0) {
              toolResults += `📄 Sample Results: ${JSON.stringify(queryResult.data.slice(0, 3), null, 2)}\n`
            }
          }
        }
      }
    }
  }
  
  return toolResults
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Get database context if needed
    const toolResults = await processWithTools(messages)
    console.log("🔍 Tool results for system prompt:", toolResults)

    const systemPrompt = toolResults 
      ? `You are Phil, an intelligent AI agent for TrueStory.ai with REAL ACCESS to a SQL Server database (vf-dwh/DWH).

🔥 CRITICAL: YOU HAVE REAL DATABASE ACCESS AND REAL DATA!

I have already executed database operations for you and the results are provided below. This is NOT hypothetical - this is actual data from the live database.

YOUR ENHANCED CAPABILITIES (ALREADY EXECUTED):
1. **FUZZY VIEW MATCHING**: I matched your query to actual database views
2. **QUERY INTENT ANALYSIS**: I analyzed what you're asking for
3. **CONTEXTUAL EXPLORATION**: I explored relevant views for your question  
4. **AUTO-EXECUTION**: I executed actual SQL queries and got real results
5. **FULL SELECT ACCESS**: I can execute unlimited SELECT * queries (no TOP restrictions unless specifically requested)

🎯 YOUR TASK: Use the real database results I provide below to answer the user's question with actual data and numbers.

⚡ IMPORTANT EXECUTION RULES:
- If I executed a query and show results, use those EXACT results
- If I show "EXECUTING SUGGESTED QUERY", those results are REAL
- Always reference the specific view and query I used
- Give the actual count, data, or insights from the results

DO NOT SAY:
- "I cannot access real-time data"
- "I cannot retrieve data" 
- "I can guide you on how to find this"
- "Here's how you can write a query" (I already executed it!)
- "I'll limit results to TOP 1000" (unless specifically requested)

INSTEAD SAY:
- "I executed: [SQL query] and found [X] records"
- "Based on the query results from [view name]..."
- "The actual count is [number] customers"
- "I queried [specific view] and the data shows..."

REAL DATABASE RESULTS PROVIDED BELOW:
${toolResults}

🚨 CRITICAL: If you see "EXECUTING SUGGESTED QUERY" above, I already ran the query! Use those results directly - don't suggest writing queries.`
      : `You are Phil, an intelligent AI agent for TrueStory.ai.

Hi! I'm Phil, your TrueStory assistant. I'm here to help with a variety of tasks:

🔍 **General Assistance**: I can help with questions, explanations, analysis, and conversations
📊 **Database Analysis**: When you ask about data, customers, sales, or business metrics, I can access our SQL Server database to provide real insights
🧠 **Intelligent Research**: I can help you understand information, solve problems, and provide recommendations

I have access to real business data when needed, but I'm also here for general conversations and assistance. How can I help you today?

**Note**: This conversation is for general assistance. If you ask about data, customers, sales, or business metrics, I'll automatically connect to our database to provide real insights.`

    // Format messages for Ollama
    const ollamaMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    const response = await ollama.chat({
      model: 'llama3.2:1b',
      messages: ollamaMessages,
      stream: true,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      }
    })

    // Create a streaming response compatible with useChat
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of response) {
            if (part.message?.content) {
              // Format as AI SDK expects
              const chunk = encoder.encode(`0:"${part.message.content.replace(/"/g, '\\"')}"\n`)
              controller.enqueue(chunk)
            }
          }
          // End the stream
          controller.enqueue(encoder.encode('d:\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}