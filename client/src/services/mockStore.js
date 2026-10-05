const MOCK_STORAGE_KEY_REELS = 'reelvault_mock_reels';
const MOCK_STORAGE_KEY_RESEARCH = 'reelvault_mock_research';
const MOCK_STORAGE_KEY_LINKS = 'reelvault_mock_links';
const MOCK_STORAGE_KEY_DATES = 'reelvault_mock_dates';
const MOCK_STORAGE_KEY_LINK_VAULT = 'reelvault_mock_link_vault';

export const MOCK_ADMIN_USER = {
  id: 'usr_static_admin',
  email: 'admin@reelvault.app',
  name: 'Admin',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
};

export const MOCK_ADMIN_SESSION = {
  access_token: 'mock_static_admin_token',
  refresh_token: 'mock_static_admin_refresh_token',
  token_type: 'bearer',
  expires_in: 86400 * 30,
  user: MOCK_ADMIN_USER,
  is_mock: true,
};

export function isStaticAdmin(email, password) {
  const normEmail = (email || '').trim().toLowerCase();
  const normPass = (password || '').trim();
  return (normEmail === 'admin' || normEmail === 'admin@reelvault.app' || normEmail === 'admin@example.com') && normPass === 'admin';
}

export function isMockSession(session) {
  return Boolean(session?.is_mock || session?.access_token === 'mock_static_admin_token');
}

const INITIAL_REELS = [
  {
    reel_id: 1,
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/C8qV7_1xYz9/',
    title: 'AI Founders Global Grant 2026 - $100K Non-Dilutive Funding',
    author: 'techgrants_official',
    transcript_status: 'verified',
    transcript: 'Applications are now open for the AI Founders Global Grant 2026. Up to 100,000 dollars in non-dilutive equity-free funding for students and early-stage engineers building AI products. The application deadline is November 15, 2026. Register at https://aifoundersgrant.org and submit your demo project. Selected teams will be invited to San Francisco for the pitch finals on December 10, 2026.',
    caption: 'Global AI grant alert! Tag a builder friend. #hackathon #ai #grants #funding',
    created_at: '2026-10-04T10:30:00Z',
    cached: true,
    analysis: {
      summary: 'Non-dilutive $100,000 global grant program for AI developers and students with finals in San Francisco.',
      english_transcript: 'Applications are now open for the AI Founders Global Grant 2026. Up to 100,000 dollars in non-dilutive equity-free funding for students and early-stage engineers building AI products. The application deadline is November 15, 2026. Register at https://aifoundersgrant.org and submit your demo project. Selected teams will be invited to San Francisco for the pitch finals on December 10, 2026.',
      summary_points: [
        'Equity-free grant of up to $100,000 for student and indie AI developers.',
        'Official submission portal deadline is November 15, 2026.',
        'Pitch finals will be hosted on December 10, 2026 in San Francisco.'
      ],
      tags: ['grant', 'hackathon', 'ai', 'funding', 'students'],
      sources: [
        { name: 'AI Founders Grant Official', url: 'https://aifoundersgrant.org' },
        { name: 'Application Guidelines & Portal', url: 'https://aifoundersgrant.org/apply' }
      ],
      details: {
        dates: ['2026-11-15', '2026-12-10'],
        books: [],
        people: ['Sarah Chen', 'David Brooks'],
        competitions: ['Global AI Pitch Finals 2026']
      }
    }
  },
  {
    reel_id: 2,
    platform: 'youtube',
    url: 'https://youtube.com/shorts/gsoc2026fellowship',
    title: 'Google Summer of Code & Open Source Mentorship 2026',
    author: 'devinsider',
    transcript_status: 'verified',
    transcript: 'GSoC open source contributor stipends have been updated for 2026! Over 150 open source organizations are accepting student proposals. Key registration starts October 20, 2026 with final contributor applications closing December 1, 2026. Check the mentor list on summerofcode.withgoogle.com and review past editions on github.com.',
    caption: 'Everything you need to know about GSoC 2026 stipends and deadlines.',
    created_at: '2026-10-05T08:00:00Z',
    cached: true,
    analysis: {
      summary: 'Global fellowship and stipend program for students contributing to open-source software with 150+ organizations.',
      english_transcript: 'GSoC open source contributor stipends have been updated for 2026! Over 150 open source organizations are accepting student proposals. Key registration starts October 20, 2026 with final contributor applications closing December 1, 2026. Check the mentor list on summerofcode.withgoogle.com and review past editions on github.com.',
      summary_points: [
        'Stipend funded open-source contribution under participating tech mentors.',
        'Contributor applications open October 20 and close December 1, 2026.',
        'Official organization catalog available on summerofcode.withgoogle.com.'
      ],
      tags: ['internship', 'open_source', 'google', 'mentorship'],
      sources: [
        { name: 'Google Summer of Code Portal', url: 'https://summerofcode.withgoogle.com' },
        { name: 'GSoC Organization Guide', url: 'https://summerofcode.withgoogle.com/organizations' }
      ],
      details: {
        dates: ['2026-10-20', '2026-12-01'],
        books: ['The Cathedral and the Bazaar'],
        people: ['Linus Torvalds'],
        competitions: ['GSoC 2026']
      }
    }
  },
  {
    reel_id: 3,
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@scholarshiphub/video/739102938192',
    title: 'National STEM Future Leaders Scholarship 2026',
    author: 'scholarshiphub',
    transcript_status: 'verified',
    transcript: 'Undergraduate and high school seniors: full tuition grant plus monthly research allowance for STEM degrees. Minimum GPA 3.2. Applications open online until November 30, 2026.',
    caption: 'Full tuition STEM scholarship alert for 2026 students! Link in bio.',
    created_at: '2026-10-02T14:15:00Z',
    cached: true,
    analysis: {
      summary: 'Full tuition support plus research stipend for undergraduate STEM students with Nov 30 deadline.',
      english_transcript: 'Undergraduate and high school seniors: full tuition grant plus monthly research allowance for STEM degrees. Minimum GPA 3.2. Applications open online until November 30, 2026.',
      summary_points: [
        'Full tuition scholarship with monthly stipend for STEM degrees.',
        'Minimum GPA 3.2 required.',
        'Submission portal closes November 30, 2026.'
      ],
      tags: ['scholarship', 'stem', 'education', 'undergrad'],
      sources: [
        { name: 'STEM Scholarship Foundation', url: 'https://stemleadersfund.org' }
      ],
      details: {
        dates: ['2026-11-30'],
        books: [],
        people: [],
        competitions: []
      }
    }
  }
];

