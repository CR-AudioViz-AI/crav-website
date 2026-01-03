import Link from "next/link";

const tools = [
  { slug: "pdf-editor", name: "PDF Editor", icon: "📄", desc: "Edit, merge, and split PDF documents" },
  { slug: "background-remover", name: "Background Remover", icon: "✂️", desc: "Remove backgrounds from images instantly" },
  { slug: "thumbnail-creator", name: "Thumbnail Creator", icon: "🖼️", desc: "Create eye-catching thumbnails" },
];

export default function ToolPage({ params }: { params: { tool: string } }) {
  const tool = tools.find(t => t.slug === params.tool);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <Link href="/apps" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">← Back to Apps</Link>
        <div className="text-6xl mb-4">{tool?.icon || "🛠️"}</div>
        <h1 className="text-4xl font-bold mb-4">{tool?.name || params.tool}</h1>
        <p className="text-xl text-slate-300 mb-8">{tool?.desc || "Professional tool coming soon"}</p>
        
        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-slate-300 mb-6">This tool is currently in development.</p>
          <Link href="/apps" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition-colors inline-block">
            Explore Available Apps
          </Link>
        </div>
      </div>
    </div>
  );
}
