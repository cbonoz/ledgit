import Link from "next/link"

const sponsors = [
  { name: "Ledger", role: "Human signing", color: "text-indigo-600" },
  { name: "Hedera", role: "Immutable ordering", color: "text-indigo-600" },
  { name: "ENS", role: "Discoverability", color: "text-indigo-600" },
]

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-5 shadow-lg shadow-indigo-200">
          L
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight">LEDGIT</h1>
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">CLI Tool</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-medium">Web Renderer</span>
        </div>
        <p className="text-gray-400 mb-8 text-sm">
          Verifiable Human-Authorized Audit Trails for AI Agents
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 text-left">
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-semibold">LEDGIT is a CLI tool.</span> This web dashboard
            renders the JSON audit trail files produced by{' '}
            <code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">ledgit dashboard &lt;ens&gt;</code>.
            Run that command from your terminal to generate and open an agent&rsquo;s timeline here.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-7 text-left shadow-sm mb-4">
          <h2 className="font-semibold text-xs text-gray-400 uppercase tracking-widest mb-4">
            Why LEDGIT
          </h2>

          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            AI agents are rapidly moving from chat to action — sending payments,
            executing trades, and interacting with real systems. But there is
            currently <span className="font-semibold text-gray-900">no trustworthy way</span> to prove
            human oversight and create an immutable audit trail.
          </p>

          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Every regulated company, fintech, and DAO asks the same question
            before letting agents touch real money:
          </p>

          <blockquote className="text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg px-4 py-3 mb-4 border-l-4 border-indigo-400">
            &ldquo;Can you prove a human actually authorized this action?&rdquo;
          </blockquote>

          <p className="text-sm text-gray-700 leading-relaxed">
            LEDGIT answers that question —{' '}
            <span className="font-semibold text-gray-900">every single time</span>.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-7 text-left shadow-sm mb-4">
          <h2 className="font-semibold text-xs text-gray-400 uppercase tracking-widest mb-4">
            How It Works
          </h2>

          <p className="text-xs text-gray-400 mb-4">
            All operations happen in the CLI. This page renders the final result.
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 mt-0.5">1</div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Agent Proposes</div>
                <div className="text-xs text-gray-500 mt-0.5"><code className="bg-gray-100 px-1 rounded text-xs font-mono">ledgit propose</code> creates an action with full details</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 mt-0.5">2</div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Human Approves on Ledger</div>
                <div className="text-xs text-gray-500 mt-0.5"><code className="bg-gray-100 px-1 rounded text-xs font-mono">ledgit record</code> sends the action to a Ledger device for cryptographic signing</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 mt-0.5">3</div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Recorded Immutably on Hedera HCS</div>
                <div className="text-xs text-gray-500 mt-0.5">The signed action is stored on Hedera with a verifiable consensus timestamp</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 mt-0.5">4</div>
              <div>
                <div className="text-sm font-semibold text-gray-900">View the Audit Trail</div>
                <div className="text-xs text-gray-500 mt-0.5"><code className="bg-gray-100 px-1 rounded text-xs font-mono">ledgit verify</code> in the terminal or <code className="bg-gray-100 px-1 rounded text-xs font-mono">ledgit dashboard</code> to see it here</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-7 text-left shadow-sm mb-6">
          <h2 className="font-semibold text-xs text-gray-400 uppercase tracking-widest mb-3">
            Sponsors
          </h2>
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
          <h2 className="font-semibold text-xs text-gray-400 uppercase tracking-widest mb-3">
            Open an Audit Trail
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Run this from your terminal to load an agent&apos;s history:
          </p>
          <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm text-gray-100 flex items-center justify-between">
            <span>
              <span className="text-gray-500">$</span> ledgit dashboard{' '}
              <span className="text-indigo-300">trader-a.ledgit.eth</span>
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
