"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Board {
  id: string;
  name: string;
}

interface Pin {
  id: string;
  account_id: string;
  board_id: string;
  title: string;
  description: string | null;
  link: string | null;
  image_url: string;
  alt_text: string | null;
  scheduled_for: string | null;
  status: string;
  error_message: string | null;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditPinPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [pin, setPin] = useState<Pin | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pins")
        .select("*")
        .eq("id", params.id)
        .single();
      if (error || !data) {
        setLoadError(error?.message || "Pin not found");
        return;
      }
      setPin(data as Pin);
      const { data: bs } = await supabase
        .from("pinterest_boards")
        .select("id, name")
        .eq("account_id", data.account_id)
        .order("name");
      setBoards(bs || []);
    };
    load();
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    setLoading(true);
    setSaveError("");
    const res = await fetch(`/api/pins/${pin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pin.title,
        description: pin.description,
        link: pin.link || null,
        image_url: pin.image_url,
        alt_text: pin.alt_text || null,
        board_id: pin.board_id,
        scheduled_for: pin.scheduled_for,
      }),
    });
    const json = await res.json();
    if (res.ok) {
      router.push("/dashboard/pins");
    } else {
      setSaveError(json.error || "Failed to save");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pin) return;
    if (!confirm("Delete this pin from the queue? This can't be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/pins/${pin.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/pins");
    } else {
      const json = await res.json().catch(() => ({}));
      setSaveError(json.error || "Failed to delete");
      setDeleting(false);
    }
  };

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {loadError}
      </div>
    );
  }
  if (!pin) {
    return <p className="text-brand-gray">Loading…</p>;
  }

  const locked = pin.status === "posted";

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/dashboard/pins"
            className="text-sm text-brand-gray hover:underline"
          >
            ← Back to pins
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark mt-1">Edit Pin</h1>
        </div>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            pin.status === "scheduled"
              ? "bg-blue-100 text-blue-700"
              : pin.status === "posted"
                ? "bg-green-100 text-green-700"
                : pin.status === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
          }`}
        >
          {pin.status}
        </span>
      </div>

      {locked && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4 text-sm">
          This pin has already been posted to Pinterest. It can&apos;t be edited
          here — edit it directly on Pinterest instead.
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {saveError}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-4 max-w-2xl"
      >
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Board
          </label>
          <select
            value={pin.board_id}
            onChange={(e) => setPin({ ...pin, board_id: e.target.value })}
            disabled={locked}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 disabled:bg-gray-50"
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Image URL
          </label>
          <input
            type="url"
            value={pin.image_url}
            onChange={(e) => setPin({ ...pin, image_url: e.target.value })}
            disabled={locked}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none disabled:bg-gray-50"
          />
          {pin.image_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={pin.image_url}
              alt="preview"
              className="mt-2 max-h-48 rounded-lg border"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Title
          </label>
          <input
            type="text"
            value={pin.title}
            onChange={(e) => setPin({ ...pin, title: e.target.value })}
            maxLength={100}
            disabled={locked}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none disabled:bg-gray-50"
          />
          <p className="text-xs text-brand-gray mt-1">
            {pin.title.length}/100 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Description
          </label>
          <textarea
            value={pin.description ?? ""}
            onChange={(e) => setPin({ ...pin, description: e.target.value })}
            rows={6}
            maxLength={500}
            disabled={locked}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none font-mono text-sm disabled:bg-gray-50"
          />
          <p className="text-xs text-brand-gray mt-1">
            {(pin.description ?? "").length}/500 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Link
          </label>
          <input
            type="url"
            value={pin.link ?? ""}
            onChange={(e) => setPin({ ...pin, link: e.target.value })}
            disabled={locked}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Alt text
          </label>
          <input
            type="text"
            value={pin.alt_text ?? ""}
            onChange={(e) => setPin({ ...pin, alt_text: e.target.value })}
            disabled={locked}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Scheduled for
          </label>
          <input
            type="datetime-local"
            value={toLocalInput(pin.scheduled_for)}
            onChange={(e) =>
              setPin({
                ...pin,
                scheduled_for: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              })
            }
            disabled={locked}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none disabled:bg-gray-50"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || locked}
            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-full disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
          {!locked && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete pin"}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
