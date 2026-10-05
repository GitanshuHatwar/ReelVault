import { useEffect, useState } from "react";
import { AlertCircle, ExternalLink, Link2 } from "lucide-react";
import { api, ApiError } from "../services/api";

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
}

export default function Links() {
  const [links, setLinks] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .listSavedLinks()
      .then((saved) => {
        if (!cancelled) setLinks(saved);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(error instanceof ApiError ? error.message : "Unable to load saved links.");
        setLinks([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full pb-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-[#1a1a1a] uppercase mb-3">
          LINKS
        </h1>
        <p className="text-gray-600 font-medium text-lg">
          Saved links with their title, date, and hyperlink.
        </p>
      </header>

      {loadError && (
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-4">
          <AlertCircle size={16} /> {loadError}
        </div>
      )}

      {links.length === 0 && !loadError ? (
        <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F5F3E9]">
            <Link2 size={28} className="text-[#114b43]" />
          </div>
          <p className="text-gray-500 font-medium">No saved links yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <article
              key={link.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <h2 className="text-base font-bold text-[#1a1a1a]">{link.label}</h2>
              <p className="mt-1 text-sm text-gray-500">{formatDate(link.created_at)}</p>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                {link.url}
                <ExternalLink size={13} />
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
