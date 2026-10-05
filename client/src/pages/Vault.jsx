import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  BookmarkPlus,
  CalendarPlus,
  CalendarDays,
  ExternalLink,
  LoaderCircle,
  List,
  Link2,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { api, ApiError } from "../services/api";
import SavedCalendar, { dateKey } from "../components/calendar/SavedCalendar";
import { useLanguage } from "../preferences/LanguageContext";

const ACTIVE_STATUSES = new Set([
  "queued",
  "classifying",
  "extracting",
  "verifying",
  "researching",
]);
const REPORT_SECTIONS = [
  ["eligibility", "Eligibility"],
  ["timeline", "Timeline"],
  ["how_to_apply", "How to apply"],
  ["past_editions", "Past editions"],
  ["selection_criteria", "Selection criteria"],
  ["red_flags", "Red flags"],
];

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

function transcriptChunks(text) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return ["This type of content cannot be transcribed."];
  const sentences = clean.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [clean];
  const chunks = [];
  for (let index = 0; index < sentences.length; index += 2) {
    chunks.push(sentences.slice(index, index + 2).join(" ").trim());
  }
  return chunks.filter(Boolean);
}

function StructuredTranscript({ text, expanded }) {
  const chunks = transcriptChunks(text);
  const visibleChunks = expanded ? chunks : chunks.slice(0, 1);
  return (
    <ul className="space-y-4 text-sm text-gray-700" aria-label="Transcript">
      {visibleChunks.map((chunk, index) => (
        <li key={`${index}-${chunk.slice(0, 20)}`} className="flex gap-3 leading-6">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#114b43]" aria-hidden="true" />
          <p className={expanded ? "" : "line-clamp-3"}>{chunk}</p>
        </li>
      ))}
    </ul>
  );
}

function displayContent(reel, language) {
  const original = reel.transcript || reel.caption || "This type of content cannot be transcribed.";
  if (language === "native") return original;
  return reel.analysis?.english_transcript || reel.analysis?.summary || "English transcription is being prepared for this reel.";
}

