"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Account {
  id: string;
  pinterest_username: string;
  business_name: string | null;
}

interface Board {
  id: string;
  pinterest_board_id: string;
  name: string;
  description: string;
  privacy: string;
  pin_count: number;
}

export default function BoardsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
        setSelectedAccount(data[0].id);
      }
    };
    loadAccounts();
  }, []);

  const loadBoards = useCallback(async () => {
    if (!selectedAccount) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/boards?account_id=${selectedAccount}`);
      const json = await res.json();
      if (res.ok) {
        setBoards(json.boards);
      } else {
        setError(json.error || "Failed to load boards");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }, [selectedAccount]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_id: selectedAccount,
        name,
        description,
        privacy: "PUBLIC",
      }),
    });
    const json = await res.json();
    if (res.ok) {
      setShowCreate(false);
      setName("");
      setDescription("");
      loadBoards();
    } else {
      setError(json.error || "Failed to create board");
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <p className="text-brand-gray mb-4">
          Connect a Pinterest account first to manage boards.
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-brand-dark">Boards</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-2 px-4 rounded-full text-sm"
        >
          {showCreate ? "Cancel" : "+ New Board"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
        <label className="block text-sm font-semibold text-brand-dark mb-1">
          Pinterest Account
        </label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.business_name || a.pinterest_username}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-brand-dark">Create Board</h2>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none"
              placeholder="My Awesome Board"
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
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red focus:outline-none"
              placeholder="What's this board about?"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-full"
          >
            Create Board
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-brand-gray">Loading...</div>
      ) : boards.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-brand-gray">
            No boards yet. Create your first board above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-lg text-brand-dark mb-1">
                {b.name}
              </h3>
              <p className="text-sm text-brand-gray line-clamp-2 mb-3">
                {b.description || "No description"}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-gray">
                  {b.pin_count} pin{b.pin_count !== 1 ? "s" : ""}
                </span>
                <span className="bg-brand-gray-light px-2 py-1 rounded-full text-brand-gray">
                  {b.privacy}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
