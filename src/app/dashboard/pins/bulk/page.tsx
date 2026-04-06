"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Account {
  id: string;
  pinterest_username: string;
  business_name: string | null;
}

interface Board {
  id: string;
  name: string;
}

interface PinRow {
  id: string;
  title: string;
  description: string;
  link: string;
  image_url: string;
  alt_text: string;
  scheduled_for: string;
}

function makeEmptyPin(): PinRow {
  return {
    id: Math.random().toString(36).slice(2),
    title: "",
    description: "",
    link: "",
    image_url: "",
    alt_text: "",
    scheduled_for: "",
  };
}

export default function BulkPinsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [accountId, setAccountId] = useState("");
  const [boardId, setBoardId] = useState("");
  const [pins, setPins] = useState<PinRow[]>([
    makeEmptyPin(),
    makeEmptyPin(),
    makeEmptyPin(),
  ]);
  const [startDate, setStartDate] = useState("");
  const [intervalHours, setIntervalHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("pinterest_accounts")
        .select("id, pinterest_username, business_name")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setAccounts(data);
        setAccountId(data[0].id);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!accountId) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("pinterest_boards")
        .select("id, name")
        .eq("account_id", accountId)
        .order("name");
      setBoards(data || []);
      if (data && data.length > 0) setBoardId(data[0].id);
    };
    load();
  }, [accountId]);

  const updatePin = (id: string, field: keyof PinRow, value: string) => {
    setPins((p) =>
      p.map((pin) => (pin.id === id ? { ...pin, [field]: value } : pin))
    );
  };

  const addRow = () => setPins((p) => [...p, makeEmptyPin()]);
  const removeRow = (id: string) =>
    setPins((p) => (p.length > 1 ? p.filter((x) => x.id !== id) : p));

  const autoSchedule = () => {
    if (!startDate) {
      setError("Set a start date first");
      return;
    }
    const start = new Date(startDate);
    setPins((p) =>
      p.map((pin, i) => {
        const d = new Date(start.getTime() + i * intervalHours * 3600 * 1000);
        const iso = d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM for datetime-local
        return { ...pin, scheduled_for: iso };
      })
    );
  };

  const applyDefaults = (field: keyof PinRow, value: string) => {
    setPins((p) => p.map((pin) => ({ ...pin, [field]: value })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResults(null);

    const validPins = pins.filter((p) => p.title && p.image_url);
    if (validPins.length === 0) {
      setError("Add at least one pin with title and image URL");
      return;
    }

    setLoading(true);
    let success = 0;
    let failed = 0;

    for (const pin of validPins) {
      const res = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId,
          board_id: boardId,
          title: pin.title,
          description: pin.description || null,
          link: pin.link || null,
          image_url: pin.image_url,
          alt_text: pin.alt_text || null,
          scheduled_for: pin.scheduled_for
            ? new Date(pin.scheduled_for).toISOString()
            : null,
        }),
      });
      if (res.ok) success++;
      else failed++;
    }

    setLoading(false);
    setResults({ success, failed });

    if (failed === 0) {
      setTimeout(() => router.push("/dashboard/pins"), 1500);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <p className="text-brand-gray mb-4">
          Connect a Pinterest account first.
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-full text-sm"
        >
          Go to Accounts
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-dark">Bulk Schedule</h1>
        <a
          href="/dashboard/pins/new"
          className="text-sm text-brand-gray hover:text-brand-dark"
        >
          ← Single pin
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      {results && (
        <div
          className={`${results.failed === 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-yellow-50 border-yellow-200 text-yellow-700"} border px-4 py-3 rounded-lg mb-4 text-sm`}
        >
          {results.success} succeeded, {results.failed} failed
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Account + Board selection */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">
                Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.business_name || a.pinterest_username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">
                Board (all pins will go here)
              </label>
              <select
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
              >
                {boards.length === 0 && <option value="">No boards</option>}
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Auto-schedule tool */}
        <div className="bg-brand-dark text-white rounded-2xl p-4 mb-4">
          <h2 className="font-bold mb-3">Auto-Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Start date/time
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border-2 border-gray-700 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Interval (hours between pins)
              </label>
              <input
                type="number"
                min="1"
                value={intervalHours}
                onChange={(e) => setIntervalHours(parseInt(e.target.value) || 1)}
                className="w-full border-2 border-gray-700 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={autoSchedule}
                className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 rounded-lg text-sm"
              >
                Apply to All
              </button>
            </div>
          </div>
        </div>

        {/* Bulk defaults */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="font-bold text-brand-dark mb-3 text-sm">
            Quick fill (applies to all rows)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Default description for all pins"
              onBlur={(e) =>
                e.target.value && applyDefaults("description", e.target.value)
              }
              className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="url"
              placeholder="Default link for all pins"
              onBlur={(e) =>
                e.target.value && applyDefaults("link", e.target.value)
              }
              className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Pin rows */}
        <div className="space-y-3 mb-4">
          {pins.map((pin, i) => (
            <div
              key={pin.id}
              className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <span className="text-brand-gray font-bold text-sm mt-2">
                  #{i + 1}
                </span>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="Image URL *"
                    value={pin.image_url}
                    onChange={(e) =>
                      updatePin(pin.id, "image_url", e.target.value)
                    }
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Title *"
                    value={pin.title}
                    onChange={(e) =>
                      updatePin(pin.id, "title", e.target.value)
                    }
                    maxLength={100}
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="url"
                    placeholder="Link URL (where pin links to)"
                    value={pin.link}
                    onChange={(e) =>
                      updatePin(pin.id, "link", e.target.value)
                    }
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={pin.description}
                    onChange={(e) =>
                      updatePin(pin.id, "description", e.target.value)
                    }
                    maxLength={500}
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="datetime-local"
                    value={pin.scheduled_for}
                    onChange={(e) =>
                      updatePin(pin.id, "scheduled_for", e.target.value)
                    }
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="flex items-center">
                    {pin.image_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={pin.image_url}
                        alt=""
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(pin.id)}
                  className="text-red-500 hover:text-red-700 text-xl font-bold mt-1"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={addRow}
            className="bg-brand-gray-light hover:bg-gray-200 text-brand-dark font-semibold py-2 px-4 rounded-full text-sm"
          >
            + Add Row
          </button>
          <button
            type="submit"
            disabled={loading || !boardId}
            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-full disabled:opacity-50"
          >
            {loading
              ? "Scheduling..."
              : `Schedule ${pins.filter((p) => p.title && p.image_url).length} Pins`}
          </button>
        </div>
      </form>
    </>
  );
}
