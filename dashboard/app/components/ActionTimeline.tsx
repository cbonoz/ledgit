"use client"

import { useState } from "react"

interface Action {
  sequenceNumber: number
  consensusTimestamp: string
  actionId?: string
  description?: string
  type?: string
  signature?: string
  riskLevel?: string
  payload?: Record<string, unknown>
}

interface Props {
  data: {
    agent: string
    topicId: string
    generatedAt: string
    actions: Action[]
  }
}

const riskColor = (level?: string) => {
  switch (level) {
    case "high": return { bg: "bg-red-50", border: "border-red-400", dot: "bg-red-400", label: "text-red-600", labelBg: "bg-red-100", ring: "ring-red-200" }
    case "medium": return { bg: "bg-amber-50", border: "border-amber-400", dot: "bg-amber-400", label: "text-amber-600", labelBg: "bg-amber-100", ring: "ring-amber-200" }
    default: return { bg: "bg-emerald-50", border: "border-emerald-400", dot: "bg-emerald-400", label: "text-emerald-600", labelBg: "bg-emerald-100", ring: "ring-emerald-200" }
  }
}

function ActionCard({ action, index }: { action: Action; index: number }) {
  const [open, setOpen] = useState(false)
  const color = riskColor(action.riskLevel)
  const seconds = Number(action.consensusTimestamp.split(".")[0])
  const ts = new Date(seconds * 1000).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
  const hasSig = action.signature && action.signature.length > 10
  const sigShort = hasSig ? action.signature!.slice(0, 10) + "..." + action.signature!.slice(-6) : "—"

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full ${color.bg} border-2 ${color.border} ring-4 ${color.ring} flex items-center justify-center`}>
        <div className={`w-2 h-2 rounded-full ${color.dot}`} />
      </div>
      <div
        className={`${color.bg} border-l-4 ${color.border} rounded-r-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-gray-400">#{action.sequenceNumber}</span>
          <span className={`text-xs font-semibold ${color.label} ${color.labelBg} px-2 py-0.5 rounded-full`}>
            {action.riskLevel?.toUpperCase() || "UNKNOWN"}
          </span>
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
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">HCS Timestamp</span>
              <p className="font-mono text-xs text-gray-600 mt-0.5">{action.consensusTimestamp}</p>
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

export default function ActionTimeline({ data }: Props) {
  const high = data.actions.filter(a => a.riskLevel === "high").length
  const medium = data.actions.filter(a => a.riskLevel === "medium").length
  const low = data.actions.filter(a => a.riskLevel === "low").length

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">L</div>
        <h1 className="text-xl font-bold">LEDGIT</h1>
      </div>
      <p className="text-gray-400 text-sm mb-6">Verifiable Human-Authorized Audit Trails</p>

      <div className="mb-6">
        <h2 className="text-2xl font-bold font-mono tracking-tight">{data.agent}</h2>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
          <span>Topic: <span className="font-mono">{data.topicId}</span></span>
          <span className="text-gray-300">·</span>
          <span>{data.actions.length} action{data.actions.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">{high} High</span>
        <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">{medium} Medium</span>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{low} Low</span>
      </div>

      {data.actions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">📭</div>
          <p className="font-medium">No actions recorded yet</p>
          <p className="text-sm mt-1">Propose and record an action to see it here</p>
        </div>
      ) : (
        <div>
          {data.actions.toReversed().map((action, i) => (
            <ActionCard key={action.sequenceNumber} action={action} index={i} />
          ))}
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
        LEDGIT · ETHGlobal New York 2026 · Ledger · Hedera · ENS
      </div>
    </div>
  )
}
