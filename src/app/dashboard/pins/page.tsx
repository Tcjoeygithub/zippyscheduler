import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  posted: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default async function PinsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pins } = await supabase
    .from("pins")
    .select("*, pinterest_boards(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-dark">Pins</h1>
        <Link
          href="/dashboard/pins/new"
          className="bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-2 px-4 rounded-full text-sm"
        >
          + New Pin
        </Link>
      </div>

      {!pins || pins.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-brand-gray mb-4">No pins yet.</p>
          <Link
            href="/dashboard/pins/new"
            className="inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-full"
          >
            Create Your First Pin
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-gray-light border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-brand-dark">
                  Image
                </th>
                <th className="text-left p-4 font-semibold text-brand-dark">
                  Title
                </th>
                <th className="text-left p-4 font-semibold text-brand-dark hidden md:table-cell">
                  Board
                </th>
                <th className="text-left p-4 font-semibold text-brand-dark">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-brand-dark hidden lg:table-cell">
                  When
                </th>
              </tr>
            </thead>
            <tbody>
              {pins.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image_url}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-brand-dark line-clamp-1">
                      {p.title}
                    </p>
                    {p.link && (
                      <p className="text-xs text-brand-gray truncate max-w-xs">
                        {p.link}
                      </p>
                    )}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
