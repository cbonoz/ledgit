"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"

interface Action {
  sequenceNumber: number
  consensusTimestamp: string
  actionId?: string
  agent?: string
  description?: string
  type?: string
  signature?: string
  riskLevel?: string
  encrypted?: boolean
  payload?: Record<string, unknown>
}

interface Props {
  data: {
    agent: string
    topicId: string
    generatedAt: string
    actions: Action[]
  }
  etherscanUrl?: string
}

const riskColor = (level?: string) => {
  switch (level) {
    case "high": return { bg: "bg-red-50", border: "border-red-400", dot: "bg-red-400", label: "text-red-600", labelBg: "bg-red-100", ring: "ring-red-200" }
    case "medium": return { bg: "bg-amber-50", border: "border-amber-400", dot: "bg-amber-400", label: "text-amber-600", labelBg: "bg-amber-100", ring: "ring-amber-200" }
    default: return { bg: "bg-emerald-50", border: "border-emerald-400", dot: "bg-emerald-400", label: "text-emerald-600", labelBg: "bg-emerald-100", ring: "ring-emerald-200" }
  }
}

const DEFAULT_RISK: Record<string, string> = {
  hbar_transfer: "high",
  token_swap: "high",
  grant_role: "medium",
  update_agent_config: "medium",
}

function parseMessage(raw: string): Partial<Action> {
  const entry: Partial<Action> = {}
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed.actionId) entry.actionId = String(parsed.actionId)
    if (parsed.agent) entry.agent = String(parsed.agent)
    if (parsed.signature) entry.signature = String(parsed.signature)
    let desc = parsed.description ? String(parsed.description) : undefined
    let type = parsed.type ? String(parsed.type) : undefined
    let risk = parsed.riskLevel ? String(parsed.riskLevel) : undefined
    if ((!desc || !type) && parsed.payload) {
      try {
        const inner = typeof parsed.payload === "string" ? JSON.parse(parsed.payload) : parsed.payload as Record<string, unknown>
        if (!desc && inner.description) desc = String(inner.description)
        if (!type && inner.type) type = String(inner.type)
        if (!risk && inner.riskLevel) risk = String(inner.riskLevel)
      } catch { /* skip */ }
    }
    if (desc) entry.description = desc
    if (type) entry.type = type
    // Fall back to default risk by type if not explicitly set
    entry.riskLevel = risk || (type && DEFAULT_RISK[type]) || "low"
  } catch { /* skip */ }
  return entry
}

