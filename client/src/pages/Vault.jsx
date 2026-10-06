import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Link2,
  List,
  LoaderCircle,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  X,
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

const IMPORTANT_KEYWORD_REGEX = new RegExp(
  "\\b(" +
  [
    "Amazon",
    "Google",
    "Microsoft",
    "Meta",
    "Apple",
    "NVIDIA",
    "OpenAI",
    "Odoo",
    "Quizlet",
    "AI Founders",
    "Hackathon",
    "Hackathons",
    "Prize Pool",
    "Prize",
    "Prizes",
    "Bounty",
    "Bounties",
    "Deadline",
    "Deadlines",
    "Registration",
    "Register",
    "Scholarship",
    "Scholarships",
    "Internship",
    "Internships",
    "Eligibility",
    "Eligible",
    "Fellowship",
    "Fellowships",
    "Stipend",
    "Stipends",
    "Competition",
    "Competitions",
    "Contest",
    "Contests",
    "Challenge",
    "Challenges",
    "Grant",
    "Grants",
  ].join("|") +
  ")\\b|" +
  "(?:₹|Rs\\.?|INR)\\s*[\\d,]+(?:\\s*(?:lakhs?|cr|crores?|k))?|" +
  "\\$\\s*[\\d,]+(?:\\s*(?:k|million|m))?|" +
  "\\b\\d+(?:,\\d+)*(?:\\s*(?:lakhs?|crores?))\\b",
  "gi"
);

function renderHighlightedSummary(summary, extraKeywords = []) {
  if (!summary) return <span className="text-gray-400 italic">No summary available.</span>;

  // Split out markdown bold chunks first
  const boldParts = summary.split(/(\*\*[^*]+\*\*)/g);

  let regex = IMPORTANT_KEYWORD_REGEX;
  const validExtra = (extraKeywords || [])
    .filter((k) => typeof k === "string" && k.trim().length > 2)
    .map((k) => k.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));

  if (validExtra.length > 0) {
    regex = new RegExp(
      `\\b(${validExtra.join("|")})\\b|` + IMPORTANT_KEYWORD_REGEX.source,
      "gi"
    );
  }

  return (
    <>
      {boldParts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={`bold-${pIdx}`} className="font-bold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }

        const tokens = [];
        let lastIndex = 0;
        let match;
        const re = new RegExp(regex);

        while ((match = re.exec(part)) !== null) {
          if (match.index > lastIndex) {
            tokens.push(part.substring(lastIndex, match.index));
          }
          tokens.push(
            <strong key={`kw-${pIdx}-${match.index}`} className="font-bold text-gray-900">
              {match[0]}
            </strong>
          );
          lastIndex = re.lastIndex;
        }

        if (lastIndex < part.length) {
          tokens.push(part.substring(lastIndex));
        }

        return <span key={`chunk-${pIdx}`}>{tokens}</span>;
      })}
    </>
  );
}

