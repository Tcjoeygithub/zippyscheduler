"use client";

import { useEffect, useState } from "react";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/api-keys");
    const json = await res.json();
    setKeys(json.keys || []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (res.ok) {
      setNewKey(json.key);
      setName("");
      load();
    }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this API key? Scripts using it will stop working."))
      return;
    await fetch("/api/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-brand-dark mb-6">API Keys</h1>

      {newKey && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-brand-dark mb-2">
            Your new API key (save it now!)
          </h3>
          <p className="text-sm text-brand-gray mb-3">
            This is the only time you&rsquo;ll see this key. Copy it and store
            it securely.
          </p>
          <div className="bg-white border-2 border-gray-200 rounded-lg p-3 font-mono text-sm break-all">
            {newKey}
          </div>
          <button
            onClick={() => setNewKey("")}
            className="mt-3 text-sm text-brand-gray hover:text-brand-dark"
          >
            I&rsquo;ve saved it, close
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-brand-dark mb-4">
          Create New Key
        </h2>
        <form onSubmit={create} className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Monster Truck Site"
            required
            className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-full disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Key"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-brand-dark mb-4">Your Keys</h2>
        {keys.length === 0 ? (
          <p className="text-brand-gray text-sm">No API keys yet.</p>
        ) : (
          <ul className="space-y-2">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between p-3 bg-brand-gray-light rounded-lg"
              >
                <div>
                  <p className="font-semibold text-brand-dark">{k.name}</p>
                  <p className="text-xs text-brand-gray font-mono">
                    {k.key_prefix}•••
                  </p>
                  <p className="text-xs text-brand-gray mt-1">
                    Created {new Date(k.created_at).toLocaleDateString()}
                    {k.last_used_at &&
                      ` • Last used ${new Date(k.last_used_at).toLocaleString()}`}
                  </p>
                </div>
                <button
                  onClick={() => del(k.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-brand-dark text-white rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">API Documentation</h2>
        <p className="text-sm text-gray-300 mb-4">
          Use your API key to automate pin creation from any script or site.
        </p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-white mb-1">
              List your Pinterest accounts:
            </p>
            <pre className="bg-black/50 rounded p-3 overflow-x-auto text-xs font-mono">
              {`curl https://zippyscheduler.com/api/v1/accounts \\
  -H "Authorization: Bearer YOUR_KEY"`}
            </pre>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">
              List boards for an account:
            </p>
            <pre className="bg-black/50 rounded p-3 overflow-x-auto text-xs font-mono">
              {`curl "https://zippyscheduler.com/api/v1/boards?account_id=UUID" \\
  -H "Authorization: Bearer YOUR_KEY"`}
            </pre>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">
              Create/schedule a pin:
            </p>
            <pre className="bg-black/50 rounded p-3 overflow-x-auto text-xs font-mono">
              {`curl -X POST https://zippyscheduler.com/api/v1/pins \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "account_id": "uuid",
    "board_id": "uuid",
    "title": "My Pin Title",
    "description": "Pin description with #hashtags",
    "link": "https://mysite.com/page",
    "image_url": "https://mysite.com/image.png",
    "scheduled_for": "2026-05-01T14:00:00Z"
  }'`}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}
