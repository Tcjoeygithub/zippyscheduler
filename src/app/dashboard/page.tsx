"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Account {
  id: string;
  pinterest_username: string;
  business_name: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Check URL params for messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) setMessage("Pinterest account connected successfully!");
    if (params.get("error")) setError(params.get("error")!);
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const { data } = await supabase
      .from("pinterest_accounts")
      .select("id, pinterest_username, business_name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setAccounts(data || []);
    setLoading(false);
  };

  const disconnect = async (accountId: string, name: string) => {
    if (!confirm(`Disconnect ${name}? This will remove all boards and pins associated with this account from Zippy Scheduler.`)) return;

    const res = await fetch("/api/pinterest/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: accountId }),
    });

    if (res.ok) {
      setMessage("Account disconnected.");
      loadAccounts();
    } else {
      setError("Failed to disconnect.");
    }
  };

  return (
    <>
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {message}
          <button onClick={() => setMessage("")} className="float-right font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          Error: {error}
          <button onClick={() => setError("")} className="float-right font-bold">×</button>
        </div>
      )}

      <h1 className="text-3xl font-bold text-brand-dark mb-6">
        Pinterest Accounts
      </h1>

      <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-brand-dark">
            Connected Accounts
          </h2>
          <a
            href="/api/pinterest/connect"
            className="bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-2 px-4 rounded-full text-sm transition-colors"
          >
            + Connect Pinterest
          </a>
        </div>

        {loading ? (
          <div className="text-center py-8 text-brand-gray">Loading...</div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-brand-gray mb-4">
              No Pinterest accounts connected yet.
            </p>
            <a
              href="/api/pinterest/connect"
              className="inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Connect Your First Account
            </a>
          </div>
        ) : (
          <ul className="space-y-2">
            {accounts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between p-4 bg-brand-gray-light rounded-lg"
              >
                <div>
                  <p className="font-semibold text-brand-dark">
                    {a.business_name || a.pinterest_username}
                  </p>
                  <p className="text-sm text-brand-gray">
                    @{a.pinterest_username}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    Connected
                  </span>
                  <button
                    onClick={() => disconnect(a.id, a.business_name || a.pinterest_username)}
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Disconnect
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