const INITIAL_RESEARCH = {
  1: {
    id: 1,
    status: 'done',
    created_at: '2026-10-04T12:00:00Z',
    finished_at: '2026-10-04T12:01:15Z',
    classification: {
      is_opportunity: true,
      category: 'hackathon',
      reason: 'Official non-dilutive grant opportunity for AI engineers and students.'
    },
    verification: {
      verdict: 'official_confirmed',
      sources_verified: true,
      summary: 'Verified authentic opportunity and topics for "AI Founders Global Grant 2026". Gemini web search confirmed the application portal and dates against official registries.',
      official_deadline: '2026-11-15',
      official_urls: ['https://aifoundersgrant.org', 'https://aifoundersgrant.org/apply'],
      supporting_urls: ['https://news.ycombinator.com', 'https://techcrunch.com'],
      scam_signals: [],
      guard_notes: ['Verified via Gemini API web search with real-time web citations.'],
      claim_checks: [
        {
          claim: 'Applications open for AI Founders Global Grant 2026',
          status: 'verified',
          evidence: 'Active application portal confirmed on aifoundersgrant.org/apply.',
          source_url: 'https://aifoundersgrant.org/apply'
        },
        {
          claim: 'Up to $100,000 equity-free funding for AI developers and students',
          status: 'verified',
          evidence: 'Official grant guidelines confirm $100K non-dilutive awards.',
          source_url: 'https://aifoundersgrant.org'
        },
        {
          claim: 'Application submission deadline is November 15, 2026',
          status: 'verified',
          evidence: 'Registration cutoff confirmed on official calendar for Nov 15, 2026.',
          source_url: 'https://aifoundersgrant.org'
        }
      ]
    },
    report: {
      eligibility: [
        { text: 'Open to student developers, indies, and early-stage founders globally.', source_urls: ['https://aifoundersgrant.org/apply'] }
      ],
      timeline: [
        { text: 'Registration deadline: November 15, 2026. Pitch finals: December 10, 2026 in SF.', source_urls: ['https://aifoundersgrant.org'] }
      ],
      how_to_apply: [
        { text: 'Submit a 2-minute video demo and public GitHub repository link via the official portal.', source_urls: ['https://aifoundersgrant.org/apply'] }
      ],
      past_editions: [
        { text: 'Previous 2025 cohort awarded 12 projects across 7 countries.', source_urls: ['https://aifoundersgrant.org/past-recipients'] }
      ],
      selection_criteria: [
        { text: 'Evaluated on technical difficulty, novelty, and clear user validation.', source_urls: ['https://aifoundersgrant.org'] }
      ],
      red_flags: [],
      related_links: ['https://aifoundersgrant.org', 'https://aifoundersgrant.org/apply'],
      source_evidence: [
        {
          source_type: 'official_page',
          url: 'https://aifoundersgrant.org',
          content: 'Official AI Founders Global Grant Program 2026 rules, guidelines and eligibility criteria. Grants are distributed in two tranches upon milestone completion.'
        }
      ]
    }
  }
};

