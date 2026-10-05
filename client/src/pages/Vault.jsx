import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  BookmarkPlus,
  CalendarPlus,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Eye,
  Globe,
  LoaderCircle,
  List,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { api, ApiError } from "../services/api";
import { useAuth } from "../auth/useAuth";
import { useProfile } from "../auth/useProfile";
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
  return reel.analysis?.english_transcript || reel.analysis?.summary || "English translation is unavailable for this reel.";
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

function openGoogleCalendar(reel, label, dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return;
  
  const startStr = d.toISOString().slice(0,10).replace(/-/g, '');
  const nextDay = new Date(d);
  nextDay.setDate(d.getDate() + 1);
  const endStr = nextDay.toISOString().slice(0,10).replace(/-/g, '');
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: reel.title || 'Saved Opportunity',
    dates: `${startStr}/${endStr}`,
    details: `Event: ${label}\nCategory: ${reel.analysis?.tags?.[0] || 'Opportunity'}\nSource: ${reel.url}\n\nSaved via ReelVault`,
  });
  
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
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

  const handleCalendarAction = (reel, payload) => {
    const pref = localStorage.getItem('reelvault_pref_export');
    if (pref === 'google') {
      openGoogleCalendar(reel, payload.label, payload.event_date);
    } else {
      onSaveDate(reel, payload);
    }
  };

  return <>
    <section className="mb-4 rounded-2xl border border-[#114b43]/10 bg-[#F5F3E9] p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43]">Reel summary</p>
      {analysis.summary_points?.length > 0 ? <ol className="mt-3 space-y-2 text-sm leading-6 text-gray-700">{analysis.summary_points.map((point, index) => <li key={`${index}-${point}`} className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#114b43] text-[10px] font-bold text-white">{index + 1}</span><span>{point}</span></li>)}</ol> : <p className="mt-2 text-sm leading-6 text-gray-700">{analysis.summary}</p>}
    </section>
    <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43]">Reel resources</p><p className="mt-1 text-sm text-gray-500">Save links, dates and search topics separately from the summary.</p></div><button type="button" onClick={() => onSaveToLinkVault(reel, sources, topics)} disabled={inLinkVault} className="inline-flex items-center gap-1.5 rounded-lg bg-[#114b43] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white disabled:bg-gray-300"><BookmarkPlus size={14} />{inLinkVault ? "In Link Vault" : "Add to Link Vault"}</button></div>
      <div className="mt-4 grid gap-5 lg:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Links & sources</p>{sources.length === 0 ? <p className="text-sm text-gray-400">No links were found in this reel.</p> : <div className="flex flex-wrap gap-2">{sources.map((source, index) => { const href = sourceHref(source.url || (/^[\w.-]+\.[a-z]{2,}(?:\/\S*)?$/i.test(source.name) ? source.name : null)); const saved = savedLinks.some((item) => item.reel_id === reel.reel_id && item.url === href); return <span key={`${source.name}-${index}`} className="inline-flex items-center gap-2 rounded-lg bg-[#F5F3E9] px-2.5 py-1.5 text-sm font-medium text-gray-700">{href ? <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800">{source.name}</a> : source.name}<button type="button" disabled={!href || saved} onClick={() => onSaveLink(reel, source)} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#114b43] disabled:text-gray-400"><BookmarkPlus size={12} />{saved ? "Saved" : "Save"}</button></span>; })}</div>}</div><div><div className="flex items-center justify-between mb-2"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Dates</p><Link to="/profile#calendar-integration" title="Configure Google Calendar" aria-label="Configure Google Calendar" className="text-gray-400 hover:text-[#114b43]"><Eye size={14} /></Link></div>{dates.length === 0 ? <p className="text-sm text-gray-400">No dates were found in this reel.</p> : <ul className="space-y-2 text-sm text-gray-700">{dates.map((value) => <li key={value} className="flex items-center gap-2"><span className="text-[#114b43]">•</span><span>{value}</span></li>)}</ul>}</div></div>
      {topics.length > 0 && <div className="mt-5 border-t border-gray-100 pt-4"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Topics to explore</p><div className="flex flex-wrap gap-2">{topics.map((topic) => <a key={topic} href={`https://www.google.com/search?q=${encodeURIComponent(topic)}`} target="_blank" rel="noreferrer" className="rounded-full bg-[#F5F3E9] px-3 py-1.5 text-xs font-bold text-[#114b43] hover:bg-[#e8e5d6]">Search {topic}</a>)}</div></div>}
      <div className="mt-5 border-t border-gray-100 pt-4"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Add an important date</p><div className="flex flex-wrap items-center gap-2"><input type="date" value={manualDate} onChange={(event) => setManualDate(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700" /><button type="button" disabled={!manualDate} onClick={() => { handleCalendarAction(reel, { label: `Important date for ${reel.title}`, event_date: manualDate }); setManualDate(""); }} className="inline-flex items-center gap-1 rounded-lg border border-[#114b43] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#114b43] disabled:border-gray-200 disabled:text-gray-400"><CalendarPlus size={12} /> Add to calendar</button></div></div>
    </section>
  </>;
}


function DeepFridgePage({ reels, researchByReel, language, onResearch, onDelete }) {
  const [openId, setOpenId] = useState(null);
  const [topicInputs, setTopicInputs] = useState({});

  const handleTopicChange = (reelId, val) => {
    setTopicInputs((prev) => ({ ...prev, [reelId]: val }));
  };

  const handleVerifyTopic = (reel, specificTopic) => {
    onResearch(reel, specificTopic);
  };

  const completed = reels
    .map((reel) => ({ reel, result: researchByReel[reel.reel_id] }))
    .filter(
      ({ result }) =>
        result?.status === "done" || result?.status === "not_opportunity",
    );

  return (
    <section className="pt-2" aria-label="Deep Fridge">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#114b43]">
            Deep Fridge
          </p>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Gemini AI & Web Search
          </span>
        </div>
        <h2 className="font-display text-3xl tracking-wide uppercase text-[#1a1a1a] mt-1">
          TRUTH VERIFICATION & DEEP RESEARCH
        </h2>
        <p className="text-gray-600 font-medium mt-2">
          Search for the truth of topics, verify reel correctness with Gemini AI real-time web search, and inspect evidence-backed official sources.
        </p>
      </div>

      {reels.length > 0 && (
        <div className="mb-8 space-y-5">
          {reels.map((reel) => {
            const result = researchByReel[reel.reel_id];
            const researching = result && ACTIVE_STATUSES.has(result.status);
            const text = displayContent(reel, language);
            const expanded = openId === reel.reel_id;
            const customTopic = topicInputs[reel.reel_id] || "";
            const reelTopics = [
              ...new Set([
                ...(reel.analysis?.tags || []),
                ...(reel.analysis?.details?.competitions || []),
                ...(reel.analysis?.details?.people || []),
                ...(reel.analysis?.details?.books || []),
              ]),
            ];

            return (
              <article
                key={reel.reel_id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {reel.platform} · saved {formatDate(reel.created_at)}
                    </p>
                    <h3 className="mt-1 font-bold text-lg text-[#1a1a1a]">{reel.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(reel.reel_id)}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500"
                    title="Remove from vault"
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>

                {reel.analysis_error && (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-900"
                  >
                    <strong>Reel saved.</strong> {reel.analysis_error}
                  </p>
                )}

                {/* Reel Summary Being Sent for Truth Verification */}
                {reel.analysis?.summary && (
                  <div className="mt-4 rounded-xl border border-[#114b43]/15 bg-[#F5F3E9] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43] mb-1">
                      Reel Summary (to verify)
                    </p>
                    <p className="text-sm font-medium text-gray-800">{reel.analysis.summary}</p>
                    {reel.analysis.summary_points?.length > 0 && (
                      <ul className="mt-2.5 space-y-1 text-xs text-gray-600">
                        {reel.analysis.summary_points.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#114b43] font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Topics to Verify */}
                {reelTopics.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Topics to search for truth:
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {reelTopics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleVerifyTopic(reel, topic)}
                          disabled={researching}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#114b43]/30 px-3 py-1 text-xs font-semibold text-[#114b43] hover:bg-[#F5F3E9] transition-colors disabled:opacity-50"
                          title={`Search truth for topic: ${topic}`}
                        >
                          <Search size={11} /> {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Topic Search Field */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search truth of a specific topic or claim..."
                      value={customTopic}
                      onChange={(e) => handleTopicChange(reel.reel_id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customTopic.trim() && !researching) {
                          handleVerifyTopic(reel, customTopic.trim());
                        }
                      }}
                      className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#114b43]"
                    />
                  </div>
                  {customTopic.trim() && (
                    <button
                      type="button"
                      disabled={researching}
                      onClick={() => handleVerifyTopic(reel, customTopic.trim())}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#114b43] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0c352f] disabled:opacity-50"
                    >
                      Search Truth
                    </button>
                  )}
                </div>

                {/* Spoken Transcript */}
                <div className="mt-4">
                  <StructuredTranscript text={text} expanded={expanded} />
                </div>
                {text.length > 180 && (
                  <button
                    type="button"
                    onClick={() => setOpenId(expanded ? null : reel.reel_id)}
                    className="mt-2 text-xs font-bold uppercase tracking-widest text-[#114b43] hover:underline"
                  >
                    {expanded ? "Show less" : "Show more"}
                  </button>
                )}

                {/* Primary Action Buttons */}
                <div className="mt-5 flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100">
                  <a
                    href={reel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-blue-600 underline underline-offset-4"
                  >
                    <ExternalLink size={13} /> Open original
                  </a>
                  <button
                    type="button"
                    onClick={() => onResearch(reel, customTopic || null)}
                    disabled={researching}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#114b43] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#0c352f] disabled:opacity-60 transition-colors shadow-xs"
                  >
                    <Sparkles size={14} />
                    {researching ? "Verifying Truth via Gemini…" : "Search Truth & Verify (Gemini AI)"}
                  </button>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      `${reel.title} official source registration`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#114b43]"
                  >
                    <Globe size={13} /> Web search
                  </a>
                </div>

                {researching && (
                  <div className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 px-4 py-3 text-sm text-[#114b43]">
                    <LoaderCircle size={17} className="animate-spin text-[#114b43]" />
                    <div>
                      <p className="font-bold">Verifying truth with Gemini AI real-time web search…</p>
                      <p className="text-xs text-emerald-800">
                        Analyzing summary, topics, and cross-referencing official portals and claims.
                      </p>
                    </div>
                  </div>
                )}

                {result?.status === "failed" && (
                  <p role="alert" className="mt-3 text-sm text-amber-800">
                    Verification could not run
                    {result.error_code === "ai_rate_limited"
                      ? " because the AI quota or rate limit was reached."
                      : result.error_code === "gemini_unconfigured"
                      ? " because the Gemini API key is not configured in server/.env."
                      : "."}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {completed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">No verification reports yet.</p>
          <p className="mt-1">
            Click <strong>Search Truth & Verify (Gemini AI)</strong> on any reel above to check topic truth and official sources.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#114b43]">
              Verified Opportunity Briefings & Truth Reports
            </h3>
            <span className="text-xs font-bold text-gray-400">
              {completed.length} {completed.length === 1 ? "report" : "reports"}
            </span>
          </div>

          {completed.map(({ reel, result }) => {
            const verification = result.verification;
            const report = result.report;
            const isVerified = verification?.sources_verified || verification?.verdict === "official_confirmed";

            return (
              <article
                key={result.id}
                className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm"
              >
                {/* Header with Title and Green Tick */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          Sources Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800">
                          <AlertCircle size={16} className="text-amber-600 shrink-0" />
                          Sources Unconfirmed
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {verification?.verdict?.replaceAll("_", " ") || "Not an opportunity"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#1a1a1a]">{reel.title}</h3>
                  </div>

                  <div className="text-right text-xs text-gray-500">
                    <p><strong>Saved:</strong> {formatDate(reel.created_at)}</p>
                    {result.created_at && (
                      <p className="mt-0.5"><strong>Verified:</strong> {formatDate(result.created_at)}</p>
                    )}
                  </div>
                </div>

                {/* Gemini Verification Summary */}
                {verification?.summary && (
                  <div className={`mt-4 rounded-xl p-4 border ${
                    isVerified ? "bg-emerald-50/60 border-emerald-200" : "bg-[#F5F3E9] border-gray-200"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isVerified && <CheckCircle2 size={15} className="text-emerald-600" />}
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#114b43]">
                        Gemini Truth & Correctness Summary
                      </p>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-gray-800">
                      {verification.summary}
                    </p>
                    {verification?.official_deadline && (
                      <p className="mt-2 text-xs font-bold text-[#114b43]">
                        Official Deadline: {formatDate(verification.official_deadline)}
                      </p>
                    )}
                  </div>
                )}

                {/* Official Search Links */}
                {verification?.official_urls?.length > 0 && (
                  <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-700">
                          Official Search Sources & Links
                        </h4>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Verified Official
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {verification.official_urls.map((url, idx) => (
                        <a
                          key={`${url}-${idx}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:border-blue-300 transition-colors shadow-2xs"
                        >
                          <ExternalLink size={13} className="shrink-0" />
                          <span className="truncate max-w-[280px]">{url}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supporting Search Links */}
                {verification?.supporting_urls?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      Web Search Citations & Discussions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {verification.supporting_urls.map((url, idx) => {
                        let hostname = url;
                        try {
                          hostname = new URL(url).hostname;
                        } catch {
                          hostname = url;
                        }
                        return (
                          <a
                            key={`${url}-${idx}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <Globe size={11} /> {hostname}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Content of the Reel Verified (Claim Checks) */}
                {verification?.claim_checks?.length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
                      <span>Reel Content & Claim Verification</span>
                      <span className="text-[10px] text-gray-400 lowercase">({verification.claim_checks.length} claims verified)</span>
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {verification.claim_checks.map((claim, cIdx) => {
                        const status = claim.status?.toLowerCase();
                        const isClaimVerified = status === "verified" || status === "matched";
                        const isClaimFalse = status === "false" || status === "misleading";
                        return (
                          <div
                            key={cIdx}
                            className={`rounded-xl border p-3.5 flex flex-col justify-between ${
                              isClaimVerified
                                ? "bg-emerald-50/40 border-emerald-200/80"
                                : isClaimFalse
                                ? "bg-red-50/40 border-red-200/80"
                                : "bg-[#F5F3E9] border-gray-200"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <p className="text-xs font-bold text-gray-900 leading-snug">
                                  {claim.claim}
                                </p>
                                {isClaimVerified ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                                    <CheckCircle2 size={11} /> Verified
                                  </span>
                                ) : isClaimFalse ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 shrink-0">
                                    <XCircle size={11} /> False
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 shrink-0">
                                    <AlertCircle size={11} /> Unverified
                                  </span>
                                )}
                              </div>
                              {claim.evidence && (
                                <p className="text-xs text-gray-600 leading-relaxed mt-1">
                                  <strong className="text-gray-700">Evidence:</strong> {claim.evidence}
                                </p>
                              )}
                            </div>
                            {claim.source_url && (
                              <div className="mt-2.5 pt-2 border-t border-gray-200/60">
                                <a
                                  href={claim.source_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline truncate max-w-full"
                                >
                                  <ExternalLink size={10} /> Source link
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Research Report Sections */}
                {report && (
                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                      Detailed Research Briefing
                    </h4>
                    <div className="grid gap-5 md:grid-cols-2">
                      {REPORT_SECTIONS.map(
                        ([key, heading]) =>
                          report[key]?.length > 0 && (
                            <div key={key} className="rounded-xl bg-[#F5F3E9] p-4">
                              <h5 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                                {heading}
                              </h5>
                              <ul className="space-y-2 text-xs text-gray-700">
                                {report[key].map((claim, claimIndex) => (
                                  <li key={`${key}-${claimIndex}`}>
                                    <p className="leading-relaxed">{claim.text}</p>
                                    {claim.source_urls?.map((url) => {
                                      let hostname = url;
                                      try {
                                        hostname = new URL(url).hostname;
                                      } catch {
                                        hostname = url;
                                      }
                                      return (
                                        <a
                                          key={url}
                                          href={url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="mt-0.5 inline-block text-blue-600 underline underline-offset-2 hover:text-blue-800"
                                        >
                                          Source ({hostname})
                                        </a>
                                      );
                                    })}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                )}

                {/* All Web Content / Evidence Read */}
                {report?.source_evidence?.length > 0 && (
                  <section className="mt-6 border-t border-gray-100 pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                      All Web Search Content & Pages Read
                    </h4>
                    <div className="space-y-3">
                      {report.source_evidence.map((source, sIdx) => (
                        <article
                          key={`${source.url}-${sIdx}`}
                          className="rounded-xl bg-[#F5F3E9] p-4"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            {source.source_type === "search_result"
                              ? "Live search result citation"
                              : "Web page read"}
                          </p>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block break-all text-xs font-bold text-blue-600 underline underline-offset-2 hover:text-blue-800"
                          >
                            {source.url}
                          </a>
                          <p className="mt-2 text-xs leading-5 text-gray-700">
                            {source.content}
                          </p>
                        </article>
                      ))}
                    </div>
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

const getPrimaryDeadline = (reel) => {
  const dates = reel.analysis?.details?.dates || [];
  if (!dates.length) return null;
  const now = new Date();
  const validDates = dates.map(d => new Date(d)).filter(d => !Number.isNaN(d.getTime()));
  if (!validDates.length) return null;
  validDates.sort((a, b) => a - b);
  const futureDates = validDates.filter(d => d >= now);
  return futureDates.length > 0 ? futureDates[0] : validDates[validDates.length - 1];
};

const matchesDateFilter = (deadlineDate, filter) => {
  if (filter === 'All') return true;
  if (!deadlineDate) return false;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const d = new Date(deadlineDate);
  d.setHours(0, 0, 0, 0);
  
  if (filter === 'Expired') return d < now;
  if (filter === 'Upcoming') return d >= now;
  
  if (filter === 'This Week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    return d >= startOfWeek && d <= endOfWeek;
  }
  if (filter === 'This Month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  return true;
};

const calculateMatchScore = (reel, profilePrefs) => {
  if (!profilePrefs) return { score: 0, eligible: true, reasons: [] };
  let score = 0;
  let totalWeight = 0;
  const matchReasons = [];
  let isEligible = true;
  
  const tags = (reel.analysis?.tags || []).map(t => t.toLowerCase());
  
  if (profilePrefs.interestedIn?.length > 0) {
    totalWeight += 50;
    const matchedTypes = profilePrefs.interestedIn.filter(type => {
      const t = type.toLowerCase();
      return tags.includes(t) || tags.some(tag => t.includes(tag) || tag.includes(t));
    });
    
    if (matchedTypes.length > 0) {
      score += 50;
      matchReasons.push(...matchedTypes);
    } else {
      isEligible = false;
    }
  }

  if (profilePrefs.interestDomains?.length > 0) {
    totalWeight += 50;
    const matchedDomains = profilePrefs.interestDomains.filter(domain => {
      const d = domain.toLowerCase();
      return tags.includes(d) || tags.some(tag => d.includes(tag) || tag.includes(d));
    });
    
    if (matchedDomains.length > 0) {
      score += 50;
      matchReasons.push(...matchedDomains);
    }
  }
  
  if (totalWeight === 0) return { score: 0, eligible: true, reasons: [] };
  
  return {
    score: Math.round((score / totalWeight) * 100),
    eligible: isEligible,
    reasons: [...new Set(matchReasons)]
  };
};

export default function Vault() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { profile } = useProfile();
  const { language } = useLanguage();
  const [reels, setReels] = useState([]);
  const [researchByReel, setResearchByReel] = useState({});
  const [savedLinks, setSavedLinks] = useState([]);
  const [savedDates, setSavedDates] = useState([]);
  const [linkVaultEntries, setLinkVaultEntries] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [activeTab, setActiveTab] = useState("vault");
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [isForYouActive, setIsForYouActive] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState('All');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [reelsData, links, dates, entries] = await Promise.all([
          api.listReels(),
          api.listSavedLinks().catch(() => []),
          api.listSavedDates().catch(() => []),
          api.listLinkVault().catch(() => []),
        ]);
        if (cancelled) return;
        setReels(reelsData);
        setSavedLinks(links);
        setSavedDates(dates);
        setLinkVaultEntries(entries);
      } catch (error) {
        if (!cancelled)
          setLoadError(
            error instanceof ApiError
              ? error.message
              : "Unable to load your vault.",
          );
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  useEffect(() => {
    let cancelled = false;
    const loadResearch = async () => {
      const records = await Promise.all(
        reels.map(async (reel) => {
          try {
            const data = await api.getResearch(reel.reel_id);
            return [reel.reel_id, data];
          } catch {
            return null;
          }
        }),
      );
      if (!cancelled)
        setResearchByReel(Object.fromEntries(records.filter(Boolean)));
    };
    if (reels.length) loadResearch();
    return () => {
      cancelled = true;
    };
  }, [reels]);

  const activeIds = reels
    .map((r) => r.reel_id)
    .filter((id) => {
      const s = researchByReel[id]?.status;
      return s && ACTIVE_STATUSES.has(s);
    });

  useEffect(() => {
    if (!activeIds.length) return;
    let cancelled = false;
    const refresh = async () => {
      const records = await Promise.all(
        activeIds.map(async (id) => {
          try {
            const data = await api.getResearch(id);
            return [id, data];
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
    
    const matchesType = filterType === 'All' || tags.some(t => filterType.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(filterType.toLowerCase()));
    
    const deadline = getPrimaryDeadline(reel);
    const matchesDate = matchesDateFilter(deadline, filterDate);

    return matchesSearch && matchesDay && matchesType && matchesDate;
  });

  let displayReels = [...filtered];
  const reelScores = {};
  if (isForYouActive && profile) {
    displayReels.forEach(reel => {
      reelScores[reel.reel_id] = calculateMatchScore(reel, profile);
    });
    displayReels = displayReels.filter(reel => reelScores[reel.reel_id].eligible && reelScores[reel.reel_id].score > 0);
    displayReels.sort((a, b) => {
      const scoreA = reelScores[a.reel_id]?.score || 0;
      const scoreB = reelScores[b.reel_id]?.score || 0;
      return scoreB - scoreA;
    });
  }

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

  const handleResearch = async (reel, topicToVerify = null) => {
    setLoadError("");
    try {
      const topics = [
        ...new Set([
          ...(reel.analysis?.tags || []),
          ...(reel.analysis?.details?.competitions || []),
          ...(reel.analysis?.details?.people || []),
          ...(reel.analysis?.details?.books || []),
        ]),
      ];
      if (topicToVerify && typeof topicToVerify === "string" && topicToVerify.trim()) {
        const cleanTopic = topicToVerify.trim();
        if (!topics.includes(cleanTopic)) {
          topics.unshift(cleanTopic);
        }
      }
      const result = await api.startResearch(reel.reel_id, {
        transcript: reel.transcript || "",
        caption: reel.caption || "",
        title: reel.title || "",
        summary: reel.analysis?.summary || "",
        summary_points: reel.analysis?.summary_points || [],
        topics,
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

  const handleViewOpportunity = (reelId) => {
    setActiveTab("vault");
    setSearchQuery("");
    setSelectedDay("");
    setTimeout(() => {
      const element = document.getElementById(`vault-reel-${reelId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-[#d4f954]', 'transition-all', 'duration-500');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-[#d4f954]');
        }, 2000);
      }
    }, 100);
  };

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
          <div className="w-full">
            <SavedCalendar
              reels={reels}
              importantDates={savedDates}
              selectedKey={selectedDay}
              onSelect={setSelectedDay}
              onViewOpportunity={handleViewOpportunity}
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
          <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 mt-3">
            <button
              type="button"
              onClick={() => setIsForYouActive(!isForYouActive)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                isForYouActive ? 'bg-[#d4f954] text-[#114b43] border border-[#114b43]/20 shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sparkles size={14} className={isForYouActive ? 'text-[#114b43]' : 'text-gray-400'} />
              For You
            </button>
            
            <div className="h-4 w-px bg-gray-200 mx-1"></div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 focus:outline-none focus:border-[#114b43]"
            >
              <option value="All">Type: All</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Internship">Internship</option>
              <option value="Competition">Competition</option>
              <option value="Job">Job</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Offer">Offer</option>
            </select>

            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 focus:outline-none focus:border-[#114b43]"
            >
              <option value="All">Date: All</option>
              <option value="Upcoming">Upcoming</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          
          {isForYouActive && (!profile || (!profile.interestedIn?.length && !profile.interestDomains?.length)) && (
            <div className="mt-3 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-between">
              <p className="text-sm font-medium text-amber-900">Set up your profile to personalize your Vault.</p>
              <Link to="/profile" className="px-4 py-2 bg-white rounded-lg border border-amber-200 text-xs font-bold text-amber-900 shadow-sm hover:bg-amber-100">
                Set Up Profile
              </Link>
            </div>
          )}
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
          {displayReels.length === 0 ? (
            <p className="text-gray-500 font-medium">
              No reels match that search.
            </p>
          ) : (
            <div className="space-y-4">
              {displayReels.map((reel) => {
                const body = displayContent(reel, language);
                const chunks = transcriptChunks(body);
                const expanded = openId === reel.reel_id;
                const canExpand = body.length > 180 || chunks.length > 1;
                return (
                  <article
                    key={reel.reel_id}
                    id={`vault-reel-${reel.reel_id}`}
                    className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {reel.platform}
                            {reel.author ? ` · ${reel.author}` : ""}
                          </div>
                          {isForYouActive && reelScores[reel.reel_id]?.score > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-[#114b43] text-[#d4f954] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                <Sparkles size={10} /> {reelScores[reel.reel_id].score}% Match
                              </span>
                              {reelScores[reel.reel_id].reasons?.length > 0 && (
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">
                                  Matches: {reelScores[reel.reel_id].reasons.join(" • ")}
                                </span>
                              )}
                            </div>
                          )}
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
                    {reel.analysis_error && (
                      <p
                        role="alert"
                        className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-900"
                      >
                        <strong>Reel saved.</strong> {reel.analysis_error}
                      </p>
                    )}
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
