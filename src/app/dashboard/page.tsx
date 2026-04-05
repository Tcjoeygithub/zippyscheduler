import { createClient } from "@/lib/supabase/server";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: accounts } = await supabase
    .from("pinterest_accounts")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <>
      {searchParams.connected && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Pinterest account connected successfully!
        </div>
      )}
      {searchParams.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          Error: {searchParams.error}
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

        {!accounts || accounts.length === 0 ? (
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
                <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  Connected
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
