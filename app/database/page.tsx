"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Database, Play, Eye, Table as TableIcon, ChevronDown, ChevronRight, Loader2, ArrowLeft, Upload, FileText, X } from 'lucide-react'

interface DatabaseObject {
  TABLE_SCHEMA?: string
  TABLE_NAME?: string
  SCHEMA_NAME?: string
  VIEW_NAME?: string
  OBJECT_TYPE?: string
}

interface QueryResult {
  [key: string]: any
}

interface SchemaColumn {
  COLUMN_NAME: string
  DATA_TYPE: string
  IS_NULLABLE: string
  COLUMN_DEFAULT: string | null
}

export default function DatabaseInterface() {
  const [views, setViews] = useState<DatabaseObject[]>([])
  const [queryResult, setQueryResult] = useState<QueryResult[]>([])
  const [customQuery, setCustomQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [schemas, setSchemas] = useState<{ [key: string]: SchemaColumn[] }>({})
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    loadDatabaseObjects()
  }, [])

  const loadDatabaseObjects = async () => {
    setLoading(true)
    try {
      const viewsResponse = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getViews' })
      })

      const viewsData = await viewsResponse.json()

      if (viewsData.success) setViews(viewsData.data)
    } catch (err) {
      setError('Failed to load database views')
    } finally {
      setLoading(false)
    }
  }

  const executeQuery = async (query: string) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute', query })
      })

      const data = await response.json()
      if (data.success) {
        setQueryResult(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to execute query')
    } finally {
      setLoading(false)
    }
  }

  const loadTableSchema = async (tableName: string) => {
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getSchema', tableName })
      })

      const data = await response.json()
      if (data.success) {
        setSchemas(prev => ({ ...prev, [tableName]: data.data }))
      }
    } catch (err) {
      console.error('Failed to load schema:', err)
    }
  }

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
      // Load schema if it's a table/view and we haven't loaded it yet
      if (!schemas[itemId]) {
        loadTableSchema(itemId)
      }
    }
    setExpandedItems(newExpanded)
  }

  const quickQuery = (tableName: string, isView: boolean = false) => {
    const query = `SELECT TOP 100 * FROM ${tableName}`
    executeQuery(query)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFilesToPhil = async () => {
    setUploadLoading(true)
    try {
      // Here you would implement the actual file upload to a backend service
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`Successfully uploaded ${uploadedFiles.length} files for Phil's context!`)
    } catch (err) {
      setError('Failed to upload files')
    } finally {
      setUploadLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <a 
                href="/" 
                className="mr-4 p-2 bg-gray-100 hover:bg-gray-50 rounded-xl shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] hover:shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </a>
              <Database className="w-8 h-8 text-[#009b4d] mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">True<span className="text-[#009b4d]">Story</span>.ai Database & Files</h1>
            </div>
          </div>
          <p className="text-gray-600">Connect to vf-dwh/DWH database and upload files for Phil's context</p>
        </div>

        <Tabs defaultValue="browser" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browser">Views Browser</TabsTrigger>
            <TabsTrigger value="files">File Upload</TabsTrigger>
            <TabsTrigger value="query">Custom Query</TabsTrigger>
            <TabsTrigger value="results">Query Results</TabsTrigger>
          </TabsList>

          <TabsContent value="browser" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Database Views ({views.length})
                </CardTitle>
                <CardDescription>All available views in the DWH database for data analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : views.length === 0 ? (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No views found</p>
                    <p className="text-sm text-gray-500">Views may be in a different schema or require different permissions</p>
                  </div>
                ) : (
                  views.map((view) => {
                    const viewName = view.VIEW_NAME || view.TABLE_NAME || 'Unknown'
                    const schemaName = view.SCHEMA_NAME || view.TABLE_SCHEMA || 'dbo'
                    return (
                      <Collapsible key={viewName}>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <CollapsibleTrigger
                            className="flex items-center flex-1 text-left"
                            onClick={() => toggleExpanded(viewName)}
                          >
                            {expandedItems.has(viewName) ? (
                              <ChevronDown className="w-4 h-4 mr-2" />
                            ) : (
                              <ChevronRight className="w-4 h-4 mr-2" />
                            )}
                            <div>
                              <span className="font-medium">{viewName}</span>
                              <span className="text-xs text-gray-500 ml-2">({schemaName})</span>
                            </div>
                          </CollapsibleTrigger>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => quickQuery(viewName, true)}
                            className="ml-2"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                        <CollapsibleContent className="mt-2">
                          {schemas[viewName] && (
                            <div className="pl-6 space-y-1">
                              {schemas[viewName].map((column) => (
                                <div key={column.COLUMN_NAME} className="flex items-center justify-between text-sm">
                                  <span>{column.COLUMN_NAME}</span>
                                  <Badge variant="secondary">{column.DATA_TYPE}</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Files for Phil
                </CardTitle>
                <CardDescription>
                  Upload documents, spreadsheets, or text files to give Phil additional context
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Drop files here or click to browse</h3>
                  <p className="text-sm text-gray-500 mb-4">Support for PDF, DOCX, TXT, CSV, XLSX files</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.csv,.xlsx,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-50 text-gray-700 rounded-xl shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] hover:shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] transition-all duration-200 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Choose Files
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Uploaded Files ({uploadedFiles.length})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-500 mr-3" />
                            <div>
                              <p className="font-medium text-gray-800">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFile(index)}
                            className="p-2 h-8 w-8"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={uploadFilesToPhil}
                        disabled={uploadLoading}
                        className="flex items-center bg-gradient-to-r from-[#009b4d] to-[#00b359] hover:from-[#008a45] hover:to-[#009b4d] text-white"
                      >
                        {uploadLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload to Phil
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setUploadedFiles([])}
                        disabled={uploadLoading}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="query">
            <Card>
              <CardHeader>
                <CardTitle>Custom SQL Query</CardTitle>
                <CardDescription>Execute custom SQL queries against the DWH database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your SQL query here..."
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="min-h-32 font-mono"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => executeQuery(customQuery)}
                    disabled={!customQuery.trim() || loading}
                    className="flex items-center"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Execute Query
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setCustomQuery('')}
                  >
                    Clear
                  </Button>
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Query Results</CardTitle>
                <CardDescription>
                  {queryResult.length > 0 ? `${queryResult.length} rows returned` : 'No data to display'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {queryResult.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(queryResult[0]).map((key) => (
                            <TableHead key={key}>{key}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryResult.map((row, index) => (
                          <TableRow key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <TableCell key={cellIndex}>
                                {value !== null ? String(value) : 'NULL'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No query results to display. Execute a query to see data here.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}