function getExtractedData(reel) {
  const analysis = reel.analysis || {};
  const fullText = [
    reel.title || "",
    reel.transcript || "",
    reel.caption || "",
    analysis.summary || "",
    analysis.english_transcript || "",
    ...(analysis.summary_points || []),
  ].join(" ");

  // 1. Detected Links (all URLs detected across transcript/caption/sources/links)
  const linksMap = new Map();
  const addDetectedLink = (rawUrl, contextLabel = null) => {
    if (!rawUrl || typeof rawUrl !== "string") return;
    let clean = rawUrl.trim().replace(/[.,;:!?)'"]+$/, "");
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(clean)) {
        clean = "https://" + clean;
      } else {
        return;
      }
    }
    const key = clean.toLowerCase();
    if (!linksMap.has(key)) {
      let hostname = clean;
      try {
        hostname = new URL(clean).hostname;
      } catch {}
      linksMap.set(key, { url: clean, hostname, contextLabel });
    }
  };

  (analysis.links || []).forEach((u) => addDetectedLink(u, "Direct Link"));
  (analysis.sources || []).forEach((s) => {
    if (s.url) addDetectedLink(s.url, s.name);
  });

  const URL_DETECTION_REGEX =
    /https?:\/\/[^\s)\]>"',]+|(?:www\.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}(?:\/[-\w@:%_+.~#?&/=]*)?|\b(?:github\.com|summerofcode\.withgoogle\.com|aifoundersgrant\.org|forms\.gle|quizlet\.com|odoo\.com|amazon\.com|nvidia\.com|google\.com)[^\s)\]>"',]*/gi;
  let urlMatch;
  while ((urlMatch = URL_DETECTION_REGEX.exec(fullText)) !== null) {
    addDetectedLink(urlMatch[0], "Transcript Mention");
  }

  const allDetectedLinks = Array.from(linksMap.values());

  // 2. Actionable Resources
  const resourcesList = [];
  const resUrls = new Set();
  const addResource = (label, url) => {
    if (!url) return;
    let clean = url.trim().replace(/[.,;:!?)'"]+$/, "");
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    const key = clean.toLowerCase();
    if (!resUrls.has(key)) {
      resUrls.add(key);
      resourcesList.push({ label: label || "Official Resource", url: clean });
    }
  };

  (analysis.resources || []).forEach((r) => addResource(r.label, r.url));
  (analysis.sources || []).forEach((s) => {
    if (s.url) {
      let lbl = s.name || "Official Website";
      if (/apply|portal/i.test(s.name || s.url)) lbl = "Application";
      else if (/register|reg/i.test(s.name || s.url)) lbl = "Registration";
      else if (/github/i.test(s.name || s.url)) lbl = "GitHub Repository";
      addResource(lbl, s.url);
    }
  });

  allDetectedLinks.forEach(({ url, hostname }) => {
    const low = url.toLowerCase();
    let lbl = null;
    if (low.includes("register") || low.includes("registration")) lbl = "Registration";
    else if (low.includes("apply") || low.includes("application")) lbl = "Application";
    else if (low.includes("github.com")) lbl = "GitHub Repository";
    else if (low.includes("forms.gle") || low.includes("form")) lbl = "Form";
    else if (low.includes("docs.") || low.includes("documentation")) lbl = "Documentation";
    else if (resourcesList.length === 0) lbl = `Official Website (${hostname})`;
    if (lbl) addResource(lbl, url);
  });

  if (resourcesList.length === 0 && allDetectedLinks.length > 0) {
    addResource(`Official Link (${allDetectedLinks[0].hostname})`, allDetectedLinks[0].url);
  }

  // 3. Actionable Dates (Zero hallucination: only real dates)
  const regUrl =
    resourcesList.find((r) => /register|apply|form/i.test(r.label || r.url))?.url ||
    allDetectedLinks[0]?.url ||
    null;

  const datesList = [];
  const seenDates = new Set();
  const addDateItem = (label, dateStr, isoDate, url) => {
    if (!dateStr) return;
    const key = (isoDate || dateStr).toLowerCase();
    if (!seenDates.has(key)) {
      seenDates.add(key);
      datesList.push({
        label: label || "Actionable Date",
        date: dateStr,
        iso_date: isoDate || toInputDate(dateStr) || null,
        url: url || regUrl || null,
      });
    }
  };

  (analysis.extracted_dates || []).forEach((d) => {
    addDateItem(d.label, d.date, d.iso_date, d.url);
  });

  (analysis.details?.dates || []).forEach((dStr) => {
    let lbl = "Important Date";
    const low = fullText.toLowerCase();
    if (low.includes("deadline") || low.includes("last date") || low.includes("closes")) {
      lbl = "Registration Deadline";
    } else if (low.includes("hackathon") || low.includes("finals") || low.includes("pitch")) {
      lbl = "Hackathon / Event Date";
    }
    addDateItem(lbl, formatDate(dStr), toInputDate(dStr), regUrl);
  });

  // 4. Explore section
  const explore = {
    prize_pool:
      analysis.explore?.prize_pool ||
      (fullText.match(/(?:₹|Rs\.?|INR)\s*[\d,]+(?:\s*(?:lakhs?|cr|crores?|k))?/i)?.[0]) ||
      (fullText.match(/\$\s*[\d,]+(?:\s*(?:k|million|m))?/i)?.[0]) ||
      null,
    organizer:
      analysis.explore?.organizer ||
      (fullText.match(/\b(Amazon|Google|Microsoft|Meta|NVIDIA|Quizlet|Odoo|Apple|OpenAI|AI Founders)\b/i)?.[0]) ||
      analysis.details?.people?.[0] ||
      null,
    eligibility:
      analysis.explore?.eligibility ||
      (fullText.toLowerCase().includes("student") ? "Students / Developers" : null),
    location:
      analysis.explore?.location ||
      (fullText.toLowerCase().includes("san francisco")
        ? "San Francisco"
        : fullText.toLowerCase().includes("online")
        ? "Online"
        : "Online / Global"),
    category:
      analysis.explore?.category ||
      (analysis.tags?.[0]
        ? analysis.tags[0].charAt(0).toUpperCase() + analysis.tags[0].slice(1)
        : "Opportunity"),
    benefits:
      analysis.explore?.benefits ||
      (fullText.toLowerCase().includes("internship")
        ? "Internship opportunities, certificates & prizes"
        : fullText.toLowerCase().includes("stipend")
        ? "Stipend, open source mentorship & certificate"
        : null),
    topics: [
      ...new Set([
        ...(analysis.tags || []),
        ...(analysis.details?.competitions || []),
        ...(analysis.details?.people || []),
      ]),
    ],
  };

  return {
    resources: resourcesList,
    links: allDetectedLinks,
    dates: datesList,
    explore,
  };
}

