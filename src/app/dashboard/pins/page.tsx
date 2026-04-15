import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  posted: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const STATUSES = ["all", "scheduled", "posted", "draft", "failed"] as const;
type Status = (typeof STATUSES)[number];

const SORT_OPTIONS = {
  scheduled_for: "Scheduled time",
  created_at: "Created time",
  posted_at: "Posted time",
  title: "Title",
  status: "Status",
} as const;
type SortKey = keyof typeof SORT_OPTIONS;

const PER_PAGE = 50;

interface Props {
  searchParams: {
    status?: string;
    board?: string;
    sort?: string;
    order?: string;
    page?: string;
    q?: string;
  };
}

export default async function PinsPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const status = (STATUSES as readonly string[]).includes(searchParams.status ?? "")
    ? (searchParams.status as Status)
    : "all";
  const sort: SortKey = (
    Object.keys(SORT_OPTIONS) as SortKey[]
  ).includes(searchParams.sort as SortKey)
    ? (searchParams.sort as SortKey)
    : "scheduled_for";
  const order = searchParams.order === "asc" ? "asc" : "desc";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const boardFilter = searchParams.board ?? "";
  const searchQ = (searchParams.q ?? "").trim();

  // Load all boards for the filter dropdown (cheap — handful of rows)
  const { data: boards } = await supabase
    .from("pinterest_boards")
    .select("id, name, account_id, pinterest_accounts!inner(user_id)")
    .eq("pinterest_accounts.user_id", user!.id)
    .order("name");

  let query = supabase
    .from("pins")
    .select("*, pinterest_boards(name)", { count: "exact" })
    .eq("user_id", user!.id);

  if (status !== "all") query = query.eq("status", status);
  if (boardFilter) query = query.eq("board_id", boardFilter);
  if (searchQ) query = query.or(`title.ilike.%${searchQ}%,description.ilike.%${searchQ}%`);

  // When sorting by scheduled_for/posted_at, put nulls last.
  query = query.order(sort, {
    ascending: order === "asc",
    nullsFirst: false,
  });

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  const { data: pins, count } = await query.range(from, to);

  const totalPages = count ? Math.ceil(count / PER_PAGE) : 1;

  // Helpers for building links that preserve other params
  const qs = (override: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const next = {
      status: override.status ?? (status === "all" ? "" : status),
      board: override.board ?? boardFilter,
      sort: override.sort ?? sort,
      order: override.order ?? order,
      page: override.page ?? String(page),
      q: override.q ?? searchQ,
    };
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  // Status counts — one query per status (small, only 4 statuses)
  const statusCountEntries = await Promise.all(
    (["scheduled", "posted", "draft", "failed"] as const).map(async (s) => {
      const { count: n } = await supabase
        .from("pins")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("status", s);
      return [s, n ?? 0] as const;
    })
  );
  const statusCounts = Object.fromEntries(statusCountEntries) as Record<string, number>;
  const countFor = (s: string) => statusCounts[s] ?? null;

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-brand-dark">Pins</h1>
        <Link
          href="/dashboard/pins/new"
          className="bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-2 px-4 rounded-full text-sm"
        >
          + New Pin
        </Link>
      </div>

      {/* Filter / sort / search bar */}
      <form
        method="GET"
        className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-brand-gray mb-1">
            Search
          </label>
          <input
            type="search"
            name="q"
            defaultValue={searchQ}
            placeholder="Title or description..."
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-gray mb-1">
            Status
          </label>
          <select
            name="status"
            defaultValue={status}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => {
              const n = s === "all" ? count ?? null : countFor(s);
              return (
                <option key={s} value={s === "all" ? "" : s}>
                  {s}
                  {n !== null ? ` (${n})` : ""}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-gray mb-1">
            Board
          </label>
          <select
            name="board"
            defaultValue={boardFilter}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[160px] max-w-[240px]"
          >
            <option value="">All boards</option>
            {(boards ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-gray mb-1">
            Sort by
          </label>
          <select
            name="sort"
            defaultValue={sort}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {Object.entries(SORT_OPTIONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-gray mb-1">
            Order
          </label>
          <select
            name="order"
            defaultValue={order}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-2 px-4 rounded-lg text-sm"
        >
          Apply
        </button>
        {(status !== "all" || boardFilter || searchQ || sort !== "scheduled_for" || order !== "desc") && (
          <Link
            href="/dashboard/pins"
            className="text-sm text-brand-gray hover:text-brand-red py-2"
          >
            Reset
          </Link>
        )}
      </form>

      <p className="text-xs text-brand-gray mb-3">
        Showing {pins?.length ?? 0} of {count ?? 0} pins
        {status !== "all" && ` · status: ${status}`}
        {boardFilter && ` · board filtered`}
        {searchQ && ` · matching "${searchQ}"`}
      </p>

      {!pins || pins.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-brand-gray">No pins match the current filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-gray-light border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-brand-dark">Image</th>
                <th className="text-left p-4 font-semibold text-brand-dark">Title</th>
                <th className="text-left p-4 font-semibold text-brand-dark hidden md:table-cell">
                  Board
                </th>
                <th className="text-left p-4 font-semibold text-brand-dark">Status</th>
                <th className="text-left p-4 font-semibold text-brand-dark hidden lg:table-cell">
                  When
                </th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {pins.map((p) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-4">
                    <Link href={`/dashboard/pins/${p.id}`} className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image_url}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </Link>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/pins/${p.id}`}
                      className="block hover:text-brand-red"
                    >
                      <p className="font-semibold text-brand-dark line-clamp-1">
                        {p.title}
                      </p>
                      {p.link && (
                        <p className="text-xs text-brand-gray truncate max-w-xs">
                          {p.link}
                        </p>
                      )}
                    </Link>
                  </td>
                  <td className="p-4 hidden md:table-cell text-brand-gray">
                    {p.pinterest_boards?.name || "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[p.status] || "bg-gray-100"}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-xs text-brand-gray">
                    {p.status === "scheduled" && p.scheduled_for
                      ? new Date(p.scheduled_for).toLocaleString()
                      : p.status === "posted" && p.posted_at
                        ? new Date(p.posted_at).toLocaleString()
                        : new Date(p.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/dashboard/pins/${p.id}`}
                      className="text-xs font-semibold text-brand-red hover:underline"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 text-sm">
          <Link
            href={`/dashboard/pins${qs({ page: "1" })}`}
            className={`px-3 py-1 rounded border ${page === 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50"}`}
          >
            ←← First
          </Link>
          <Link
            href={`/dashboard/pins${qs({ page: String(Math.max(1, page - 1)) })}`}
            className={`px-3 py-1 rounded border ${page === 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50"}`}
          >
            ← Prev
          </Link>
          <span className="px-3 py-1 text-brand-gray">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/dashboard/pins${qs({ page: String(Math.min(totalPages, page + 1)) })}`}
            className={`px-3 py-1 rounded border ${page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-gray-50"}`}
          >
            Next →
          </Link>
          <Link
            href={`/dashboard/pins${qs({ page: String(totalPages) })}`}
            className={`px-3 py-1 rounded border ${page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-gray-50"}`}
          >
            Last →→
          </Link>
        </div>
      )}
    </>
  );
}