function sourceHref(url) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function toInputDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function ReelAnalysisPanel({ reel, onSaveLink, onSaveDate, onSaveToLinkVault, savedLinks, savedDates, linkVaultEntries }) {
  const analysis = reel.analysis;
  const [manualDate, setManualDate] = useState("");
  if (!analysis) return null;
  const details = analysis.details || {};
  const sources = analysis.sources || [];
  const dates = details.dates || [];
  const topics = [...new Set([...(analysis.tags || []), ...(details.competitions || []), ...(details.people || []), ...(details.books || [])])];
  const inLinkVault = linkVaultEntries.some((entry) => entry.reel_id === reel.reel_id);

  return <>
    <section className="mb-4 rounded-2xl border border-[#114b43]/10 bg-[#F5F3E9] p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43]">Reel summary</p>
      {analysis.summary_points?.length > 0 ? <ol className="mt-3 space-y-2 text-sm leading-6 text-gray-700">{analysis.summary_points.map((point, index) => <li key={`${index}-${point}`} className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#114b43] text-[10px] font-bold text-white">{index + 1}</span><span>{point}</span></li>)}</ol> : <p className="mt-2 text-sm leading-6 text-gray-700">{analysis.summary}</p>}
    </section>
    <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43]">Reel resources</p><p className="mt-1 text-sm text-gray-500">Save links, dates and search topics separately from the summary.</p></div><button type="button" onClick={() => onSaveToLinkVault(reel, sources, topics)} disabled={inLinkVault} className="inline-flex items-center gap-1.5 rounded-lg bg-[#114b43] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white disabled:bg-gray-300"><BookmarkPlus size={14} />{inLinkVault ? "In Link Vault" : "Add to Link Vault"}</button></div>
      <div className="mt-4 grid gap-5 lg:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Links & sources</p>{sources.length === 0 ? <p className="text-sm text-gray-400">No links were found in this reel.</p> : <div className="flex flex-wrap gap-2">{sources.map((source, index) => { const href = sourceHref(source.url || (/^[\w.-]+\.[a-z]{2,}(?:\/\S*)?$/i.test(source.name) ? source.name : null)); const saved = savedLinks.some((item) => item.reel_id === reel.reel_id && item.url === href); return <span key={`${source.name}-${index}`} className="inline-flex items-center gap-2 rounded-lg bg-[#F5F3E9] px-2.5 py-1.5 text-sm font-medium text-gray-700">{href ? <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800">{source.name}</a> : source.name}<button type="button" disabled={!href || saved} onClick={() => onSaveLink(reel, source)} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#114b43] disabled:text-gray-400"><BookmarkPlus size={12} />{saved ? "Saved" : "Save"}</button></span>; })}</div>}</div><div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Dates</p>{dates.length === 0 ? <p className="text-sm text-gray-400">No dates were found in this reel.</p> : <ul className="space-y-2 text-sm text-gray-700">{dates.map((value) => { const eventDate = toInputDate(value); const saved = eventDate && savedDates.some((item) => item.reel_id === reel.reel_id && item.event_date === eventDate && item.label === value); return <li key={value} className="flex flex-wrap items-center gap-2"><span className="text-[#114b43]">•</span><span>{value}</span><button type="button" disabled={!eventDate || saved} onClick={() => onSaveDate(reel, { label: value, event_date: eventDate })} className="inline-flex items-center gap-1 rounded-md border border-[#114b43]/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#114b43] disabled:border-gray-100 disabled:text-gray-400"><CalendarPlus size={12} />{saved ? "On calendar" : "Add to calendar"}</button></li>; })}</ul>}</div></div>
      {topics.length > 0 && <div className="mt-5 border-t border-gray-100 pt-4"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Topics to explore</p><div className="flex flex-wrap gap-2">{topics.map((topic) => <a key={topic} href={`https://www.google.com/search?q=${encodeURIComponent(topic)}`} target="_blank" rel="noreferrer" className="rounded-full bg-[#F5F3E9] px-3 py-1.5 text-xs font-bold text-[#114b43] hover:bg-[#e8e5d6]">Search {topic}</a>)}</div></div>}
      <div className="mt-5 border-t border-gray-100 pt-4"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Add an important date</p><div className="flex flex-wrap items-center gap-2"><input type="date" value={manualDate} onChange={(event) => setManualDate(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700" /><button type="button" disabled={!manualDate} onClick={() => { onSaveDate(reel, { label: `Important date for ${reel.title}`, event_date: manualDate }); setManualDate(""); }} className="inline-flex items-center gap-1 rounded-lg border border-[#114b43] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#114b43] disabled:border-gray-200 disabled:text-gray-400"><CalendarPlus size={12} /> Add to calendar</button></div></div>
    </section>
  </>;
}


function DeepFridgePage({ reels, researchByReel, language, onResearch, onDelete }) {
  const [openId, setOpenId] = useState(null);
  const completed = reels
    .map((reel) => ({ reel, result: researchByReel[reel.reel_id] }))
    .filter(
      ({ result }) =>
        result?.status === "done" || result?.status === "not_opportunity",
    );
  return (
    <section
      className="pt-2"
      aria-label="Deep Fridge"
    >
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#114b43]">
          Deep Fridge
        </p>
        <h2 className="font-display text-3xl tracking-wide uppercase text-[#1a1a1a] mt-1">
          SAVED REELS & DEEP RESEARCH
        </h2>
        <p className="text-gray-600 font-medium mt-2">
          Review compact reels here, then research or remove them without leaving Deep Fridge.
        </p>
      </div>
      {reels.length > 0 && <div className="mb-8 space-y-4">{reels.map((reel) => {
        const result = researchByReel[reel.reel_id];
        const researching = result && ACTIVE_STATUSES.has(result.status);
        const text = displayContent(reel, language);
        const expanded = openId === reel.reel_id;
        return <article key={reel.reel_id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{reel.platform} · saved {formatDate(reel.created_at)}</p><h3 className="mt-1 font-bold text-[#1a1a1a]">{reel.title}</h3></div><button type="button" onClick={() => onDelete(reel.reel_id)} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500" title="Remove from vault"><Trash2 size={15} /> Remove</button></div><div className="mt-4"><StructuredTranscript text={text} expanded={expanded} /></div>{text.length > 180 && <button type="button" onClick={() => setOpenId(expanded ? null : reel.reel_id)} className="mt-3 text-xs font-bold uppercase tracking-widest text-[#114b43] hover:underline">{expanded ? "Show less" : "Show more"}</button>}<div className="mt-4 flex flex-wrap items-center gap-4"><a href={reel.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-blue-600 underline underline-offset-4"><ExternalLink size={13} /> Open original</a><button type="button" onClick={() => onResearch(reel)} disabled={researching} className="inline-flex items-center gap-2 rounded-lg bg-[#114b43] px-3 py-2 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60"><Sparkles size={14} />{researching ? "Researching…" : "Research"}</button></div>{researching && <p className="mt-3 flex items-center gap-2 text-sm text-[#114b43]"><LoaderCircle size={15} className="animate-spin" /> Verification in progress…</p>}</article>;
      })}</div>}
      {completed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
          Select Research on a reel above to see detailed findings here.
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
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                  <span><strong>Saved:</strong> {formatDate(reel.created_at)}</span>
                  {result.created_at && <span><strong>Researched:</strong> {formatDate(result.created_at)}</span>}
                  {verification?.official_deadline && <span><strong>Official deadline:</strong> {formatDate(verification.official_deadline)}</span>}
                </div>
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
                {report?.related_links?.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Research links</h4>
                    <div className="flex flex-wrap gap-3">{report.related_links.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800">{url}</a>)}</div>
                  </div>
                )}
                {report?.source_evidence?.length > 0 && (
                  <section className="mt-6 border-t border-gray-100 pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">All web content read</h4>
                    <div className="space-y-4">{report.source_evidence.map((source) => <article key={`${source.url}-${source.content.slice(0, 20)}`} className="rounded-xl bg-[#F5F3E9] p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{source.source_type === "search_result" ? "Search result" : "Web page read"}</p><a href={source.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm font-bold text-blue-600 underline underline-offset-2 hover:text-blue-800">{source.url}</a><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">{language === "native" ? source.content : "Source content is available at the link above."}</p></article>)}</div>
                  </section>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function LinkShelf({ entries, links, dates, onDeleteEntry, onDeleteLink, onDeleteDate }) {
  return <section className="pt-2"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#114b43]">Link Vault</p><h2 className="font-display text-3xl tracking-wide uppercase text-[#1a1a1a] mt-1">SAVED RESOURCES & DATES</h2><p className="mt-2 font-medium text-gray-600">Keep each reel's sources, follow-up topics and deadlines together.</p></div><section className="mb-6 rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-2 text-[#114b43]"><BookmarkPlus size={17} /><h3 className="text-xs font-bold uppercase tracking-widest">Reel entries</h3></div>{entries.length === 0 ? <p className="text-sm text-gray-500">Use Add to Link Vault on a reel to save its links and related topics.</p> : <div className="grid gap-4 md:grid-cols-2">{entries.map((entry) => <article key={entry.id} className="rounded-xl bg-[#F5F3E9] p-4"><div className="flex items-start justify-between gap-3"><h4 className="text-sm font-bold text-gray-800">{entry.title}</h4><button type="button" onClick={() => onDeleteEntry(entry.id)} className="shrink-0 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500">Remove</button></div>{entry.links?.length > 0 && <div className="mt-3 space-y-1">{entry.links.map((link) => <a key={`${link.name}-${link.url}`} href={sourceHref(link.url)} target="_blank" rel="noreferrer" className="block truncate text-sm text-blue-600 underline underline-offset-2">{link.name}</a>)}</div>}{entry.topics?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{entry.topics.map((topic) => <a key={topic} href={`https://www.google.com/search?q=${encodeURIComponent(topic)}`} target="_blank" rel="noreferrer" className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#114b43]">{topic}</a>)}</div>}</article>)}</div>}</section><div className="grid gap-6 lg:grid-cols-2"><section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-2 text-[#114b43]"><Link2 size={17} /><h3 className="text-xs font-bold uppercase tracking-widest">Individual links</h3></div>{links.length === 0 ? <p className="text-sm text-gray-500">Save an individual source from a reel.</p> : <div className="space-y-3">{links.map((link) => <div key={link.id} className="flex items-start justify-between gap-3 rounded-xl bg-[#F5F3E9] p-3"><div className="min-w-0"><p className="text-sm font-bold text-gray-800">{link.label}</p><a href={link.url} target="_blank" rel="noreferrer" className="block truncate text-sm text-blue-600 underline underline-offset-2">{link.url}</a></div><button type="button" onClick={() => onDeleteLink(link.id)} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500">Remove</button></div>)}</div>}</section><section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-2 text-[#114b43]"><CalendarDays size={17} /><h3 className="text-xs font-bold uppercase tracking-widest">Important dates</h3></div>{dates.length === 0 ? <p className="text-sm text-gray-500">Save a detected or manual date from a Vault reel.</p> : <div className="space-y-3">{dates.map((item) => <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-[#F5F3E9] p-3"><div><p className="text-sm font-bold text-gray-800">{item.label}</p><p className="mt-1 text-sm text-[#114b43]">{formatDate(`${item.event_date}T00:00:00`)}</p></div><button type="button" onClick={() => onDeleteDate(item.id)} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500">Remove</button></div>)}</div>}</section></div></section>;
}

export default function Vault() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [reels, setReels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [loadError, setLoadError] = useState("");
  const [researchByReel, setResearchByReel] = useState({});
  const [savedLinks, setSavedLinks] = useState([]);
  const [savedDates, setSavedDates] = useState([]);
  const [linkVaultEntries, setLinkVaultEntries] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [activeTab, setActiveTab] = useState("vault");
  const [category, setCategory] = useState("all");

  const loadReels = async () => {
    try {
      const saved = await api.listReels();
      setReels(saved);
      const [research, links, dates, entries] = await Promise.all([
        Promise.all(
        saved.map(async (reel) => {
          try {
            return [reel.reel_id, await api.getResearch(reel.reel_id)];
          } catch {
            return null;
          }
        })),
        api.listSavedLinks().catch(() => []),
        api.listSavedDates().catch(() => []),
        api.listLinkVault().catch(() => []),
      ]);
      setResearchByReel(Object.fromEntries(research.filter(Boolean)));
      setSavedLinks(links);
      setSavedDates(dates);
      setLinkVaultEntries(entries);
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
    const matchesDay = !selectedDay || savedDates.some((item) => item.reel_id === reel.reel_id && dateKey(`${item.event_date}T00:00:00`) === selectedDay);
    const tags = reel.analysis?.tags || [];
    const matchesCategory = category === "all" || tags.includes(category) || `${reel.analysis?.summary || ""} ${reel.title}`.toLowerCase().includes(category);
    return matchesSearch && matchesDay && matchesCategory;
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
          : "Could not start opportunity verification.",
      );
    }
  };

  const handleSaveLink = async (reel, source) => {
    const url = sourceHref(source.url || (/^[\w.-]+\.[a-z]{2,}(?:\/\S*)?$/i.test(source.name) ? source.name : null));
    if (!url) return;
    try { const saved = await api.saveLink(reel.reel_id, { label: source.name, url }); setSavedLinks((current) => current.some((item) => item.id === saved.id) ? current : [saved, ...current]); } catch (error) { setLoadError(error instanceof ApiError ? error.message : "Could not save this link."); }
  };
  const handleSaveDate = async (reel, payload) => {
    try { const saved = await api.saveDate(reel.reel_id, payload); setSavedDates((current) => current.some((item) => item.id === saved.id) ? current : [...current, saved]); } catch (error) { setLoadError(error instanceof ApiError ? error.message : "Could not save this date."); }
  };
  const handleSaveToLinkVault = async (reel, sources, topics) => {
    try {
      const links = sources.map((source) => ({
        name: source.name,
        url: sourceHref(source.url || (/^[\w.-]+\.[a-z]{2,}(?:\/\S*)?$/i.test(source.name) ? source.name : null)),
      })).filter((source) => source.url);
      const entry = await api.saveLinkVault(reel.reel_id, { title: reel.title, links, topics });
      setLinkVaultEntries((current) => [entry, ...current.filter((item) => item.reel_id !== reel.reel_id)]);
    } catch (error) { setLoadError(error instanceof ApiError ? error.message : "Could not add this reel to Link Vault."); }
  };
  const handleDeleteLink = async (linkId) => { try { await api.deleteSavedLink(linkId); setSavedLinks((current) => current.filter((item) => item.id !== linkId)); } catch (error) { setLoadError(error instanceof ApiError ? error.message : "Could not remove this link."); } };
  const handleDeleteDate = async (dateId) => { try { await api.deleteSavedDate(dateId); setSavedDates((current) => current.filter((item) => item.id !== dateId)); } catch (error) { setLoadError(error instanceof ApiError ? error.message : "Could not remove this date."); } };
  const handleDeleteLinkVault = async (entryId) => { try { await api.deleteLinkVault(entryId); setLinkVaultEntries((current) => current.filter((item) => item.id !== entryId)); } catch (error) { setLoadError(error instanceof ApiError ? error.message : "Could not remove this Link Vault entry."); } };

  return (
    <div className="w-full pb-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-[#1a1a1a] uppercase mb-3">
          YOUR VAULT
        </h1>
        <p className="text-gray-600 font-medium text-lg">
          Every reel you saved, with its real title and full transcript.
        </p>
      </header>

      <div role="tablist" aria-label="Vault sections" className="mb-7 inline-flex max-w-full overflow-x-auto rounded-xl bg-[#F5F3E9] p-1 gap-1">
        <button type="button" role="tab" aria-selected={activeTab === "vault"} onClick={() => setActiveTab("vault")} className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "vault" ? "bg-white text-[#114b43] shadow-sm" : "text-gray-500 hover:text-[#114b43]"}`}><Bookmark size={14} /> Vault</button>
        <button type="button" role="tab" aria-selected={activeTab === "research"} onClick={() => setActiveTab("research")} className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "research" ? "bg-white text-[#114b43] shadow-sm" : "text-gray-500 hover:text-[#114b43]"}`}><List size={14} /> Deep Fridge</button>
        <button type="button" role="tab" aria-selected={activeTab === "shelf"} onClick={() => setActiveTab("shelf")} className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "shelf" ? "bg-white text-[#114b43] shadow-sm" : "text-gray-500 hover:text-[#114b43]"}`}><Link2 size={14} /> Link Shelf</button>
        <button type="button" role="tab" aria-selected={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "calendar" ? "bg-white text-[#114b43] shadow-sm" : "text-gray-500 hover:text-[#114b43]"}`}><CalendarDays size={14} /> Calendar</button>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-4">
          <AlertCircle size={16} /> {loadError}
        </div>
      )}

      {activeTab === "research" ? <DeepFridgePage reels={reels} researchByReel={researchByReel} language={language} onResearch={handleResearch} onDelete={handleDelete} /> : activeTab === "shelf" ? <LinkShelf links={savedLinks} dates={savedDates} onDeleteLink={handleDeleteLink} onDeleteDate={handleDeleteDate} /> : activeTab === "calendar" ? (
        <section className="pt-2">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#114b43]">
              Calendar
            </p>
            <h2 className="font-display text-3xl tracking-wide uppercase text-[#1a1a1a] mt-1">
              VAULT CALENDAR
            </h2>
            <p className="mt-2 font-medium text-gray-600">
              Track important dates and deadlines from your saved reels.
            </p>
          </div>
          <div className="max-w-[400px]">
            <SavedCalendar
              reels={reels}
              importantDates={savedDates}
              selectedKey={selectedDay}
              onSelect={setSelectedDay}
            />
          </div>
        </section>
      ) : reels.length === 0 ? (
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
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
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
          <div className="flex flex-wrap gap-2">{[["all", "All"], ["internship", "Internships"], ["competition", "Competitions"], ["offer", "Offers"], ["skill", "Skills"]].map(([value, label]) => <button key={value} type="button" onClick={() => setCategory(value)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${category === value ? "bg-[#114b43] text-white" : "bg-[#F5F3E9] text-gray-600 hover:text-[#114b43]"}`}>{label}</button>)}</div>
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
                const body = displayContent(reel, language);
                const chunks = transcriptChunks(body);
                const expanded = openId === reel.reel_id;
                const canExpand = body.length > 180 || chunks.length > 1;
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
                    <ReelAnalysisPanel reel={reel} onSaveLink={handleSaveLink} onSaveDate={handleSaveDate} onSaveToLinkVault={handleSaveToLinkVault} savedLinks={savedLinks} savedDates={savedDates} linkVaultEntries={linkVaultEntries} />
                    <StructuredTranscript text={body} expanded={expanded} />
                    {canExpand && (
                      <button
                        type="button"
                        onClick={() => setOpenId(expanded ? null : reel.reel_id)}
                        className="mt-4 text-xs font-bold uppercase tracking-widest text-[#114b43] hover:underline"
                      >
                        {expanded ? "Show less" : "Show more"}
                      </button>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <a
                        href={reel.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 underline underline-offset-4 hover:text-blue-800"
                      >
                        Open original <ExternalLink size={13} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
