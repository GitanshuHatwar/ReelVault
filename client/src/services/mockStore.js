const MOCK_STORAGE_KEY_REELS = 'reelvault_mock_reels';
const MOCK_STORAGE_KEY_RESEARCH = 'reelvault_mock_research';
const MOCK_STORAGE_KEY_LINKS = 'reelvault_mock_links';
const MOCK_STORAGE_KEY_DATES = 'reelvault_mock_dates';

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
      summary: 'Verified official competition and grant. Legitimacy confirmed against official domain DNS and corporate registration records.',
      official_deadline: '2026-11-15',
      official_urls: ['https://aifoundersgrant.org', 'https://aifoundersgrant.org/apply'],
      supporting_urls: ['https://news.ycombinator.com'],
      scam_signals: [],
      guard_notes: ['No upfront registration fees or sensitive payment info required.']
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
      transcript: `Verified transcript for ${cleanUrl}. Detailed program benefits, deadline dates around ${targetDate}, and official links are provided in the caption. Apply directly at https://opportunity-${newId}.org/apply`,
      caption: `Check out this verified opportunity! Save for later. Apply before ${targetDate}.`,
      created_at: now,
      cached: true,
      analysis: {
        summary: `Automated summary for saved ${platform} post. Application deadline verified near ${targetDate}.`,
        english_transcript: `Verified transcript for ${cleanUrl}. Detailed program benefits, deadline dates around ${targetDate}, and official links are provided in the caption.`,
        summary_points: [
          `Opportunity verified from ${platform} short-form media.`,
          `Application period active with deadline around ${targetDate}.`,
          `Eligible candidates should submit application materials promptly.`
        ],
        tags: [platform, 'opportunity', 'verified', 'prototyping'],
        sources: [
          { name: `Official Portal #${newId}`, url: `https://opportunity-${newId}.org/apply` }
        ],
        details: {
          dates: [targetDate],
          books: [],
          people: [],
          competitions: [`Opportunity Challenge ${newId}`]
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
    return true;
  },

  getResearch(reelId) {
    const all = getStored(MOCK_STORAGE_KEY_RESEARCH, INITIAL_RESEARCH);
    if (all[reelId]) return all[reelId];

    const reel = this.getReel(reelId);
    if (!reel) return null;

    const deadline = reel.analysis?.details?.dates?.[0] || '2026-11-20';
    return {
      id: Number(reelId),
      status: 'done',
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      classification: {
        is_opportunity: true,
        category: 'opportunity',
        reason: 'Verified short-form opportunity'
      },
      verification: {
        verdict: 'official_confirmed',
        summary: `Verified authentic opportunity for "${reel.title}". Requirements and dates cross-referenced.`,
        official_deadline: deadline,
        official_urls: reel.analysis?.sources?.map((s) => s.url).filter(Boolean) || ['https://opportunity-verified.org'],
        supporting_urls: [],
        scam_signals: [],
        guard_notes: ['Prototyping mock: verified safely.']
      },
      report: {
        eligibility: [
          { text: 'Candidates meeting basic prerequisites and submitting required credentials.', source_urls: [] }
        ],
        timeline: [
          { text: `Deadline scheduled for ${deadline}. Early review recommended.`, source_urls: [] }
        ],
        how_to_apply: [
          { text: 'Register via the official link with resume/portfolio.', source_urls: [] }
        ],
        past_editions: [],
        selection_criteria: [
          { text: 'Academic / project merit and alignment with criteria.', source_urls: [] }
        ],
        red_flags: [],
        related_links: reel.analysis?.sources?.map((s) => s.url).filter(Boolean) || [],
        source_evidence: [
          {
            source_type: 'official_page',
            url: reel.analysis?.sources?.[0]?.url || 'https://opportunity-verified.org',
            content: `Official guidelines and submission portal for ${reel.title}.`
          }
        ]
      }
    };
  },

  startResearch(reelId) {
    const all = getStored(MOCK_STORAGE_KEY_RESEARCH, INITIAL_RESEARCH);
    const result = this.getResearch(reelId);
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
  }
};
