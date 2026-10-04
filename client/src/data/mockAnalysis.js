export const mockAnalysis = {
  id: 'mock-analysis-1',
  sourceUrl: 'https://www.instagram.com/reel/C8...xyz',
  opportunity: 'AICTE Pragati Scholarship',
  organization: 'AICTE',
  category: 'Scholarship',
  lastChecked: 'Just now',
  overallVerdict: 'PARTIALLY SUPPORTED',
  
  summary: {
    description: 'AICTE Pragati is a scholarship scheme supporting eligible female students pursuing technical education (degree or diploma) in AICTE approved institutions.',
    forWhom: 'Eligible female students in technical degree/diploma programs',
    status: 'Applications close 31 December 2026 (Demo Data)'
  },
  
  claims: [
    {
      id: 'c1',
      originalClaim: 'Students receive ₹80,000 every year.',
      verdict: 'PARTIALLY SUPPORTED',
      evidence: 'The official AICTE guidelines state the scholarship amount is ₹50,000 per annum, not ₹80,000.',
      correctedInformation: '₹50,000 per year for every year of study.',
      source: {
        name: 'Official AICTE Guidelines',
        url: '#',
        type: 'OFFICIAL SOURCE'
      }
    },
    {
      id: 'c2',
      originalClaim: 'Every girl who passed Class 12 can apply.',
      verdict: 'CONTRADICTED',
      evidence: 'Eligibility is restricted to girls admitted to a first-year degree/diploma program (or second-year lateral entry) in an AICTE approved institution. Additionally, family income must be less than ₹8 Lakh per annum.',
      correctedInformation: 'Must be enrolled in 1st year of technical degree/diploma with family income < ₹8 Lakh.',
      source: {
        name: 'AICTE Pragati Portal',
        url: '#',
        type: 'OFFICIAL SOURCE'
      }
    },
    {
      id: 'c3',
      originalClaim: 'Applications close on 31 October.',
      verdict: 'SUPPORTED',
      evidence: 'The National Scholarship Portal (NSP) confirms the closing date for Pragati scheme applications is 31 October.',
      source: {
        name: 'National Scholarship Portal',
        url: '#',
        type: 'GOVERNMENT'
      }
    },
    {
      id: 'c4',
      originalClaim: 'Selection is guaranteed for all applicants.',
      verdict: 'INSUFFICIENT EVIDENCE',
      evidence: 'We couldn\'t find authoritative evidence supporting or contradicting this claim. Typically, scholarships are merit or quota based.',
      source: {
        name: 'AICTE FAQ',
        url: '#',
        type: 'OFFICIAL SOURCE'
      }
    }
  ],

  verifiedDetails: {
    opportunity: 'AICTE Pragati Scholarship',
    organization: 'All India Council for Technical Education (AICTE)',
    category: 'Scholarship',
    eligibility: 'Girls admitted to 1st year of Degree/Diploma course or 2nd year through lateral entry. Max 2 girls per family. Family income < ₹8 Lakh/annum.',
    benefit: '₹50,000 per annum for every year of study.',
    deadline: '2026-12-31',
    requiredDocuments: ['Aadhaar Card', '10th & 12th Marksheets', 'Income Certificate', 'Bank Passbook', 'Admission Letter'],
    applicationProcess: 'Apply online through the National Scholarship Portal (NSP). Institute verification is required.',
    officialUrl: '#'
  },

  riskSignals: [
    {
      level: 'SAFE', // 'SAFE' or 'POTENTIAL RISK'
      message: 'No major scam signals detected in the claims checked.',
      description: 'The opportunity is real and verified through official government sources. Always apply directly through the official National Scholarship Portal.'
    }
  ]
};
