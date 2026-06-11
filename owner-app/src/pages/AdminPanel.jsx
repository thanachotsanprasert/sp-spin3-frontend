import { useState } from 'react'

const ADMIN_KEY = '50293781ad15772755606dc0c628c5209cb0fcdbafcec170bc7fe67f2e171573ea71ec456dae4d9821aff7822c7d02e5'
const PASSPHRASE = 'teddyjake'
const COLLECTIONS = ['orders', 'ingredients', 'menus', 'tables', 'users', 'promotions', 'waste', 'deliveries']
const ACTIONS = ['find', 'findOne', 'create', 'update', 'updateOne', 'delete', 'deleteMany']

const BASE_URL_RAW = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BASE_URL = BASE_URL_RAW.endsWith('/api')
  ? BASE_URL_RAW.slice(0, -4)
  : BASE_URL_RAW.replace(/\/$/, '')

export default function AdminPanel() {
  const [unlocked, setUnlocked] = useState(false)
  const [phrase, setPhrase] = useState('')
  const [phraseError, setPhraseError] = useState(false)
  const [collection, setCollection] = useState('orders')
  const [action, setAction] = useState('find')
  const [query, setQuery] = useState('{}')
  const [data, setData] = useState('{}')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleUnlock = () => {
    if (phrase === PASSPHRASE) {
      setUnlocked(true)
      setPhraseError(false)
    } else {
      setPhraseError(true)
      setPhrase('')
    }
  }

  const handleExecute = async () => {
    setError('')
    setResult(null)

    let parsedQuery, parsedData
    try { parsedQuery = JSON.parse(query) } catch { setError('Invalid query JSON'); return }
    try { parsedData = JSON.parse(data) } catch { setError('Invalid data JSON'); return }

    setIsLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/__spc_mgmt__`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SPC-Key': ADMIN_KEY,
        },
        body: JSON.stringify({ collection, action, query: parsedQuery, data: parsedData }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || res.statusText)
      setResult(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="min-h-screen bg-[#EEEEEE] p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => setUnlocked(false)}
            className="text-[12px] text-gray-400 hover:text-gray-600"
          >
            Lock
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
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
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white"
              >
                {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Query (JSON) — filter which documents to target
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-mono outline-none focus:border-gray-400 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Data (JSON) — fields to set for create/update
            </label>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-mono outline-none focus:border-gray-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-500 font-medium">{error}</p>
          )}

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-bold hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Running...' : 'Execute'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Result</label>
            <pre className="mt-2 text-[12px] font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
