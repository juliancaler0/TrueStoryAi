import sql from 'mssql'

const config: sql.config = {
  server: 'vf-dwh',
  database: 'DWH',
  user: 'powerbi',
  password: 'VFSesam@!',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

let pool: sql.ConnectionPool | null = null

export async function getDbConnection() {
  try {
    if (!pool || !pool.connected) {
      if (pool) {
        try {
          await pool.close()
        } catch (e) {
          // Ignore close errors
        }
      }
      pool = new sql.ConnectionPool(config)
      await pool.connect()
      console.log('Database connected successfully')
      
      // Handle connection errors
      pool.on('error', (err) => {
        console.error('Database pool error:', err)
        pool = null
      })
    }
    return pool
  } catch (error) {
    console.error('Database connection failed:', error)
    pool = null
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function executeQuery(query: string) {
  try {
    // Ensure query is read-only by checking for prohibited keywords
    const prohibitedKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 'EXEC', 'EXECUTE']
    const upperQuery = query.toUpperCase()
    
    for (const keyword of prohibitedKeywords) {
      if (upperQuery.includes(keyword)) {
        throw new Error(`Operation not allowed: ${keyword}. This interface is read-only.`)
      }
    }
    
    const pool = await getDbConnection()
    const result = await pool.request().query(query)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getViews() {
  const query = `
    SELECT 
      s.name as SCHEMA_NAME,
      v.name as VIEW_NAME,
      'VIEW' as OBJECT_TYPE
    FROM sys.views v
    INNER JOIN sys.schemas s ON v.schema_id = s.schema_id
    ORDER BY s.name, v.name
  `
  return await executeQuery(query)
}

export async function getTables() {
  const query = `
    SELECT 
      TABLE_SCHEMA,
      TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE'
    AND TABLE_SCHEMA = 'dbo'
    ORDER BY TABLE_NAME
  `
  return await executeQuery(query)
}

export async function getTableSchema(tableName: string) {
  const query = `
    SELECT 
      COLUMN_NAME,
      DATA_TYPE,
      IS_NULLABLE,
      COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = @tableName
    AND TABLE_SCHEMA = 'dbo'
    ORDER BY ORDINAL_POSITION
  `
  const pool = await getDbConnection()
  const result = await pool.request()
    .input('tableName', sql.NVarChar, tableName)
    .query(query)
  return result
}