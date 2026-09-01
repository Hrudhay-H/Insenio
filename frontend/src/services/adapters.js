// Maps backend API response shapes (snake_case, from the FastAPI/Databricks
// backend) onto the internal shapes the existing UI components already
// expect (id, name, researchAreas, readiness, etc.) — so components/JSX/CSS
// never have to change, only where their data comes from.

import labHeroImage from '../assets/hero.png';

const PROFICIENCY_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export function formatRelativeDate(isoString) {
  if (!isoString) return 'recently';
  const normalized = isoString.includes('T') ? isoString : isoString.replace(' ', 'T');
  const then = new Date(normalized.endsWith('Z') || normalized.includes('+') ? normalized : `${normalized}Z`);
  if (Number.isNaN(then.getTime())) return 'recently';
  const diffDays = Math.floor((Date.now() - then.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths <= 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears <= 1 ? '1 year ago' : `${diffYears} years ago`;
}

function fitLabel(ratio) {
  if (ratio === undefined || ratio === null) return null;
  if (ratio >= 0.9) return 'Excellent';
  if (ratio >= 0.6) return 'Strong';
  if (ratio > 0) return 'Some';
  return 'Limited';
}

function titleCase(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

// lab: LabOut from /labs, /labs/:id, /labs/saved/list (may be omitted when
// mapping a bare match result before the full lab record is available).
// match: LabMatchOut from /matches (may be omitted for an unauthenticated
// browse or a lab with no computed match).
export function mapLab(lab, match) {
  if (!lab && !match) return null;
  const labId = lab?.lab_id || match?.lab_id;
  const requiredSkills = (lab?.required_skills || []).map((s) => ({ name: s.skill_name, depth: s.depth }));
  const missingSkills = match?.missing_skills || [];
  const gaps = missingSkills.map((g) => `${g.skill_name} · ${titleCase(g.required_depth)}`);
  const areaTags = [lab?.department].filter(Boolean);
  const piName = lab?.pi_name || match?.pi_name;

  return {
    id: labId,
    name: lab?.lab_name || match?.lab_name,
    piName,
    institution: [lab?.department, piName].filter(Boolean).join(' · '),
    researchAreas: areaTags.length ? areaTags : ['Research'],
    researchFocus: lab?.research_focus || match?.research_focus || '',
    image: labHeroImage,
    readiness: match?.label ?? null,
    why: (match?.reasons || []).join(' ') || lab?.research_focus || match?.research_focus || '',
    gaps,
    skillFit: match ? (missingSkills.length === 0 ? 'Match' : `${missingSkills.length} gap${missingSkills.length > 1 ? 's' : ''}`) : '—',
    interestFit: match ? fitLabel(match.interest_alignment_score) || '—' : '—',
    availabilityFit: match ? (match.availability_fits ? 'Fits' : 'Tight') : '—',
    updatedAt: formatRelativeDate(lab?.last_updated || match?.last_updated),
    timeCommitmentHrs: lab?.time_commitment_hrs ?? match?.time_commitment_hrs ?? null,
    capacity: lab?.capacity ?? match?.capacity ?? null,
    currentTeamSize: lab?.current_team_size ?? match?.current_team_size ?? null,
    recentPublications: lab?.recent_publications || null,
    teamComposition: lab?.team_composition || null,
    websiteUrl: lab?.website_url || null,
    applicationProcessText: lab?.application_process_text || null,
    applicationQuestions: lab?.application_questions || [],
    reliabilityScore: lab?.reliability_score ?? match?.reliability_score ?? null,
    requiredSkills,
    matchedSkills: match?.matched_skills || [],
    missingSkills,
    matchReasons: match?.reasons || [],
    saved: !!lab?.saved,
  };
}

// apiProfile: StudentProfileOut from /students/me or the intake chat response.
export function mapProfile(apiProfile) {
  if (!apiProfile) return createUiEmptyProfile();
  const skills = (apiProfile.skills || []).map((s) => ({
    label: s.skill_name,
    level: PROFICIENCY_LABEL[s.proficiency] || titleCase(s.proficiency),
  }));
  return {
    studentId: apiProfile.student_id || null,
    name: apiProfile.display_name || 'Student',
    academic: apiProfile.major || '',
    academicYear: apiProfile.academic_year || '',
    skills,
    interests: apiProfile.interest_tags || [],
    interestDescription: apiProfile.interests_text || '',
    availability: apiProfile.availability_hrs ? `${apiProfile.availability_hrs} hrs / week` : '',
    availabilityHrs: apiProfile.availability_hrs ?? null,
    portfolioUrl: apiProfile.portfolio_url || '',
    experienceText: apiProfile.experience_text || '',
    lastUpdated: formatRelativeDate(apiProfile.last_updated),
  };
}

export function createUiEmptyProfile() {
  return {
    studentId: null,
    name: '',
    academic: '',
    academicYear: '',
    skills: [],
    interests: [],
    interestDescription: '',
    availability: '',
    availabilityHrs: null,
    portfolioUrl: '',
    experienceText: '',
    lastUpdated: '',
  };
}

// Compares two UI-shaped profiles (see mapProfile) and produces the same
// { type, label, from, to } change entries the chat UI's ProfileSummary
// already knows how to render, so a real intake-chat turn can drive the
// existing "what changed" highlight without any JSX changes.
export function diffProfiles(before, after) {
  const changes = [];
  const beforeSkills = new Map(before.skills.map((s) => [s.label, s.level]));
  after.skills.forEach((skill) => {
    const prevLevel = beforeSkills.get(skill.label);
    if (prevLevel === undefined) changes.push({ type: 'added', label: skill.label, value: skill.level });
    else if (prevLevel !== skill.level) changes.push({ type: 'changed', label: skill.label, from: prevLevel, to: skill.level });
  });
  after.interests.forEach((interest) => {
    if (!before.interests.includes(interest)) changes.push({ type: 'added', label: interest });
  });
  if (after.academic && before.academic !== after.academic) {
    changes.push({ type: 'changed', label: 'Academic background', from: before.academic || '—', to: after.academic });
  }
  if (after.availability && before.availability !== after.availability) {
    changes.push({ type: 'changed', label: 'Weekly availability', from: before.availability || '—', to: after.availability });
  }
  return changes;
}
