"use client"

import { useState } from "react"
import Link from "next/link"

const sponsors = [
  { name: "Ledger", role: "Human signing" },
  { name: "Hedera", role: "Immutable ordering" },
  { name: "ENS", role: "Discoverability" },
]

type Persona = "agent" | "human" | null

export default function Home() {
  const [persona, setPersona] = useState<Persona>(null)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-5 shadow-lg shadow-indigo-200">
          L
        </div>
        <h1 className="text-3xl font-bold mb-1 tracking-tight">LEDGIT</h1>
        <p className="text-gray-400 text-sm mb-6">
          Verifiable Human-Authorized Audit Trails for AI Agents
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setPersona(persona === "agent" ? null : "agent")}
            className={`rounded-2xl border-2 p-5 text-left transition-all cursor-pointer ${
              persona === "agent"
                ? "border-indigo-400 bg-indigo-50 shadow-md"
                : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
            }`}
          >
            <div className="text-2xl mb-1">🤖</div>
            <div className="font-bold text-sm">I&apos;m an Agent</div>
            <div className="text-xs text-gray-400 mt-0.5">Propose actions, discover schemas</div>
          </button>
          <button
            onClick={() => setPersona(persona === "human" ? null : "human")}
            className={`rounded-2xl border-2 p-5 text-left transition-all cursor-pointer ${
              persona === "human"
                ? "border-amber-400 bg-amber-50 shadow-md"
                : "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30"
            }`}
          >
            <div className="text-2xl mb-1">👤</div>
            <div className="font-bold text-sm">I&apos;m a Human</div>
            <div className="text-xs text-gray-400 mt-0.5">Review, approve, verify</div>
          </button>
        </div>

        {persona === "agent" && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-left mb-4 animate-[fade-in_0.2s_ease-out]">
            <h2 className="font-bold text-sm text-indigo-900 mb-3">Claim your ENS identity</h2>
            <ol className="text-sm text-indigo-800 space-y-3">
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">1.</span>
                <span><strong>Claim a subname</strong> — request <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono">your-name.ledgit.eth</code> from your human operator</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">2.</span>
                <span>Operator creates the subname + HCS topic via <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit init</code></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">3.</span>
                <span>Discover actions: <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit actions list --json</code> returns the available types, required fields, and risk levels</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">4.</span>
                <span>Propose: <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit propose --agent your-name.ledgit.eth --type &lt;action&gt; --fields &apos;&#123;...&#125;&apos;</code></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">5.</span>
                <span>Wait for human approval, then verify: <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit verify your-name.ledgit.eth</code></span>
              </li>
              <li className="mt-3 pt-3 border-t border-indigo-200 text-xs text-indigo-600">
                <strong>Config note:</strong> Action types are defined in <code className="bg-indigo-100 px-1 rounded text-xs">.ledgit/config.json</code>. Your operator edits this file to add or modify types — no code changes needed.
              </li>
            </ol>
          </div>
        )}

        {persona === "human" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left mb-4 animate-[fade-in_0.2s_ease-out]">
            <h2 className="font-bold text-sm text-amber-900 mb-3">Your role in the loop</h2>
            <ol className="text-sm text-amber-800 space-y-3">
              <li className="flex gap-2">
                <span className="font-bold text-amber-400">1.</span>
                <span><strong>Issue subnames</strong> — create <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">agent-name.ledgit.eth</code> with its own HCS topic</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400">2.</span>
                <span><strong>Review actions</strong> — they appear on your Ledger with full details</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400">3.</span>
                <span><strong>Approve or reject</strong> with one button press on the hardware</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400">4.</span>
                <span>Signature stored immutably on Hedera HCS with consensus timestamp</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400">5.</span>
                <span><strong>Verify any agent</strong> — <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit verify agent-name.ledgit.eth</code> or <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit dashboard agent-name.ledgit.eth</code></span>
              </li>
            </ol>
          </div>
        )}

        {persona === null && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left shadow-sm mb-4">
            <h2 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-3">Why LEDGIT</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              AI agents are moving real money, but regulated companies cannot answer one critical question:
            </p>
            <blockquote className="text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg px-4 py-3 mb-3 border-l-4 border-indigo-400">
              &ldquo;Can you prove a human actually authorized this action?&rdquo;
            </blockquote>
            <p className="text-sm text-gray-700 leading-relaxed">
              LEDGIT answers that question every time — with hardware signing, immutable records, and self-discoverable identity.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-7 text-left shadow-sm mb-6">
          <h2 className="font-semibold text-xs text-gray-400 uppercase tracking-widest mb-3">Sponsors</h2>
          <div className="grid grid-cols-3 gap-3">
            {sponsors.map((s) => (
              <div key={s.name} className="bg-gray-50 rounded-lg px-3 py-2.5 text-center">
                <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-7 text-left shadow-sm">
          <h2 className="font-semibold text-xs text-gray-400 uppercase tracking-widest mb-3">Open an Audit Trail</h2>
          <p className="text-sm text-gray-500 mb-3">Run from your terminal:</p>
          <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm text-gray-100 flex items-center justify-between">
            <span>
              <span className="text-gray-500">$</span> ledgit dashboard{' '}
              <span className="text-indigo-300">alice.ledgit.eth</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          ETHGlobal New York 2026 · Ledger · Hedera · ENS
        </p>
      </div>
    </div>
  )
}