function ExtractionResultCard({
  reel,
  onSaveLink,
  onSaveDate,
  onDelete,
  onAnalyze,
  savedLinks = [],
  savedDates = [],
  isForYouActive,
  reelScore,
}) {
  const [activeSection, setActiveSection] = useState(null);
  const [showAddDate, setShowAddDate] = useState(false);
  const [newDateLabel, setNewDateLabel] = useState("");
  const [newDateValue, setNewDateValue] = useState("");
  const [newDateUrl, setNewDateUrl] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [showAddManualLink, setShowAddManualLink] = useState(false);
  const [manualLinkUrl, setManualLinkUrl] = useState("");
  const [manualLinkLabel, setManualLinkLabel] = useState("");

  const isSavedToShelf = (url) => {
    if (!url) return false;
    const clean = url.trim().toLowerCase();
    return (savedLinks || []).some((item) => (item.url || "").trim().toLowerCase() === clean);
  };

  const { links, dates, explore } = getExtractedData(reel);
  const summary = reel.analysis?.summary || reel.caption || reel.transcript || "Summary not available.";

  // Detect if the reel relates to an internship, scheme, scholarship, hackathon, competition, or opportunity
  const analysis = reel.analysis || {};
  const isOpportunityOrScheme =
    analysis.is_opportunity ||
    /(internship|scheme|scholarship|hackathon|fellowship|grant|competition|contest|bounty|yojana|challenge|program)/i.test(
      `${reel.title || ""} ${explore.category || ""} ${(analysis.tags || []).join(" ")}`
    ) ||
    Boolean(
      explore.category &&
      !/^(other|video|entertainment|reel)$/i.test(explore.category)
    );

  // Determine specific scheme/opportunity name
  let schemeName = null;
  if (isOpportunityOrScheme) {
    if (reel.title && !/^reel\s*\d+/i.test(reel.title)) {
      schemeName = reel.title;
    } else if (explore.organizer && explore.category) {
      schemeName = `${explore.organizer} ${explore.category}`;
    } else if (explore.organizer) {
      schemeName = `${explore.organizer} Opportunity`;
    } else if (analysis.tags?.length > 0) {
      schemeName = `${analysis.tags[0]} Opportunity`;
    } else {
      schemeName = "Identified Scheme / Opportunity";
    }
  }

  // Look for official registration or application URL
  let officialRegUrl = null;
  let officialRegLabel = null;

  // 1. Direct registration / apply links
  const regLink = links.find(
    (l) =>
      /register|registration|apply|application|form|portal/i.test(l.url) ||
      /register|apply|form|portal/i.test(l.contextLabel || "")
  );

  if (regLink) {
    officialRegUrl = regLink.url;
    officialRegLabel = regLink.contextLabel || "Official Registration Page";
  } else {
    // 2. Official sources or resources from analysis
    const sourceWithUrl = (analysis.sources || []).find(
      (s) => s.url && !/(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i.test(s.url)
    );
    const resourceWithUrl = (analysis.resources || []).find(
      (r) => r.url && !/(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i.test(r.url)
    );

    if (sourceWithUrl) {
      officialRegUrl = sourceHref(sourceWithUrl.url);
      officialRegLabel = sourceWithUrl.name || "Official Portal";
    } else if (resourceWithUrl) {
      officialRegUrl = sourceHref(resourceWithUrl.url);
      officialRegLabel = resourceWithUrl.label || "Official Portal";
    } else {
      // 3. First non-social detected link
      const firstNonSocial = links.find(
        (l) => !/(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i.test(l.url)
      );
      if (firstNonSocial) {
        officialRegUrl = firstNonSocial.url;
        officialRegLabel = `Official Page (${firstNonSocial.hostname})`;
      }
    }
  }

  const webSearchQuery = schemeName
    ? `${schemeName} official registration portal application`
    : `${reel.title || "opportunity"} official registration`;
  const webSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(webSearchQuery)}`;

  const toggleSection = (section) => {
    setActiveSection((current) => (current === section ? null : section));
  };

  const handleCopy = (url) => {
    if (!url) return;
    navigator.clipboard?.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleSaveManualLink = (e) => {
    e.preventDefault();
    if (!manualLinkUrl.trim()) return;
    const cleanUrl = sourceHref(manualLinkUrl.trim());
    if (!cleanUrl) return;
    const label = manualLinkLabel.trim() || manualLinkUrl.trim();
    onSaveLink(reel, { name: label, label, url: cleanUrl });
    setManualLinkUrl("");
    setManualLinkLabel("");
    setShowAddManualLink(false);
  };

  const handleAddDateSubmit = (e) => {
    e.preventDefault();
    if (!newDateValue.trim()) return;
    const label = newDateLabel.trim() || `Important date for ${reel.title}`;
    const payload = {
      label,
      event_date: newDateValue.trim(),
      url: newDateUrl.trim() ? sourceHref(newDateUrl.trim()) : null,
    };
    const pref = localStorage.getItem("reelvault_pref_export");
    if (pref === "google") {
      openGoogleCalendar(reel, label, newDateValue.trim());
    }
    onSaveDate(reel, payload);
    setNewDateLabel("");
    setNewDateValue("");
    setNewDateUrl("");
    setShowAddDate(false);
    setActiveSection("dates");
  };

  const handleExportCalendar = (item) => {
    const targetDate = item.iso_date || toInputDate(item.date);
    if (!targetDate) return;
    const pref = localStorage.getItem("reelvault_pref_export");
    if (pref === "google") {
      openGoogleCalendar(reel, item.label, targetDate);
    } else {
      onSaveDate(reel, { label: item.label, event_date: targetDate, url: item.url });
    }
  };

  return (
    <article
      id={`vault-reel-${reel.reel_id}`}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm transition-all"
    >
      {/* 1. Header: Platform & Delete */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {reel.platform}
            {reel.author ? ` · ${reel.author}` : ""}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
            <CalendarDays size={13} /> Saved {formatDate(reel.created_at)}
          </span>
          {isForYouActive && reelScore?.score > 0 && (
            <span className="bg-[#114b43] text-[#d4f954] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles size={10} /> {reelScore.score}% Match
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(reel.reel_id)}
          className="text-gray-300 hover:text-red-500 p-1 transition-colors"
          title="Remove from vault"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {reel.analysis_error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900"
        >
          <strong>Notice:</strong> {reel.analysis_error}
        </p>
      )}

      {/* 1. MAIN VISIBLE CONTENT: ONLY TITLE & SUMMARY */}
      <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] leading-snug">
        {reel.title}
      </h3>

      <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-700">
        {renderHighlightedSummary(summary, [
          explore.organizer,
          explore.category,
          ...(explore.topics || []),
        ])}
      </div>

      {/* 2. ACTIONS DIRECTLY BELOW SUMMARY: Analyze, + Add Date, Open original */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onAnalyze && onAnalyze(reel)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#114b43] bg-[#114b43] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0c3630] transition-colors shadow-xs"
          title="Analyze in Deep Fridge to view original transcript and verify truth"
        >
          <Sparkles size={13} /> Analyze
        </button>
        <button
          type="button"
          onClick={() => setShowAddDate((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            showAddDate
              ? "bg-[#114b43] text-white border-[#114b43]"
              : "bg-[#F5F3E9] text-[#114b43] border-[#114b43]/20 hover:bg-[#ece8d7]"
          }`}
        >
          <CalendarPlus size={13} /> Add Date
        </button>
        <a
          href={reel.url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 underline underline-offset-4"
        >
          Open original <ExternalLink size={12} />
        </a>
      </div>

      {/* Inline Form: Add Date */}
      {showAddDate && (
        <form
          onSubmit={handleAddDateSubmit}
          className="mt-3.5 rounded-2xl border border-[#114b43]/25 bg-[#F5F3E9] p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#114b43]">
              + Add Date to Calendar
            </p>
            <button
              type="button"
              onClick={() => setShowAddDate(false)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={15} />
            </button>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Event / Deadline Label
              </label>
              <input
                type="text"
                placeholder="e.g., Registration Deadline"
                value={newDateLabel}
                onChange={(e) => setNewDateLabel(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#114b43]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newDateValue}
                onChange={(e) => setNewDateValue(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#114b43]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Associated Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={newDateUrl}
                onChange={(e) => setNewDateUrl(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#114b43]"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddDate(false)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#114b43] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0c3630] transition-colors shadow-xs"
            >
              Save Date
            </button>
          </div>
        </form>
      )}

      {/* 3. BOTTOM INFORMATION SECTION BAR (Order: 1. Explore, 2. Links, 3. Dates) */}
      <div className="mt-5 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* 1) Explore Tab */}
          <button
            type="button"
            onClick={() => toggleSection("explore")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeSection === "explore"
                ? "bg-[#114b43] text-white shadow-xs"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-[#114b43]"
            }`}
          >
            <Compass size={13} />
            <span>Explore</span>
          </button>

          {/* 2) Links Tab */}
          <button
            type="button"
            onClick={() => toggleSection("links")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeSection === "links"
                ? "bg-[#114b43] text-white shadow-xs"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-[#114b43]"
            }`}
          >
            <Globe size={13} />
            <span>Links</span>
            {(links.length > 0 || isOpportunityOrScheme) && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeSection === "links"
                    ? "bg-white/20 text-white"
                    : "bg-[#114b43]/10 text-[#114b43]"
                }`}
              >
                {links.length || 1}
              </span>
            )}
          </button>

          {/* 3) Dates Tab */}
          <button
            type="button"
            onClick={() => toggleSection("dates")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeSection === "dates"
                ? "bg-[#114b43] text-white shadow-xs"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-[#114b43]"
            }`}
          >
            <Calendar size={13} />
            <span>Dates</span>
            {dates.length > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeSection === "dates"
                    ? "bg-white/20 text-white"
                    : "bg-[#114b43]/10 text-[#114b43]"
                }`}
              >
                {dates.length}
              </span>
            )}
          </button>
        </div>

        {/* 4. SELECTED SECTION CONTENT */}
        {activeSection && (
          <div className="mt-4 rounded-2xl bg-gray-50/70 border border-gray-100 p-4">
            {/* 1) Explore Section View */}
            {activeSection === "explore" && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43] mb-3 flex items-center gap-1.5">
                  <Compass size={13} /> Extracted Metadata & Exploration
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {explore.organizer && (
                    <div className="rounded-xl bg-white border border-gray-200/80 p-3 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                        Organizer / Company
                      </p>
                      <p className="text-xs font-bold text-gray-900">{explore.organizer}</p>
                    </div>
                  )}
                  {explore.prize_pool && (
                    <div className="rounded-xl bg-white border border-gray-200/80 p-3 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                        Prize Pool
                      </p>
                      <p className="text-xs font-bold text-emerald-800">{explore.prize_pool}</p>
                    </div>
                  )}
                  {explore.category && (
                    <div className="rounded-xl bg-white border border-gray-200/80 p-3 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                        Category
                      </p>
                      <p className="text-xs font-bold text-gray-900">{explore.category}</p>
                    </div>
                  )}
                  {explore.eligibility && (
                    <div className="rounded-xl bg-white border border-gray-200/80 p-3 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                        Eligibility
                      </p>
                      <p className="text-xs font-bold text-gray-900">{explore.eligibility}</p>
                    </div>
                  )}
                  {explore.location && (
                    <div className="rounded-xl bg-white border border-gray-200/80 p-3 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                        Location / Mode
                      </p>
                      <p className="text-xs font-bold text-gray-900">{explore.location}</p>
                    </div>
                  )}
                  {explore.benefits && (
                    <div className="rounded-xl bg-white border border-gray-200/80 p-3 shadow-2xs sm:col-span-2 lg:col-span-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                        Benefits & Perks
                      </p>
                      <p className="text-xs font-bold text-gray-900">{explore.benefits}</p>
                    </div>
                  )}
                </div>

                {explore.topics?.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-gray-200/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Search Topics:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {explore.topics.map((top) => (
                        <a
                          key={top}
                          href={`https://www.google.com/search?q=${encodeURIComponent(top)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-[#114b43] hover:bg-[#F5F3E9] transition-colors"
                        >
                          {top}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2) Links Section View */}
            {activeSection === "links" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43] flex items-center gap-1.5">
                    <Globe size={13} /> Scheme Registration & Detected Links
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddManualLink((prev) => !prev)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#114b43]/30 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#114b43] hover:bg-[#F5F3E9] transition-colors shadow-2xs"
                    >
                      <BookmarkPlus size={12} /> Save Link
                    </button>
                    <span className="text-[11px] text-gray-400">
                      {links.length} {links.length === 1 ? "link" : "links"} detected
                    </span>
                  </div>
                </div>

                {/* Optional manual add link form */}
                {showAddManualLink && (
                  <form
                    onSubmit={handleSaveManualLink}
                    className="mb-4 rounded-xl border border-[#114b43]/20 bg-[#F5F3E9] p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#114b43]">
                        Save Custom Link to Link Shelf
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddManualLink(false)}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        type="url"
                        placeholder="https://example.com/portal"
                        value={manualLinkUrl}
                        onChange={(e) => setManualLinkUrl(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#114b43]"
                      />
                      <input
                        type="text"
                        placeholder="Link label or description"
                        value={manualLinkLabel}
                        onChange={(e) => setManualLinkLabel(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#114b43]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddManualLink(false)}
                        className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-[#114b43] px-3.5 py-1 text-xs font-bold text-white hover:bg-[#0c3630]"
                      >
                        Save to Shelf
                      </button>
                    </div>
                  </form>
                )}

                {/* Requirement 3: If internship/scheme/hackathon is found:
                    provide link to register to official page, or if not found give option to search on web */}
                {isOpportunityOrScheme && (
                  <div className="mb-4 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="rounded-full bg-[#114b43]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#114b43]">
                            {explore.category || "Opportunity / Scheme"}
                          </span>
                          {officialRegUrl ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <CheckCircle2 size={11} className="text-emerald-600" /> Official Link Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              <Search size={11} className="text-amber-600" /> Direct Link Not in Video
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 leading-snug">
                          {schemeName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {officialRegUrl
                            ? `Direct link to register or access official page for this ${explore.category?.toLowerCase() || "scheme"}:`
                            : `The official link was not mentioned directly in the reel transcript. You can search on the web for the official page below:`}
                        </p>
                        {officialRegUrl && (
                          <p className="mt-1 text-xs font-mono text-emerald-800 truncate">
                            {officialRegUrl}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-wrap items-center gap-2">
                        {officialRegUrl ? (
                          <>
                            {isSavedToShelf(officialRegUrl) ? (
                              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800">
                                <BookmarkCheck size={13} className="text-emerald-600" /> Saved to Shelf
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  onSaveLink(reel, {
                                    name: `${schemeName} Registration`,
                                    label: `${schemeName} Registration`,
                                    url: officialRegUrl,
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded-xl border border-[#114b43]/30 bg-white px-3 py-2 text-xs font-bold text-[#114b43] hover:bg-[#F5F3E9] transition-colors"
                                title="Save link to Shelf"
                              >
                                <BookmarkPlus size={13} /> Save Link
                              </button>
                            )}
                            <a
                              href={officialRegUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#114b43] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3630] transition-colors shadow-xs"
                            >
                              Register on Official Page <ExternalLink size={12} />
                            </a>
                          </>
                        ) : (
                          <a
                            href={webSearchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
                          >
                            <Search size={13} /> Search on Web <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Detected URLs List */}
                {links.length === 0 && !isOpportunityOrScheme ? (
                  <p className="text-xs text-gray-500 py-2">
                    No links detected in the transcript.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {links.map((item, idx) => (
                      <div
                        key={`${item.url}-${idx}`}
                        className="rounded-xl bg-white border border-gray-200/80 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {item.hostname}
                          </p>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-600 hover:underline truncate block"
                          >
                            {item.url}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isSavedToShelf(item.url) ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800">
                              <BookmarkCheck size={12} className="text-emerald-600" /> Saved
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                onSaveLink(reel, {
                                  name: item.hostname || reel.title,
                                  label: item.hostname || reel.title,
                                  url: item.url,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-[#114b43]/30 bg-white px-2.5 py-1 text-xs font-bold text-[#114b43] hover:bg-[#F5F3E9] transition-colors"
                              title="Save to Link Shelf"
                            >
                              <BookmarkPlus size={12} /> Save Link
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopy(item.url)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          >
                            {copiedUrl === item.url ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <Check size={11} /> Copied
                              </span>
                            ) : (
                              <>
                                <Copy size={11} /> Copy
                              </>
                            )}
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#114b43] px-3 py-1 text-xs font-bold text-white hover:bg-[#0c3630]"
                          >
                            Visit <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3) Dates Section View */}
            {activeSection === "dates" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43] flex items-center gap-1.5">
                    <Calendar size={13} /> Actionable Dates & Deadlines
                  </p>
                  <span className="text-[11px] text-gray-400">
                    {dates.length} {dates.length === 1 ? "date" : "dates"}
                  </span>
                </div>
                {dates.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">
                    No dates mentioned in this reel. Click <strong>+ Add Date</strong> above to add one.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {dates.map((item, idx) => (
                      <div
                        key={`${item.date}-${idx}`}
                        className="rounded-xl bg-white border border-gray-200/80 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.date}</p>
                          <p className="text-xs font-semibold text-[#114b43] mt-0.5">{item.label}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"
                            >
                              🔗 Register
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleExportCalendar(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                          >
                            <CalendarPlus size={12} /> Add to Calendar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}


function DeepFridgePage({ reels, language, onDelete, focusReelId }) {
  const [expandedTranscripts, setExpandedTranscripts] = useState({});
  const [verifyingMap, setVerifyingMap] = useState({});
  const [resultsMap, setResultsMap] = useState(() => {
    try {
      const cached = localStorage.getItem("reelvault_tavily_results");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [errorMap, setErrorMap] = useState({});

  useEffect(() => {
    if (focusReelId) {
      const element = document.getElementById(`deep-fridge-reel-${focusReelId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [focusReelId]);

  const toggleTranscript = (reelId) => {
    setExpandedTranscripts((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }));
  };

  const handleVerifyContent = async (reel) => {
    const reelId = reel.reel_id;
    setVerifyingMap((prev) => ({ ...prev, [reelId]: true }));
    setErrorMap((prev) => ({ ...prev, [reelId]: null }));

    const title = reel.title || "";
    const summary = reel.analysis?.summary || reel.caption || "";
    const keywords = reel.analysis?.tags || [];
    const keywordStr = keywords.slice(0, 3).join(" ");

    let query = "";
    if (title && keywordStr) {
      query = `${title} ${keywordStr}`;
    } else if (title) {
      query = title;
    } else if (summary) {
      query = summary.slice(0, 100);
    } else {
      query = "opportunity verification";
    }

    try {
      const res = await api.verifyWithTavily(reelId, {
        query,
        title,
        summary,
        keywords,
      });
      setResultsMap((prev) => {
        const next = { ...prev, [reelId]: res };
        try {
          localStorage.setItem("reelvault_tavily_results", JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (err) {
      setErrorMap((prev) => ({
        ...prev,
        [reelId]: err?.message || "Failed to verify content with Tavily.",
      }));
    } finally {
      setVerifyingMap((prev) => ({ ...prev, [reelId]: false }));
    }
  };

  return (
    <section className="pt-2" aria-label="Analyze and Verify Truth">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#114b43]">
            Analyze
          </p>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Tavily Search Platform
          </span>
        </div>
        <h2 className="font-display text-3xl tracking-wide uppercase text-[#1a1a1a] mt-1">
          ANALYZE & VERIFY TRUTH
        </h2>
        <p className="text-gray-600 font-medium mt-2">
          Inspect spoken audio transcripts and summaries, verify reel correctness in real time using the Tavily search platform, and review evidence-backed web sources.
        </p>
      </div>

      {reels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">No reels saved yet.</p>
          <p className="mt-1">
            Save a reel in your Vault to analyze spoken audio transcripts and verify truth with Tavily.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reels.map((reel) => {
            const reelId = reel.reel_id;
            const isExpanded = !!expandedTranscripts[reelId];
            const isVerifying = !!verifyingMap[reelId];
            const tavilyResult = resultsMap[reelId];
            const hasVerified = !!tavilyResult?.verified;
            const summaryText = reel.analysis?.summary || reel.caption || "No summary available.";

            return (
              <article
                key={reelId}
                id={`deep-fridge-reel-${reelId}`}
                className={`rounded-2xl border bg-white p-6 shadow-sm transition-all ${
                  focusReelId === reelId
                    ? "border-[#114b43] ring-2 ring-[#114b43]/30"
                    : "border-gray-100"
                }`}
              >
                {/* Header: Platform, Saved Date, Remove button */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {reel.platform} · saved {formatDate(reel.created_at)}
                    </p>
                    {/* Title */}
                    <h3 className="mt-1 font-bold text-xl text-[#1a1a1a]">
                      {reel.title || "Untitled Reel"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(reelId)}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
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

                {/* 1. Summary */}
                <div className="mt-4 rounded-xl border border-[#114b43]/15 bg-[#F5F3E9] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#114b43] mb-1">
                    Summary
                  </p>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {summaryText}
                  </p>
                  {reel.analysis?.summary_points?.length > 0 && (
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

                {/* 2. Original Transcribe: Collapsible Accordion (expand on click) */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => toggleTranscript(reelId)}
                    className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/90 px-4 py-3 text-left hover:bg-gray-100 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-[#114b43]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#114b43]">
                        Original Transcribe
                      </span>
                      <span className="text-[10px] font-medium text-gray-500">
                        {isExpanded ? "(click to collapse)" : "(click to expand)"}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Spoken Audio Transcript
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {(reel.transcript || reel.caption || "").length} characters
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {reel.transcript || reel.caption || "No original transcript available."}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Bottom Action Bar: Verify Content Button */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleVerifyContent(reel)}
                      disabled={isVerifying}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                        hasVerified
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-[#114b43] hover:bg-[#0c352f] text-white"
                      } disabled:opacity-60`}
                    >
                      {isVerifying ? (
                        <>
                          <LoaderCircle size={15} className="animate-spin text-white" />
                          <span>Verifying with Tavily…</span>
                        </>
                      ) : hasVerified ? (
                        <>
                          <CheckCircle2 size={16} className="text-white" />
                          <span>Re-verify Content</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          <span>Verify the Content</span>
                        </>
                      )}
                    </button>

                    <a
                      href={reel.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 underline underline-offset-4"
                    >
                      <ExternalLink size={13} /> Open original reel
                    </a>
                  </div>

                  {hasVerified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Content Verified
                    </span>
                  )}
                </div>

                {/* Loading state indicator */}
                {isVerifying && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-[#114b43]">
                    <LoaderCircle size={18} className="animate-spin text-[#114b43] shrink-0" />
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wide">
                        Searching & Verifying Truth with Tavily…
                      </p>
                      <p className="text-xs text-emerald-800">
                        Querying real-time web sources using title, summary, and keywords.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {errorMap[reelId] && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Verification Failed</p>
                      <p>{errorMap[reelId]}</p>
                    </div>
                  </div>
                )}

                {/* Tavily Verified Results Card & Top 3 Sources */}
                {hasVerified && tavilyResult && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-emerald-950">
                              Content Verified
                            </span>
                            <span className="rounded-full bg-emerald-200/90 px-2 py-0.5 text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                              Tavily Platform
                            </span>
                          </div>
                          {tavilyResult.query && (
                            <p className="text-[11px] text-emerald-800 mt-0.5">
                              Searched: <span className="font-semibold italic">"{tavilyResult.query}"</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Top 3 Sources Found
                      </span>
                    </div>

                    {/* Top 3 Web Sources */}
                    <div className="mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#114b43] mb-3 flex items-center gap-1.5">
                        <Globe size={13} /> Top 3 Sources from the Web
                      </h4>
                      <div className="space-y-3">
                        {(tavilyResult.sources || []).slice(0, 3).map((source, sIdx) => {
                          let displayHost = "";
                          try {
                            displayHost = new URL(source.url).hostname.replace("www.", "");
                          } catch {
                            displayHost = source.url;
                          }
                          return (
                            <div
                              key={`${source.url}-${sIdx}`}
                              className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs hover:border-[#114b43]/40 transition-colors"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#114b43] text-[10px] font-bold text-white shrink-0">
                                    {sIdx + 1}
                                  </span>
                                  <h5 className="font-bold text-sm text-gray-900 leading-snug">
                                    {source.title || `Web Source #${sIdx + 1}`}
                                  </h5>
                                </div>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200/70 shrink-0"
                                >
                                  <ExternalLink size={12} /> {displayHost}
                                </a>
                              </div>
                              {source.content && (
                                <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                                  {source.content}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
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

const DEMO_LINKS = [
  {
    id: 1,
    title: "Odoo Hackathon 2026",
    name: "Odoo",
    url: "https://www.odoo.com/",
    savedDate: "Oct 5, 2026"
  },
  {
    id: 2,
    title: "NVIDIA AI Hackathon",
    name: "NVIDIA",
    url: "https://www.nvidia.com/",
    savedDate: "Oct 4, 2026"
  },
  {
    id: 3,
    title: "Google Summer of Code",
    name: "Google",
    url: "https://summerofcode.withgoogle.com/",
    savedDate: "Oct 2, 2026"
  },
  {
    id: 4,
    title: "Microsoft Student Opportunities",
    name: "Microsoft",
    url: "https://www.microsoft.com/",
    savedDate: "Sep 30, 2026"
  }
];

function LinkShelf({ links = [], dates = [], onDeleteLink, onDeleteDate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  
  const displayItems = links.length > 0
    ? links.map((l) => {
        let domain = "Web Link";
        try {
          domain = new URL(l.url).hostname.replace(/^www\./, "");
        } catch {}
        return {
          id: l.id,
          reelId: l.reel_id,
          title: l.label || "Saved Resource",
          name: domain,
          url: l.url,
          savedDate: formatDate(l.created_at || new Date()),
          isReal: true,
        };
      })
    : DEMO_LINKS.map((l) => ({ ...l, isReal: false }));

  const sources = ["All Sources", ...new Set(displayItems.map((link) => link.name))];

  const filteredLinks = displayItems.filter((link) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      link.title.toLowerCase().includes(q) ||
      link.name.toLowerCase().includes(q) ||
      link.url.toLowerCase().includes(q);
      
    const matchesSource = sourceFilter === "All Sources" || link.name === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  return (
    <section className="pt-2">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#114b43]">
          Link Shelf
        </p>
        <h2 className="font-display text-3xl tracking-wide uppercase text-[#1a1a1a] mt-1">
          LINK SHELF
        </h2>
        <p className="mt-2 font-medium text-gray-600">
          All actionable resources, links, and portals extracted or saved from your reels.
        </p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search saved resources and links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-gray-800 placeholder-gray-400 focus:border-[#114b43] focus:outline-none focus:ring-1 focus:ring-[#114b43]"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm font-medium text-gray-800 focus:border-[#114b43] focus:outline-none focus:ring-1 focus:ring-[#114b43]"
        >
          {sources.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500 flex flex-col items-center text-center">
          <BookmarkCheck size={28} className="text-gray-300 mb-2" />
          <p className="font-semibold text-gray-700">No resources on your shelf yet.</p>
          <p className="mt-1 text-gray-400">
            Resources and registration links extracted from your reels will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLinks.map((link) => (
            <article key={`${link.id}-${link.url}`} className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#114b43]">
                    {link.name}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.2 text-[9px] font-bold text-emerald-800">
                    <BookmarkCheck size={10} className="text-emerald-600" /> Shelf
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1a1a1a] truncate mb-2">
                  {link.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 truncate">
                  <Link2 size={14} className="shrink-0" />
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-600 transition-colors">
                    {link.url}
                  </a>
                </div>
                <p className="text-xs font-semibold text-gray-400">
                  Saved {link.savedDate}
                </p>
              </div>
              
              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#114b43] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#0c3630] transition-colors whitespace-nowrap shadow-xs"
                >
                  OPEN LINK <ExternalLink size={14} />
                </a>
                {link.isReal && onDeleteLink && (
                  <button
                    type="button"
                    onClick={() => onDeleteLink(link.id)}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove from Shelf"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
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
    try {
      const label = source.label || source.name || reel.title || "Saved Resource";
      const saved = await api.saveLink(reel.reel_id, { label, url });
      setSavedLinks((current) =>
        current.some((item) => item.id === saved.id || item.url?.toLowerCase() === url.toLowerCase())
          ? current
          : [saved, ...current]
      );
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Could not save this link.");
    }
  };

  // Requirement 8: Automatic Shelf Integration for all extracted resources
  useEffect(() => {
    if (!reels.length) return;
    const syncResourcesToShelf = async () => {
      for (const reel of reels) {
        const { resources } = getExtractedData(reel);
        for (const res of resources) {
          if (res.url) {
            const alreadySaved = savedLinks.some(
              (item) => item.url?.toLowerCase() === res.url.toLowerCase()
            );
            if (!alreadySaved) {
              try {
                const saved = await api.saveLink(reel.reel_id, {
                  label: res.label || reel.title,
                  url: res.url,
                });
                setSavedLinks((current) =>
                  current.some((item) => item.url?.toLowerCase() === res.url.toLowerCase())
                    ? current
                    : [saved, ...current]
                );
              } catch {
                // Silently continue for background shelf auto-sync
              }
            }
          }
        }
      }
    };
    syncResourcesToShelf();
  }, [reels]);

  const handleSaveDate = async (reel, payload) => {
    try {
      const saved = await api.saveDate(reel.reel_id, payload);
      setSavedDates((current) => (current.some((item) => item.id === saved.id) ? current : [...current, saved]));
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Could not save this date.");
    }
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

  const [deepFridgeFocusId, setDeepFridgeFocusId] = useState(null);

  const handleAnalyze = (reel) => {
    setActiveTab("research");
    setDeepFridgeFocusId(reel.reel_id);
    setTimeout(() => {
      const element = document.getElementById(`deep-fridge-reel-${reel.reel_id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-[#114b43]/30', 'transition-all', 'duration-500');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-[#114b43]/30');
        }, 2500);
      }
    }, 120);
  };

  return (
    <div className="w-full pb-10 pt-2">
      <div role="tablist" aria-label="Vault sections" className="mb-7 inline-flex max-w-full overflow-x-auto rounded-xl bg-[#F5F3E9] p-1 gap-1">
        <button type="button" role="tab" aria-selected={activeTab === "vault"} onClick={() => setActiveTab("vault")} className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "vault" ? "bg-white text-[#114b43] shadow-sm" : "text-gray-500 hover:text-[#114b43]"}`}><Bookmark size={14} /> Vault</button>
        <button type="button" role="tab" aria-selected={activeTab === "research"} onClick={() => setActiveTab("research")} className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "research" ? "bg-white text-[#114b43] shadow-sm" : "text-gray-500 hover:text-[#114b43]"}`}><Sparkles size={14} /> Analyze</button>
        <button type="button" role="tab" aria-selected={activeTab === "shelf"} onClick={() => setActiveTab("shelf")} className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "shelf" ? "bg-white text-[#114b43] shadow-sm" : "text-gray-500 hover:text-[#114b43]"}`}><Link2 size={14} /> Link Shelf</button>
        <button type="button" role="tab" aria-selected={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "calendar" ? "bg-white text-[#114b43] shadow-sm" : "text-gray-500 hover:text-[#114b43]"}`}><CalendarDays size={14} /> Calendar</button>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-4">
          <AlertCircle size={16} /> {loadError}
        </div>
      )}

      {activeTab === "research" ? <DeepFridgePage reels={reels} language={language} onDelete={handleDelete} focusReelId={deepFridgeFocusId} /> : activeTab === "shelf" ? <LinkShelf links={savedLinks} dates={savedDates} onDeleteLink={handleDeleteLink} onDeleteDate={handleDeleteDate} /> : activeTab === "calendar" ? (
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
            <div className="space-y-6">
              {displayReels.map((reel) => (
                <ExtractionResultCard
                  key={reel.reel_id}
                  reel={reel}
                  onSaveLink={handleSaveLink}
                  onSaveDate={handleSaveDate}
                  onDelete={handleDelete}
                  onAnalyze={handleAnalyze}
                  savedLinks={savedLinks}
                  savedDates={savedDates}
                  isForYouActive={isForYouActive}
                  reelScore={reelScores[reel.reel_id]}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
