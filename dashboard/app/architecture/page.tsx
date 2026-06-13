import Link from "next/link"

const steps = [
  { id: 1, title: "Agent Proposes", desc: "The AI agent calls ledgit propose with the action type and structured fields (amount, recipient, reason). The CLI validates against the configurable action schema.", icon: "🤖" },
  { id: 2, title: "Human Approves on Ledger", desc: "The action details appear on the Ledger Stax screen. The human reviews and approves with one button press. The device returns an ECDSA signature.", icon: "🔒" },
  { id: 3, title: "HBAR Executes on Hedera", desc: "The CLI executes the HBAR transfer via TransferTransaction (or contract call via ContractExecuteTransaction). Sub-second finality, sub-cent fees.", icon: "💸" },
  { id: 4, title: "Proof Recorded on HCS", desc: "The signed action, Ledger signature, risk level, and consensus timestamp are stored immutably on Hedera HCS. Sequence numbers ensure ordering.", icon: "📦" },
  { id: 5, title: "Discoverable via ENS", desc: "The agent's ENS name has a text record (ledgit.hcs.topic) pointing to the HCS topic. Anyone resolves the name and queries the trail.", icon: "📛" },
  { id: 6, title: "View the Audit Trail", desc: "ledgit verify displays the ordered trail with risk badges and signature status. The web dashboard shows a calendar view with live polling.", icon: "🔍" },
]

export default function ArchitecturePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">L</div>
        <h1 className="text-xl font-bold">LEDGIT</h1>
      </Link>

      <h2 className="text-2xl font-bold mb-1">Architecture</h2>
      <p className="text-gray-400 text-sm mb-8">How LEDGIT connects agents, humans, Ledger, Hedera, and ENS</p>

      {/* Flow diagram */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">agent</span>
          <span className="text-gray-300">→</span>
          <span className="font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">CLI</span>
          <span className="text-gray-300">→</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">Ledger</span>
          <span className="text-gray-300">→</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">Hedera</span>
          <span className="text-gray-300">→</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">HCS</span>
          <span className="text-gray-300">→</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">ENS</span>
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full" style={{width: "100%"}}></div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-lg shrink-0">
                {step.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">Step {step.id}</span>
                  <h3 className="font-semibold text-sm text-gray-800">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stack */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-sm text-gray-800 mb-3">Tech Stack</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-medium text-gray-800">Ledger</div>
            <div className="text-xs text-gray-400 mt-0.5">Hardware signing</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-medium text-gray-800">Hedera</div>
            <div className="text-xs text-gray-400 mt-0.5">HCS + HTS</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-medium text-gray-800">ENS</div>
            <div className="text-xs text-gray-400 mt-0.5">Agent identity</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-medium text-gray-800">@hashgraph/sdk</div>
            <div className="text-xs text-gray-400 mt-0.5">Hedera JS SDK</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-medium text-gray-800">viem</div>
            <div className="text-xs text-gray-400 mt-0.5">ENS resolution</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-medium text-gray-800">Commander.js</div>
            <div className="text-xs text-gray-400 mt-0.5">CLI framework</div>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 space-y-1">
        <p><Link href="/" className="hover:underline">LEDGIT</Link> · Built at ETHGlobal New York 2026</p>
      </div>
    </div>
  )
}