const INITIAL_LINKS = [
  { id: 1, reel_id: 1, label: 'AI Founders Grant Official', url: 'https://aifoundersgrant.org', created_at: '2026-10-04T10:35:00Z' },
  { id: 2, reel_id: 2, label: 'Google Summer of Code Portal', url: 'https://summerofcode.withgoogle.com', created_at: '2026-10-05T08:05:00Z' }
];

const INITIAL_DATES = [
  { id: 1, reel_id: 1, label: 'AI Founders Grant Deadline', event_date: '2026-11-15', created_at: '2026-10-04T10:36:00Z' },
  { id: 2, reel_id: 2, label: 'GSoC Registration Opens', event_date: '2026-10-20', created_at: '2026-10-05T08:06:00Z' },
  { id: 3, reel_id: 3, label: 'STEM Leaders Scholarship Deadline', event_date: '2026-11-30', created_at: '2026-10-02T14:20:00Z' }
];

const INITIAL_LINK_VAULT = [
  {
    id: 1,
    reel_id: 1,
    title: 'AI Founders Global Grant 2026 - $100K Non-Dilutive Funding',
    links: [{ name: 'AI Founders Grant Official', url: 'https://aifoundersgrant.org' }],
    topics: ['grant', 'hackathon', 'ai', 'funding', 'students'],
    created_at: '2026-10-04T10:35:00Z',
  },
];

function getStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const mockStore = {
  getReels() {
    return getStored(MOCK_STORAGE_KEY_REELS, INITIAL_REELS);
  },

  setReels(reels) {
    setStored(MOCK_STORAGE_KEY_REELS, reels);
  },

  getReel(id) {
    const reels = this.getReels();
    return reels.find((r) => r.reel_id === Number(id)) || null;
  },

  saveReel(url) {
    const reels = this.getReels();
    const cleanUrl = url.trim();
    let platform = 'instagram';
    if (/youtube\.com|youtu\.be/i.test(cleanUrl)) platform = 'youtube';
    else if (/tiktok\.com/i.test(cleanUrl)) platform = 'tiktok';

    const newId = reels.length > 0 ? Math.max(...reels.map((r) => r.reel_id)) + 1 : 1;
    const now = new Date().toISOString();
    const targetDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

    const newReel = {
      reel_id: newId,
      platform,
      url: cleanUrl,
      title: `Saved ${platform.charAt(0).toUpperCase() + platform.slice(1)} Opportunity #${newId}`,
      author: 'creator_' + Math.random().toString(36).substring(2, 7),
      transcript_status: 'verified',
      transcript: `Official announcement: registration is officially open for candidate participation until ${targetDate}. Verified eligibility and criteria apply.`,
      caption: `New ${platform} alert! Deadline: ${targetDate}. Check the official website.`,
      created_at: now,
      cached: false,
      analysis: {
        summary: `Verified opportunity with active deadline on ${targetDate}. Direct applications open online.`,
        english_transcript: `Official announcement: registration is officially open for candidate participation until ${targetDate}. Verified eligibility and criteria apply.`,
        summary_points: [
          'Direct applications open online with no registration fee.',
          `Official deadline specified for ${targetDate}.`,
          'Official program credentials verified against official portal.'
        ],
        tags: ['opportunity', 'internship', 'application'],
        sources: [
          { name: 'Official Announcement Portal', url: 'https://opportunity-verified.org' }
        ],
        details: {
          dates: [targetDate],
          books: [],
          people: [],
          competitions: [`Opportunity Challenge #${newId}`]
        }
      }
    };

    const updated = [newReel, ...reels];
    this.setReels(updated);
    return newReel;
  },

  deleteReel(id) {
    const reels = this.getReels();
    const filtered = reels.filter((r) => r.reel_id !== Number(id));
    this.setReels(filtered);

    const allResearch = getStored(MOCK_STORAGE_KEY_RESEARCH, INITIAL_RESEARCH);
    delete allResearch[id];
    setStored(MOCK_STORAGE_KEY_RESEARCH, allResearch);

    return true;
  },

  getResearch(reelId, body = {}) {
    const all = getStored(MOCK_STORAGE_KEY_RESEARCH, INITIAL_RESEARCH);
    if (all[reelId] && !body?.forceRefresh) return all[reelId];

    const reel = this.getReel(reelId);
    if (!reel) return null;

    const deadline = reel.analysis?.details?.dates?.[0] || '2026-11-20';
    const summary = body?.summary || reel.analysis?.summary || `Verified authentic opportunity for "${reel.title}".`;
    const summaryPoints = body?.summary_points?.length > 0 ? body.summary_points : (reel.analysis?.summary_points || []);
    const topics = body?.topics?.length > 0 ? body.topics : (reel.analysis?.tags || ['opportunity', 'verification']);
    const officialUrls = reel.analysis?.sources?.map((s) => s.url).filter(Boolean).length > 0
      ? reel.analysis.sources.map((s) => s.url).filter(Boolean)
      : ['https://opportunity-verified.org', 'https://official-portal.gov.in'];

    const claimChecks = summaryPoints.length > 0
      ? summaryPoints.map((pt, i) => ({
          claim: pt,
          status: 'verified',
          evidence: 'Verified through Gemini API real-time web search and corroborated by official registration domain.',
          source_url: officialUrls[i % officialUrls.length]
        }))
      : topics.map((top, i) => ({
          claim: `Topic "${top}" confirmed in official announcement`,
          status: 'verified',
          evidence: 'Official domain records corroborate this topic and its terms.',
          source_url: officialUrls[i % officialUrls.length]
        }));

    return {
      id: Number(reelId),
      status: 'done',
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      classification: {
        is_opportunity: true,
        category: 'opportunity',
        reason: 'Verified short-form opportunity via Gemini web search.'
      },
      verification: {
        verdict: 'official_confirmed',
        sources_verified: true,
        summary: `Gemini web search verified the correctness of "${reel.title}". Official sources and deadlines confirmed.`,
        official_deadline: deadline,
        official_urls: officialUrls,
        supporting_urls: ['https://news.ycombinator.com', `https://google.com/search?q=${encodeURIComponent(reel.title)}`],
        scam_signals: [],
        guard_notes: ['Verified via Gemini API web search with live web citations.'],
        claim_checks: claimChecks
      },
      report: {
        eligibility: [
          { text: 'Candidates meeting basic prerequisites and submitting required credentials.', source_urls: officialUrls.slice(0, 1) }
        ],
        timeline: [
          { text: `Deadline scheduled for ${deadline}. Early review recommended.`, source_urls: officialUrls.slice(0, 1) }
        ],
        how_to_apply: [
          { text: 'Register via the official link with resume/portfolio.', source_urls: officialUrls.slice(0, 1) }
        ],
        past_editions: [],
        selection_criteria: [
          { text: 'Academic / project merit and alignment with criteria.', source_urls: officialUrls.slice(0, 1) }
        ],
        red_flags: [],
        related_links: officialUrls,
        source_evidence: [
          {
            source_type: 'official_page',
            url: officialUrls[0] || 'https://opportunity-verified.org',
            content: `Official guidelines, verified content, and submission portal for ${reel.title}.`
          }
        ]
      }
    };
  },

  startResearch(reelId, body = {}) {
    const all = getStored(MOCK_STORAGE_KEY_RESEARCH, INITIAL_RESEARCH);
    const result = this.getResearch(reelId, { ...body, forceRefresh: true });
    all[reelId] = result;
    setStored(MOCK_STORAGE_KEY_RESEARCH, all);
    return result;
  },

  getSavedLinks() {
    return getStored(MOCK_STORAGE_KEY_LINKS, INITIAL_LINKS);
  },

  saveLink(reelId, body) {
    const links = this.getSavedLinks();
    const newId = links.length > 0 ? Math.max(...links.map((l) => l.id)) + 1 : 1;
    const newLink = {
      id: newId,
      reel_id: Number(reelId),
      label: body.label || 'Saved link',
      url: body.url,
      created_at: new Date().toISOString()
    };
    const updated = [newLink, ...links];
    setStored(MOCK_STORAGE_KEY_LINKS, updated);
    return newLink;
  },

  deleteSavedLink(linkId) {
    const links = this.getSavedLinks();
    const updated = links.filter((l) => l.id !== Number(linkId));
    setStored(MOCK_STORAGE_KEY_LINKS, updated);
    return true;
  },

  getSavedDates() {
    return getStored(MOCK_STORAGE_KEY_DATES, INITIAL_DATES);
  },

  saveDate(reelId, body) {
    const dates = this.getSavedDates();
    const newId = dates.length > 0 ? Math.max(...dates.map((d) => d.id)) + 1 : 1;
    const newDate = {
      id: newId,
      reel_id: Number(reelId),
      label: body.label || 'Important date',
      event_date: body.event_date,
      created_at: new Date().toISOString()
    };
    const updated = [newDate, ...dates];
    setStored(MOCK_STORAGE_KEY_DATES, updated);
    return newDate;
  },

  deleteSavedDate(dateId) {
    const dates = this.getSavedDates();
    const updated = dates.filter((d) => d.id !== Number(dateId));
    setStored(MOCK_STORAGE_KEY_DATES, updated);
    return true;
  },

  getLinkVaultEntries() {
    return getStored(MOCK_STORAGE_KEY_LINK_VAULT, INITIAL_LINK_VAULT);
  },

  saveLinkVaultEntry(reelId, body) {
    const entries = this.getLinkVaultEntries();
    const existing = entries.find((entry) => entry.reel_id === Number(reelId));
    const entry = {
      id: existing?.id || (entries.length > 0 ? Math.max(...entries.map((item) => item.id)) + 1 : 1),
      reel_id: Number(reelId),
      title: body.title,
      links: body.links || [],
      topics: body.topics || [],
      created_at: existing?.created_at || new Date().toISOString(),
    };
    setStored(MOCK_STORAGE_KEY_LINK_VAULT, [entry, ...entries.filter((item) => item.reel_id !== Number(reelId))]);
    return entry;
  },

  deleteLinkVaultEntry(entryId) {
    setStored(MOCK_STORAGE_KEY_LINK_VAULT, this.getLinkVaultEntries().filter((item) => item.id !== Number(entryId)));
    return true;
  }
};
