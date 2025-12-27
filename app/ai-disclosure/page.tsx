import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Disclosure | CRAIverse',
  description: 'Complete AI technology disclosure for CRAIverse',
};

export default function AIDisclosurePage() {
  const llmProviders = [
    { name: 'OpenAI', models: 'GPT-4 Turbo, GPT-4o, o1, GPT-3.5', status: 'Active' },
    { name: 'Anthropic', models: 'Claude 3.5 Sonnet, Claude 3 Opus/Haiku', status: 'Active' },
    { name: 'Google', models: 'Gemini 1.5 Pro, Gemini 2.0 Flash', status: 'Active' },
    { name: 'Mistral', models: 'Mistral Large, Mixtral 8x7B', status: 'Active' },
    { name: 'Meta', models: 'Llama 3.1, Llama 3.2', status: 'Active' },
    { name: 'Perplexity', models: 'Sonar models', status: 'Active' },
    { name: 'Cohere', models: 'Command R, Embed v3', status: 'Active' },
    { name: 'Groq', models: 'LPU-accelerated models', status: 'Active' },
  ];

  const mediaProviders = [
    { name: 'OpenAI DALL-E 3', type: 'Image Generation' },
    { name: 'Stability AI', type: 'Stable Diffusion XL/3' },
    { name: 'ElevenLabs', type: 'Voice Synthesis' },
    { name: 'OpenAI Whisper', type: 'Speech-to-Text' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">AI Disclosure</h1>
      <p className="text-xl text-gray-600 mb-8">Complete transparency about AI technologies we use</p>
      <p className="text-gray-500 mb-8">Last Updated: December 26, 2025</p>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-6">Large Language Models</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Provider</th>
                  <th className="border p-3 text-left">Models</th>
                  <th className="border p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {llmProviders.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border p-3 font-medium">{p.name}</td>
                    <td className="border p-3">{p.models}</td>
                    <td className="border p-3">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Image and Voice AI</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mediaProviders.map((p, i) => (
              <div key={i} className="border rounded-lg p-4">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-gray-600">{p.type}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Practices</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>OpenAI and Anthropic API data is NOT used for training</li>
            <li>We do NOT sell your prompts or conversations</li>
            <li>AI providers process data per their respective policies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">AI Limitations</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <ul className="list-disc pl-6 space-y-2 text-yellow-800">
              <li>AI may generate inaccurate or fabricated information</li>
              <li>Models may reflect biases from training data</li>
              <li>AI cannot provide medical, legal, or financial advice</li>
              <li>Always verify important information independently</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>AI Ethics: ai-ethics@craudiovizai.com</p>
          <p>Privacy: privacy@craudiovizai.com</p>
        </section>
      </div>
    </div>
  );
}
