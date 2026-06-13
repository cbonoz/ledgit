"use client"

import { useState } from "react"
import Link from "next/link"

type Persona = "agent" | "human" | null

const sponsors = [
  { name: "Ledger", role: "Hardware signing", desc: "Every high or medium risk action requires physical approval on a Ledger device — the cryptographic signature proves a real human authorized it. Not a bot, not a replay, not a compromised API key. If the human doesn't press approve, the action doesn't happen." },
  { name: "Hedera", role: "Immutable records + payments", desc: "Signed actions are recorded on Hedera HCS with a network-verified consensus timestamp and sequence number — no one can tamper with or reorder the trail. Also enables agentic audited payments: send HBAR directly from the CLI with the full audit trail attached. Optional encryption keeps sensitive payload data private while preserving public verifiability." },
  { name: "ENS", role: "Bring your own ENS name", desc: "No subname service or platform dependency. Use any ENS name you already own as your agent's identity — set one text record and you're done. The name resolves to the HCS topic so anyone can verify the trail. Opaque hex addresses replaced with readable names like alice.acme-corp.eth." },
]

export default function Home() {
  const [persona, setPersona] = useState<Persona>(null)
  const [openSponsor, setOpenSponsor] = useState<string | null>(null)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        <Link href="/" className="inline-block">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-5 shadow-lg shadow-indigo-200 hover:opacity-80 transition-opacity">
            L
          </div>
        </Link>
        <h1 className="text-3xl font-bold mb-1 tracking-tight">LEDGIT</h1>
        <p className="text-gray-400 text-sm mb-6">
          Verifiable Human-Authorized Audit Trails for AI Agents
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
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
            <div className="text-xs text-gray-400 mt-0.5">Review on Ledger, bring your own ENS name</div>
          </button>
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
            <div className="text-xs text-gray-400 mt-0.5">Propose actions, see what's available</div>
          </button>
        </div>

        {persona === "human" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left mb-4 animate-[fade-in_0.2s_ease-out]">
            <h2 className="font-bold text-sm text-amber-900 mb-3">Getting started</h2>
            <ol className="text-sm text-amber-800 space-y-3">
              <li className="flex gap-2">
                <span className="font-bold text-amber-400">1.</span>
                <span>Install: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">git clone &amp;&amp; bun install &amp;&amp; npm link</code></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400">2.</span>
                <span>Run <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit setup</code> — creates environment, action config, and your first HCS topic</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400">3.</span>
                <span>(Optional) Point your ENS name at the topic — set <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit.hcs.topic</code> text record to your topic ID on sepolia.ens.app</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400">4.</span>
                <span><strong>Review actions</strong> on your Ledger — approve or reject with one button press</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-400">5.</span>
                <span><strong>Verify</strong> — <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit verify your-name.eth</code> or <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit verify</code> with the topic ID from your .env</span>
              </li>
            </ol>
            <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-600">
              <strong>Don't have an ENS name?</strong> No problem — LEDGIT works without one. Use the <code className="bg-amber-100 px-1 rounded text-xs font-mono">LEDGIT_TOPIC_ID</code> from your .env and skip step 3.
            </div>
          </div>
        )}

        {persona === "agent" && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-left mb-4 animate-[fade-in_0.2s_ease-out]">
            <h2 className="font-bold text-sm text-indigo-900 mb-3">How agents use LEDGIT</h2>
            <ol className="text-sm text-indigo-800 space-y-3">
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">1.</span>
                <span>Your operator installs LEDGIT and registers you as an agent in <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono">.ledgit/config.json</code></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">2.</span>
                <span>Your agent framework calls <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit tools schema</code> to discover available actions and their parameters</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">3.</span>
                <span>When you need to execute an action, call <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit propose --type &lt;action&gt; --fields &apos;&#123;...&#125;&apos;</code></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">4.</span>
                <span>Wait for human approval on Ledger (high/medium risk) or auto-approved (low risk)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">5.</span>
                <span>Verify the trail: <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono">ledgit verify &lt;name&gt;</code></span>
              </li>
              <li className="mt-3 pt-3 border-t border-indigo-200 text-xs text-indigo-600">
                <strong>Config note:</strong> Action types are defined in <code className="bg-indigo-100 px-1 rounded text-xs">.ledgit/config.json</code>. The <code className="bg-indigo-100 px-1 rounded text-xs">ledgit tools schema</code> output updates automatically.
              </li>
            </ol>
          </div>
        )}

        {persona === null && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left shadow-sm mb-4">
            <h2 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-3">Without vs With LEDGIT</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-400 pb-2 pr-3"></th>
                    <th className="text-left font-medium text-red-400 pb-2 pr-3">Without</th>
                    <th className="text-left font-medium text-emerald-600 pb-2">With LEDGIT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { aspect: "Human oversight", bad: "None or weak prompts", good: "Hardware-signed approval" },
                    { aspect: "Audit trail", bad: "Basic logs, easy to fake", good: "Immutable on Hedera HCS" },
                    { aspect: "Proof", bad: "\u201CThe agent said so\u201D", good: "Provable human signature" },
                    { aspect: "Regulatory", bad: "Not viable", good: "Enterprise-ready" },
                    { aspect: "Accountability", bad: "Blame the AI", good: "Chain of custody" },
                    { aspect: "Safety", bad: "Rogue action risk", good: "Controlled & traceable" },
                  ].map((r) => (
                    <tr key={r.aspect}>
                      <td className="py-2 pr-3 font-medium text-gray-700">{r.aspect}</td>
                      <td className="py-2 pr-3 text-gray-400">{r.bad}</td>
                      <td className="py-2 text-emerald-700 font-medium">{r.good}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
              Agents <span className="text-red-400">without</span> LEDGIT run on trust. Agents <span className="text-emerald-600 font-medium">with</span> LEDGIT run on proof.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-7 text-left shadow-sm mb-6">
          <h2 className="font-semibold text-xs text-gray-400 uppercase tracking-widest mb-3">Install LEDGIT</h2>
          <div className="space-y-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-semibold text-gray-700 mb-1">Prerequisites</div>
              <div className="text-xs text-gray-500">Node.js 20+ or <a href="https://bun.sh" className="text-indigo-600 hover:underline">Bun</a></div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Install</div>
              <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm text-gray-100">
                <div><span className="text-gray-500">$</span> git clone https://github.com/cbonoz/ledgit.git</div>
                <div><span className="text-gray-500">$</span> cd ledgit && bun install</div>
                <div><span className="text-gray-500">$</span> npm link</div>
                <div><span className="text-gray-500">$</span> ledgit --version</div>
              </div>
            </div>
            <div>
              <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm text-gray-100">
                <div><span className="text-gray-500">$</span> ledgit setup</div>
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
                  Interactive setup: connects to Hedera, creates your first agent and HCS topic, generates action config. Bring your own ENS name or use a local identifier — no subname service needed.
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">View an audit trail</div>
              <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm text-gray-100">
                <div><span className="text-gray-500">$</span> ledgit dashboard{' '}<span className="text-indigo-300">alice.ledgit.eth</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-7 text-left shadow-sm mb-6">
          <h2 className="font-semibold text-xs text-gray-400 uppercase tracking-widest mb-3">Powered By</h2>
          <div className="space-y-2">
            {sponsors.map((s) => (
              <div key={s.name}>
                <button
                  onClick={() => setOpenSponsor(openSponsor === s.name ? null : s.name)}
                  className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-3 text-left transition-colors cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.role}</div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-300 transition-transform ${openSponsor === s.name ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {openSponsor === s.name && (
                  <div className="px-4 py-3 text-xs text-gray-600 leading-relaxed">
                    {s.desc}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8 flex items-center justify-center gap-3">
          <span>LEDGIT</span>
          <span>·</span>
          <a href="https://github.com/cbonoz/ledgit" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg>
            GitHub
          </a>
          <span>·</span>
          <span>ETHGlobal New York 2026</span>
        </p>
      </div>
    </div>
  )
}