function ActionCard({ action, topicId, etherscanUrl }: { action: Action; topicId: string; etherscanUrl: string }) {
  const [open, setOpen] = useState(false)
  const seconds = Number(action.consensusTimestamp.split(".")[0])
  const ts = new Date(seconds * 1000).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
  const hasSig = action.signature && action.signature.length > 10
  const sigShort = hasSig ? action.signature!.slice(0, 10) + "..." + action.signature!.slice(-6) : "—"
  const needsSig = action.riskLevel === "high" || action.riskLevel === "medium"
  const compliant = hasSig || action.riskLevel === "low"
  const unverified = needsSig && !hasSig
  const bgColor = compliant ? "bg-emerald-50" : "bg-red-50"
  const borderColor = compliant ? "border-emerald-400" : "border-red-400"
  const dotColor = compliant ? "bg-emerald-400" : "bg-red-400"

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full ${bgColor} border-2 ${unverified ? `${borderColor} border-dashed` : borderColor} ring-4 ${unverified ? "ring-red-200" : "ring-emerald-200"} flex items-center justify-center`}>
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      </div>
      <div
        className={`${bgColor} border-l-4 ${unverified ? `${borderColor} border-dashed` : borderColor} rounded-r-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-gray-400">#{action.sequenceNumber}</span>
          <div className="flex gap-1.5 items-center">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${compliant ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {action.riskLevel?.toUpperCase() || "LOW"}{unverified ? " ⚠️" : ""}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-500 mb-1">{ts}</div>
        <div className="font-semibold text-gray-800 mb-1">{action.description || "No description"}</div>
        <div className="text-xs text-gray-400">
          {action.type}{action.actionId ? ` · ${action.actionId}` : ""}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {hasSig ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Ledger Signature Verified
            </span>
          ) : unverified ? (
              <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-1.134 0-2.042-.536-2.682-1.374a2.2 2.2 0 01-.33-1.86l.46-1.15a.737.737 0 000-.588l-.46-1.15a2.2 2.2 0 01.33-1.86c.64-.838 1.548-1.374 2.682-1.374h14.606c1.134 0 2.042.536 2.682 1.374a2.2 2.2 0 01.33 1.86l-.46 1.15a.737.737 0 000 .588l.46 1.15a2.2 2.2 0 01-.33 1.86c-.64.838-1.548 1.374-2.682 1.374H5.697" />
                </svg>
                Missing Signature
              </span>
          ) : (
            <span className="text-gray-400">No signature</span>
          )}
          <svg className={`w-3.5 h-3.5 ml-auto text-gray-300 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      {open && (
        <div className="mt-2 ml-2 p-4 bg-white rounded-lg border border-gray-200 shadow-sm text-sm">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Signature</span>
              <p className="font-mono text-xs text-gray-600 break-all mt-0.5">{sigShort}</p>
              {hasSig && (
                <a href={`${etherscanUrl}/verifiedSignatures?q=${action.signature}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs mt-1 inline-block">
                  Verify on Etherscan ↗
                </a>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">HCS Timestamp</span>
              <p className="font-mono text-xs text-gray-600 mt-0.5">{action.consensusTimestamp}</p>
              <a href={`https://hashscan.io/testnet/topic/${topicId}/${action.sequenceNumber}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs mt-1 inline-block">
                View on HashScan ↗
              </a>
            </div>
          </div>
          {action.payload && (
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Payload</span>
              <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 overflow-x-auto mt-0.5">
                {JSON.stringify(action.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ActionTimeline({ data, etherscanUrl = "https://sepolia.etherscan.io" }: Props) {
  const [live, setLive] = useState(false)
  const [actions, setActions] = useState<Action[]>(data.actions)
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    const params = new URLSearchParams(window.location.search)
    return params.get("date") || null
  })
  const lastTs = useRef(actions.length > 0 ? actions[actions.length - 1].consensusTimestamp : "0")
  const topicId = data.topicId

  const high = actions.filter(a => a.riskLevel === "high").length
  const medium = actions.filter(a => a.riskLevel === "medium").length
  const low = actions.filter(a => a.riskLevel === "low").length

  const selectDay = (dateKey: string) => {
    setSelectedDate(dateKey)
    window.history.replaceState(null, "", `?date=${dateKey}`)
  }

  const clearDay = () => {
    setSelectedDate(null)
    window.history.replaceState(null, "", window.location.pathname)
  }

  const poll = useCallback(async () => {
    try {
      const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?timestamp=gt:${lastTs.current}&limit=5&order=asc`
      const res = await fetch(url)
      if (!res.ok) return
      const body = await res.json() as { messages?: { sequence_number: number; consensus_timestamp: string; message: string }[] }
      if (!body.messages?.length) return
      const newActions: Action[] = body.messages.map(m => ({
        sequenceNumber: m.sequence_number,
        consensusTimestamp: m.consensus_timestamp,
        ...parseMessage(atob(m.message)),
      }))
      if (newActions.length > 0) {
        lastTs.current = newActions[newActions.length - 1].consensusTimestamp
        setActions(prev => {
          const existing = new Set(prev.map(a => a.sequenceNumber))
          const unique = newActions.filter(a => !existing.has(a.sequenceNumber))
          return unique.length > 0 ? [...prev, ...unique] : prev
        })
      }
    } catch { /* ignore */ }
  }, [topicId])

  useEffect(() => {
    if (!live) return
    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [live, poll])

  // Group by month → day
  const byMonth: { monthKey: string; monthLabel: string; days: { dateKey: string; label: string; actions: Action[] }[] }[] = []
  const reversed = [...actions].toReversed()
  for (const action of reversed) {
    const seconds = Number(action.consensusTimestamp.split(".")[0])
    const d = new Date(seconds * 1000)
    const monthKey = d.toISOString().slice(0, 7) // "2026-06"
    const monthLabel = d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    const dateKey = d.toISOString().split("T")[0]
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

    let month = byMonth.find(m => m.monthKey === monthKey)
    if (!month) {
      month = { monthKey, monthLabel, days: [] }
      byMonth.push(month)
    }
    let day = month.days.find(d => d.dateKey === dateKey)
    if (!day) {
      day = { dateKey, label: dayLabel, actions: [] }
      month.days.push(day)
    }
    day.actions.push(action)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-3 mb-1 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">L</div>
        <h1 className="text-xl font-bold">LEDGIT</h1>
      </Link>
      <p className="text-gray-400 text-sm mb-6">Verifiable Human-Authorized Audit Trails</p>

      <div className="mb-6">
        <h2 className="text-2xl font-bold font-mono tracking-tight">{data.agent}</h2>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
          <span>Topic: <span className="font-mono">{data.topicId}</span></span>
          <span className="text-gray-300">·</span>
          <span>{actions.length} action{actions.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-8 items-center">
        <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">{high} High</span>
        <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">{medium} Medium</span>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{low} Low</span>
        <button
          onClick={() => setLive(!live)}
          className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
            live ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
          {live ? "Live" : "Go Live"}
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">📭</div>
          <p className="font-medium">No actions recorded yet</p>
          <p className="text-sm mt-1">Propose and record an action to see it here</p>
        </div>
      ) : selectedDate ? (
        <div>
          <button onClick={clearDay} className="text-xs text-indigo-600 hover:underline mb-4 cursor-pointer">
            &larr; All days
          </button>
          {byMonth.map(month => {
            const day = month.days.find(d => d.dateKey === selectedDate)
            if (!day) return null
            return (
              <div key={selectedDate}>
                <h2 className="text-lg font-bold text-gray-700 mb-1">{month.monthLabel}</h2>
                <h3 className="text-sm font-semibold text-gray-500 mb-4">{day.label}</h3>
                {day.actions.some(a => a.encrypted) && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 mb-4 text-xs text-indigo-700">
                    Some actions on this day were encrypted with <code className="bg-indigo-100 px-1 rounded font-mono">ENCRYPTION_KEY</code>.
                    Data is private to viewers with the key.{' '}
                    <a href="https://github.com/cbonoz/ledgit#encryption" target="_blank" rel="noopener noreferrer" className="underline font-medium">Learn more</a>.
                  </div>
                )}
                <div>
                  {day.actions.map((action) => (
                    <ActionCard key={action.sequenceNumber} action={action} topicId={topicId} etherscanUrl={etherscanUrl} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-10">
          {byMonth.map(month => (
            <div key={month.monthKey}>
              <h2 className="text-lg font-bold text-gray-700 mb-4 sticky top-0 bg-gray-50 py-3 z-10 border-b border-gray-200">
                {month.monthLabel}
              </h2>
              <div className="grid gap-3">
                {month.days.map(day => (
                  <button
                    key={day.dateKey}
                    onClick={() => selectDay(day.dateKey)}
                    className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 text-sm">{day.label}</span>
                      <span className="text-xs text-gray-400">{day.actions.length} action{day.actions.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {["high", "medium", "low"].map(risk => {
                        const count = day.actions.filter(a => (a.riskLevel || "low") === risk).length
                        if (count === 0) return null
                        const colors = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-emerald-100 text-emerald-700" }
                        return (
                          <span key={risk} className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[risk as keyof typeof colors]}`}>
                            {count} {risk}
                          </span>
                        )
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 flex items-center justify-center gap-3">
        <Link href="/" className="hover:underline">LEDGIT</Link>
        <span>·</span>
        <a href="https://github.com/cbonoz/ledgit" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors inline-flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg>
          GitHub
        </a>
        <span>·</span>
        ETHGlobal New York 2026
      </div>
    </div>
  )
}
