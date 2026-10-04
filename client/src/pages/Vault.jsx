import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  LoaderCircle,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { api, ApiError } from "../services/api";

const ACTIVE_STATUSES = new Set([
  "queued",
  "classifying",
  "extracting",
  "verifying",
  "researching",
]);
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const REPORT_SECTIONS = [
  ["eligibility", "Eligibility"],
  ["timeline", "Timeline"],
  ["how_to_apply", "How to apply"],
  ["past_editions", "Past editions"],
  ["selection_criteria", "Selection criteria"],
  ["red_flags", "Red flags"],
];

function dateKey(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

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

function SavedCalendar({ reels, selectedKey, onSelect }) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const savedByDay = useMemo(() => {
    const map = new Map();
    reels.forEach((reel) => {
      const key = dateKey(reel.created_at);
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [reels]);

  const year = month.getFullYear();
  const index = month.getMonth();
  const label = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(month);
  const firstWeekday = new Date(year, index, 1).getDay();
  const daysInMonth = new Date(year, index + 1, 0).getDate();
  const todayKey = dateKey(new Date());
  const cells = Array.from({ length: 42 }, (_, cell) => {
    const day = cell - firstWeekday + 1;
    return day < 1 || day > daysInMonth ? null : day;
  });

  return (
    <section
      className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm"
      aria-label="Saved reels calendar"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[#114b43]">
          <CalendarDays size={17} />
          <span className="text-[11px] font-bold uppercase tracking-widest">
            Saved reels
          </span>
        </div>
        <div className="flex">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonth(new Date(year, index - 1, 1))}
            className="p-1 text-gray-500 hover:text-[#114b43]"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonth(new Date(year, index + 1, 1))}
            className="p-1 text-gray-500 hover:text-[#114b43]"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <p className="font-bold text-sm text-[#1a1a1a] mb-3">{label}</p>
      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((day, i) => (
          <span
            key={`${day}-${i}`}
            className="pb-1 text-[10px] font-bold text-gray-400"
          >
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center gap-y-1">
        {cells.map((day, cell) => {
          if (!day) return <span key={`blank-${cell}`} className="h-8" />;
          const key = `${year}-${index}-${day}`;
          const count = savedByDay.get(key) || 0;
          const selected = selectedKey === key;
          const isToday = todayKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (count) onSelect(selected ? "" : key);
              }}
              className={`mx-auto flex h-8 w-8 min-w-0 items-center justify-center rounded-full text-xs ${
                selected
                  ? "bg-[#114b43] text-white font-bold"
                  : count
                    ? "bg-[#d4f954] text-[#1a1a1a] font-bold"
                    : isToday
                      ? "text-[#114b43] font-semibold"
                      : "text-gray-600"
              } ${count ? "hover:ring-2 hover:ring-[#114b43]/30" : "cursor-default"}`}
              aria-label={
                count
                  ? `${day}, ${count} saved reel${count === 1 ? "" : "s"}`
                  : `${day}`
              }
            >
              {day}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        <span className="inline-block w-2 h-2 rounded-full bg-[#d4f954] mr-1.5" />
        Reel saved — click a highlighted day to filter
      </p>
    </section>
  );
}

function DeepFridge({ reels, researchByReel }) {
  const completed = reels
    .map((reel) => ({ reel, result: researchByReel[reel.reel_id] }))
    .filter(
      ({ result }) =>
        result?.status === "done" || result?.status === "not_opportunity",
    );
  return (
    <section
      className="mt-12 border-t border-black/10 pt-10"
      aria-label="Deep Fridge research"
    >
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#114b43]">
          Deep Fridge
        </p>
        <h2 className="font-display text-3xl tracking-wide uppercase text-[#1a1a1a] mt-1">
          ELABORATED RESEARCH
        </h2>
        <p className="text-gray-600 font-medium mt-2">
          Gemini’s verification and deeper research for your saved reels.
        </p>
      </div>
      {completed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
          Run Research on a reel to see its verification and detailed findings
          here.
        </div>
      ) : (
        <div className="space-y-5">
          {completed.map(({ reel, result }) => {
            const verification = result.verification;
            const report = result.report;
            return (
              <article
                key={result.id}
                className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-[#1a1a1a]">
                  {reel.title}
                </h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#114b43]">
                  {verification?.verdict?.replaceAll("_", " ") ||
                    "Not an opportunity"}
                </p>
                {verification?.summary && (
                  <p className="mt-3 text-gray-700">{verification.summary}</p>
                )}
                {report && (
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {REPORT_SECTIONS.map(
                      ([key, heading]) =>
                        report[key]?.length > 0 && (
                          <div key={key}>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                              {heading}
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                              {report[key].map((claim, claimIndex) => (
                                <li key={`${key}-${claimIndex}`}>
                                  <p>{claim.text}</p>
                                  {claim.source_urls?.map((url) => (
                                    <a
                                      key={url}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
                                    >
                                      Source
                                    </a>
                                  ))}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ),
                    )}
                  </div>
                )}
                {verification?.official_urls?.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {verification.official_urls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800"
                      >
                        Official source
                      </a>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function Vault() {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [loadError, setLoadError] = useState("");
  const [researchByReel, setResearchByReel] = useState({});

  const loadReels = async () => {
    try {
      const saved = await api.listReels();
      setReels(saved);
      const research = await Promise.all(
        saved.map(async (reel) => {
          try {
            return [reel.reel_id, await api.getResearch(reel.reel_id)];
          } catch {
            return null;
          }
        }),
      );
      setResearchByReel(Object.fromEntries(research.filter(Boolean)));
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "Unable to load your vault.",
      );
      setReels([]);
    }
  };

  useEffect(() => {
    const request = window.setTimeout(() => {
      void loadReels();
    }, 0);
    return () => window.clearTimeout(request);
  }, []);

  const activeIds = Object.entries(researchByReel)
    .filter(([, result]) => ACTIVE_STATUSES.has(result.status))
    .map(([reelId]) => reelId)
    .join(",");

  useEffect(() => {
    if (!activeIds) return undefined;
    let cancelled = false;
    const refresh = async () => {
      const records = await Promise.all(
        activeIds.split(",").map(async (reelId) => {
          try {
            return [reelId, await api.getResearch(reelId)];
          } catch {
            return null;
          }
        }),
      );
      if (!cancelled)
        setResearchByReel((current) => ({
          ...current,
          ...Object.fromEntries(records.filter(Boolean)),
        }));
    };
    refresh();
    const interval = window.setInterval(refresh, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeIds]);

  const filtered = reels.filter((reel) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      reel.title.toLowerCase().includes(q) ||
      (reel.transcript || "").toLowerCase().includes(q) ||
      (reel.author || "").toLowerCase().includes(q);
    const matchesDay = !selectedDay || dateKey(reel.created_at) === selectedDay;
    return matchesSearch && matchesDay;
  });

  const handleDelete = async (reelId) => {
    try {
      await api.deleteReel(reelId);
      setReels((current) => current.filter((reel) => reel.reel_id !== reelId));
      setResearchByReel((current) => {
        const next = { ...current };
        delete next[reelId];
        return next;
      });
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "Could not delete this reel.",
      );
    }
  };

  const handleResearch = async (reel) => {
    setLoadError("");
    try {
      const result = await api.startResearch(reel.reel_id, {
        transcript: reel.transcript || "",
        caption: reel.caption || "",
        title: reel.title || "",
      });
      setResearchByReel((current) => ({ ...current, [reel.reel_id]: result }));
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "Could not start Gemini verification.",
      );
    }
  };

  return (
    <div className="w-full pb-10">
      <header className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-[#1a1a1a] uppercase mb-3">
            YOUR VAULT
          </h1>
          <p className="text-gray-600 font-medium text-lg">
            Every reel you saved, with its real title and full transcript.
          </p>
        </div>
        <SavedCalendar
          reels={reels}
          selectedKey={selectedDay}
          onSelect={setSelectedDay}
        />
      </header>

      {loadError && (
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-4">
          <AlertCircle size={16} /> {loadError}
        </div>
      )}

      {reels.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-10 sm:p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-[#F5F3E9] rounded-3xl flex items-center justify-center mb-6">
            <Bookmark size={32} className="text-[#114b43]" />
          </div>
          <h2 className="font-display text-2xl tracking-wide text-[#1a1a1a] uppercase mb-2">
            YOUR VAULT IS EMPTY
          </h2>
          <p className="text-gray-500 font-medium mb-8 max-w-sm">
            Paste a reel link on Home and the transcript will show up here.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="bg-[#114b43] text-white hover:bg-[#0d3b34] font-bold py-4 px-8 rounded-xl shadow-sm flex items-center gap-2"
          >
            SAVE A REEL <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search titles or transcripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#114b43] focus:ring-1 focus:ring-[#114b43]"
            />
          </div>
          {selectedDay && (
            <button
              type="button"
              onClick={() => setSelectedDay("")}
              className="text-xs font-bold uppercase tracking-widest text-[#114b43]"
            >
              Clear date filter
            </button>
          )}
          {filtered.length === 0 ? (
            <p className="text-gray-500 font-medium">
              No reels match that search.
            </p>
          ) : (
            <div className="space-y-4">
              {filtered.map((reel) => {
                const result = researchByReel[reel.reel_id];
                const researching =
                  result && ACTIVE_STATUSES.has(result.status);
                const body =
                  reel.transcript || reel.caption || "No transcript available.";
                return (
                  <article
                    key={reel.reel_id}
                    className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                          {reel.platform}
                          {reel.author ? ` · ${reel.author}` : ""}
                        </div>
                        <h3 className="text-[#1a1a1a] font-bold text-xl leading-snug">
                          {reel.title}
                        </h3>
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <CalendarDays size={14} /> Saved{" "}
                          {formatDate(reel.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(reel.reel_id)}
                        className="text-gray-300 hover:text-red-500 p-1"
                        title="Remove from vault"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {body}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <a
                        href={reel.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 underline underline-offset-4 hover:text-blue-800"
                      >
                        Open original <ExternalLink size={13} />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleResearch(reel)}
                        disabled={researching}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#114b43] px-3 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#0d3b34] disabled:opacity-60"
                      >
                        <Sparkles size={14} />
                        {researching ? "Researching…" : "Research"}
                      </button>
                    </div>
                    {researching && (
                      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#114b43]">
                        <LoaderCircle size={16} className="animate-spin" />{" "}
                        verification in progress — this may take a few minutes.
                      </div>
                    )}
                    {result?.status === "failed" && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
                        <XCircle size={16} />{" "}
                        {result.error_code === "empty_content"
                          ? "This reel has no transcript or caption to research."
                          : "Research could not finish."}
                      </div>
                    )}
                    {result?.status === "done" && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-[#114b43]">
                        <CheckCircle2 size={16} /> Verification complete — see
                        Deep Fridge below.
                      </div>
                    )}
                    {result?.status === "not_opportunity" && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <Clock3 size={16} /> Gemini did not identify an
                        opportunity to verify.
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
      <DeepFridge reels={reels} researchByReel={researchByReel} />
    </div>
  );
}
