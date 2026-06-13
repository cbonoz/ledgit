import Link from "next/link"

const faqs = [
  {
    q: "Do I need an ENS name to use LEDGIT?",
    a: "No. Without an ENS name, set LEDGIT_TOPIC_ID in your .env and it works the same way. ENS just makes verification self-discoverable — anyone can resolve the name instead of passing around a topic ID.",
  },
  {
    q: "How do I set up my existing ENS name with LEDGIT?",
    a: <>Two steps. First, run <code className="bg-gray-100 px-1 rounded text-xs font-mono">ledgit init --agent yourname.eth</code> to create an HCS topic. Second, go to sepolia.ens.app (or your ENS manager), find your name, and add a text record with key <code className="bg-gray-100 px-1 rounded text-xs font-mono">ledgit.hcs.topic</code> and value set to your topic ID. Then <code className="bg-gray-100 px-1 rounded text-xs font-mono">ledgit verify yourname.eth</code> resolves automatically — no env vars needed.</>,
  },
  {
    q: "Do I need a Ledger device?",
    a: "For high and medium risk actions, yes — that's the point. Low-risk actions skip hardware. If you don't have a Ledger, you can still use low-risk actions for development, or the CLI falls back to software signing.",
  },
  {
    q: "Does this cost real money?",
    a: "Everything in this demo runs on Hedera testnet (free HBAR from portal.hedera.com) and ENS Sepolia (testnet). No real funds required. For mainnet production, you'd need real HBAR for HCS messages and transfers, and real ETH for ENS operations.",
  },
  {
    q: "Can I use mainnet?",
    a: "The code is ready — set HEDERA_NETWORK=mainnet and network.ens: 'mainnet' in config. HashScan and mirror node URLs auto-switch. But the demo was built and tested on testnet.",
  },
  {
    q: "Why two Ledger prompts (HBAR + contract)?",
    a: "Each action is reviewed independently on the device. The human sees and approves every high/medium risk action one at a time. This is intentional — you don't want blind batch approvals.",
  },
  {
    q: "Can I add custom action types?",
    a: "Yes — edit .ledgit/config.json. Each action type has a type name, label, description template, fields, and risk level. Run ledgit tools schema after editing to regenerate the agent tool definition.",
  },
  {
    q: "How do I verify a signature?",
    a: <>Run <code className="bg-gray-100 px-1 rounded text-xs font-mono">ledgit verify-sig {"<action-id>"} --agent {"<name>"}</code>. This recovers the signer&apos;s Ethereum address from the Ledger signature using viem. Software-generated signatures (low risk) show a note instead.</>,
  },
  {
    q: "What happens if an agent sends a transaction outside LEDGIT?",
    a: "It won't appear in the audit trail. The dashboard shows a red dashed border with Missing Signature for high-risk actions without a Ledger signature. The action is visible on HCS but flagged as unverified.",
  },
  {
    q: "Can multiple agents share one HCS topic?",
    a: "Yes — set the same topic ID for each agent in .ledgit/config.json. Each action records the agent name so the trail is filterable. Alternatively, each agent gets their own topic for full isolation.",
  },
  {
    q: "How is encryption handled?",
    a: "Set ENCRYPTION_KEY (64 hex chars) in your .env. Actions submitted after that are encrypted with AES-256-GCM before HCS submission. Sequence numbers and timestamps remain public; content is private to key holders. The dashboard shows 🔒 Encrypted if the key isn't available.",
  },
  {
    q: "How does LEDGIT compare to the Hedera Agent Kit?",
    a: "The Hedera Agent Kit is a LangChain toolkit for Hedera operations (transfers, tokens, HCS messaging). LEDGIT is the human-in-the-loop audit layer. The Agent Kit returns unsigned bytes for human approval — you figure out signing. LEDGIT sends actions directly to a Ledger device for one-button hardware approval, then records the signed proof to HCS with risk levels and ENS identity. They're complementary: use the Agent Kit for agent framework integration and LEDGIT for hardware signing and audit. See the full comparison in the README.",
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">L</div>
        <h1 className="text-xl font-bold">LEDGIT</h1>
      </Link>

      <h2 className="text-2xl font-bold mb-1">FAQ</h2>
      <p className="text-gray-400 text-sm mb-8">Common questions about LEDGIT</p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
            <summary className="px-5 py-4 font-semibold text-sm text-gray-800 cursor-pointer hover:bg-gray-50 transition-colors list-none flex items-center justify-between">
              {faq.q}
              <svg className="w-4 h-4 text-gray-300 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {faq.a}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 space-y-1">
        <p><Link href="/" className="hover:underline">LEDGIT</Link> · Built at ETHGlobal New York 2026</p>
        <p className="text-gray-300">This project is provided as-is for demonstration purposes. Not audited for production use.</p>
      </div>
    </div>
  )
}
