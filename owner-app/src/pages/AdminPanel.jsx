import { useState, useEffect } from 'react'

const ADMIN_KEY = '50293781ad15772755606dc0c628c5209cb0fcdbafcec170bc7fe67f2e171573ea71ec456dae4d9821aff7822c7d02e5'
const PASSPHRASE = 'teddyjake'
const COLLECTIONS = ['orders', 'ingredients', 'menus', 'tables', 'users', 'promotions', 'waste', 'deliveries']
const ACTIONS = ['find', 'findOne', 'create', 'update', 'updateOne', 'delete', 'deleteMany']

const BASE_URL_RAW = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BASE_URL = BASE_URL_RAW.endsWith('/api')
  ? BASE_URL_RAW.slice(0, -4)
  : BASE_URL_RAW.replace(/\/$/, '')

export default function AdminPanel() {
  // Auth State
  const [unlocked, setUnlocked] = useState(false)
  const [phrase, setPhrase] = useState('')
  const [phraseError, setPhraseError] = useState(false)

  // Table State
  const [collection, setCollection] = useState('orders')
  const [rows, setRows] = useState([])
  const [columns, setColumns] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState('asc')

  // Edit Modal State
  const [editDoc, setEditDoc] = useState(null)
  const [editFields, setEditFields] = useState({})

  // Create Modal State
  const [showCreate, setShowCreate] = useState(false)
  const [createJson, setCreateJson] = useState('{}')
  const [createError, setCreateError] = useState('')

  // Advanced Section State
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedAction, setAdvancedAction] = useState('find')
  const [advancedQuery, setAdvancedQuery] = useState('{}')
  const [advancedData, setAdvancedData] = useState('{}')
  const [advancedResult, setAdvancedResult] = useState(null)
  const [advancedError, setAdvancedError] = useState('')

  const handleUnlock = () => {
    if (phrase === PASSPHRASE) {
      setUnlocked(true)
      setPhraseError(false)
    } else {
      setPhraseError(true)
      setPhrase('')
    }
  }

  async function callAdmin({ action, query, data, overrideCollection }) {
    const targetCollection = overrideCollection || collection
    const res = await fetch(`${BASE_URL}/api/__spc_mgmt__`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SPC-Key': ADMIN_KEY,
      },
      body: JSON.stringify({ collection: targetCollection, action, query, data: data || {} }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || res.statusText)
    return json
  }

  const handleLoad = async () => {
    setError('')
    setIsLoading(true)
    try {
      const result = await callAdmin({ action: 'find', query: {} })
      const docs = Array.isArray(result) ? result : (result.result || [])
      setRows(docs)
      if (docs.length > 0) {
        setColumns(Object.keys(docs[0]))
      } else {
        setColumns([])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return
    try {
      await callAdmin({ action: 'delete', query: { _id: row._id } })
      handleLoad()
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  const openEdit = (row) => {
    setEditDoc(row)
    const fields = {}
    Object.keys(row).forEach(key => {
      const val = row[key]
      if (val && typeof val === 'object') {
        fields[key] = JSON.stringify(val, null, 2)
      } else {
        fields[key] = val
      }
    })
    setEditFields(fields)
  }

  const handleSaveEdit = async () => {
    try {
      const dataToSave = {}
      Object.keys(editFields).forEach(key => {
        if (key === '_id') return
        const originalVal = editDoc[key]
        if (originalVal && typeof originalVal === 'object') {
          try {
            dataToSave[key] = JSON.parse(editFields[key])
          } catch {
            throw new Error(`Invalid JSON in field: ${key}`)
          }
        } else {
          dataToSave[key] = editFields[key]
        }
      })

      await callAdmin({
        action: 'updateOne',
        query: { _id: editDoc._id },
        data: dataToSave
      })
      setEditDoc(null)
      handleLoad()
    } catch (err) {
      alert('Save failed: ' + err.message)
    }
  }

  const handleCreate = async () => {
    setCreateError('')
    try {
      const parsed = JSON.parse(createJson)
      await callAdmin({ action: 'create', data: parsed, query: {} })
      setShowCreate(false)
      setCreateJson('{}')
      handleLoad()
    } catch (err) {
      setCreateError(err.message)
    }
  }

  const handleExecuteAdvanced = async () => {
    setAdvancedError('')
    setAdvancedResult(null)
    try {
      const q = JSON.parse(advancedQuery)
      const d = JSON.parse(advancedData)
      const res = await callAdmin({ action: advancedAction, query: q, data: d })
      setAdvancedResult(res)
    } catch (err) {
      setAdvancedError(err.message)
    }
  }

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filteredRows = rows.filter(row => {
    if (!searchText) return true
    return Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  })

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortKey) return 0
    const valA = a[sortKey]
    const valB = b[sortKey]
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#EEEEEE] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-sm flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-gray-800">Admin Access</h2>
          <input
            type="password"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="Enter passphrase"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-gray-400"
          />
          {phraseError && (
            <p className="text-[12px] text-red-500">Incorrect passphrase</p>
          )}
          <button
            onClick={handleUnlock}
            className="w-full py-2 bg-gray-900 text-white rounded-lg text-[13px] font-bold hover:bg-gray-700 transition-colors"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EEEEEE] p-6 text-gray-900">
      <div className="max-w-[95%] mx-auto flex flex-col gap-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => setUnlocked(false)}
            className="text-[12px] text-gray-400 hover:text-gray-600"
          >
            Lock
          </button>
        </div>

        {/* Controls Row */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 flex-wrap">
          <select
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white min-w-[150px]"
          >
            {COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={handleLoad}
            disabled={isLoading}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load'}
          </button>
          <div className="flex-1"></div>
          <input
            type="text"
            placeholder="Search visible rows..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-gray-400 w-64"
          />
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#DC5F00] text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-orange-700 transition-colors"
          >
            New Document
          </button>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[400px]">
          {error && (
            <div className="p-8 text-center text-red-500 text-[14px]">{error}</div>
          )}
          {!error && rows.length === 0 && !isLoading && (
            <div className="p-20 text-center text-gray-400 text-[14px]">
              {columns.length === 0 ? 'Select a collection and click Load' : 'No documents found'}
            </div>
          )}
          {!error && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    {columns.map(col => (
                      <th
                        key={col}
                        onClick={() => toggleSort(col)}
                        className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 py-3 cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1">
                          {col}
                          {sortKey === col && (
                            <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedRows.map((row, idx) => (
                    <tr key={row._id || idx} className="hover:bg-gray-50 transition-colors">
                      {columns.map(col => (
                        <td key={col} className="text-[12px] text-gray-700 px-3 py-2 max-w-[200px] truncate">
                          {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(row)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-medium mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="text-[11px] text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Advanced Toggle */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[12px] text-gray-400 hover:text-gray-600 underline"
          >
            {showAdvanced ? 'Hide Advanced (Raw JSON)' : 'Advanced (Raw JSON)'}
          </button>
        </div>

        {/* Advanced Section */}
        {showAdvanced && (
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Collection</label>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white"
                >
                  {COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Action</label>
                <select
                  value={advancedAction}
                  onChange={(e) => setAdvancedAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white"
                >
                  {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Query (JSON) — filter which documents to target</label>
              <textarea
                value={advancedQuery}
                onChange={(e) => setAdvancedQuery(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-mono outline-none focus:border-gray-400 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Data (JSON) — fields to set for create/update</label>
              <textarea
                value={advancedData}
                onChange={(e) => setAdvancedData(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-mono outline-none focus:border-gray-400 resize-none"
              />
            </div>

            {advancedError && <p className="text-[12px] text-red-500">{advancedError}</p>}

            <button
              onClick={handleExecuteAdvanced}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-bold hover:bg-gray-700 transition-colors"
            >
              Execute
            </button>

            {advancedResult && (
              <div className="mt-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Result</label>
                <pre className="mt-1 bg-gray-50 p-3 rounded-lg text-[11px] font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap max-h-[300px]">
                  {JSON.stringify(advancedResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto flex flex-col gap-4">
            <h2 className="text-[16px] font-bold text-gray-800">Edit Document</h2>
            <div className="flex flex-col gap-3">
              {Object.keys(editFields).map(key => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{key}</label>
                  {typeof editDoc[key] === 'object' ? (
                    <textarea
                      value={editFields[key]}
                      onChange={(e) => setEditFields({ ...editFields, [key]: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-mono outline-none focus:border-gray-400"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editFields[key]}
                      disabled={key === '_id'}
                      onChange={(e) => setEditFields({ ...editFields, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-[13px] font-bold hover:bg-gray-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditDoc(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-[13px] font-bold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto flex flex-col gap-4">
            <h2 className="text-[16px] font-bold text-gray-800">New Document — {collection}</h2>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Document JSON</label>
              <textarea
                value={createJson}
                onChange={(e) => setCreateJson(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-mono outline-none focus:border-gray-400"
              />
            </div>
            {createError && <p className="text-[12px] text-red-500">{createError}</p>}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCreate}
                className="flex-1 py-2 bg-[#DC5F00] text-white rounded-lg text-[13px] font-bold hover:bg-orange-700"
              >
                Create
              </button>
              <button
                onClick={() => { setShowCreate(false); setCreateError(''); }}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-[13px] font-bold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
