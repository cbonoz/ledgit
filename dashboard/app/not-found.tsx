import Link from "next/link"

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-4xl mb-4">🔍</div>
      <h1 className="text-xl font-bold mb-2">Audit Trail Not Found</h1>
      <p className="text-gray-400 text-sm mb-6">
        Run&nbsp;
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 text-xs font-mono">
          ledgit dashboard &lt;agent-ens&gt;
        </code>
        &nbsp;from the CLI first to load the data.
      </p>
      <Link href="/" className="text-indigo-600 text-sm hover:underline">Back to home</Link>
    </div>
  )
}
