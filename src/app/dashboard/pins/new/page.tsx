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

export default function NewPinPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [accountId, setAccountId] = useState("");
  const [boardId, setBoardId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
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
    loadAccounts();
  }, []);

  useEffect(() => {
    if (!accountId) return;
    const loadBoards = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("pinterest_boards")
        .select("id, name")
        .eq("account_id", accountId)
        .order("name");
      setBoards(data || []);
      if (data && data.length > 0) setBoardId(data[0].id);
    };
    loadBoards();
  }, [accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/pins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_id: accountId,
        board_id: boardId,
        title,
        description,
        link: link || null,
        image_url: imageUrl,
        alt_text: altText || null,
        scheduled_for: scheduledFor
          ? new Date(scheduledFor).toISOString()
          : null,
      }),
    });

    const json = await res.json();
    if (res.ok) {
      router.push("/dashboard/pins");
    } else {
      setError(json.error || "Failed to create pin");
      setLoading(false);
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
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Create Pin</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-4 max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1">
              Account *
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
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
              Board *
            </label>
            <select
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              required
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

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Image URL *
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none"
            placeholder="https://example.com/image.jpg"
          />
          {imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt="preview"
              className="mt-2 max-h-48 rounded-lg border"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none"
            placeholder="Your pin title (max 100 chars)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none"
            placeholder="Keywords, hashtags, description..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Link
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none"
            placeholder="https://yoursite.com/page"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Alt text
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none"
            placeholder="Describe the image for accessibility"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Schedule for later (optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none"
          />
          <p className="text-xs text-brand-gray mt-1">
            Leave empty to publish immediately.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !boardId}
          className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-full disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : scheduledFor
              ? "Schedule Pin"
              : "Publish Pin Now"}
        </button>
      </form>
    </>
  );
}
