import { mockProfile } from './data/mock/profile'

const skillAliases = [
  { label: 'Python', aliases: ['python'] },
  { label: 'DSA', aliases: ['dsa', 'data structures', 'algorithms'] },
  { label: 'NLP', aliases: ['nlp', 'natural language processing'] },
  { label: 'Machine Learning', aliases: ['machine learning', 'ml'] },
]

function findSkill(text, aliases) {
  return aliases.some((alias) => text.includes(alias))
}

function extractProfile(message, currentProfile) {
  const text = message.toLowerCase()
  const nextProfile = {
    ...currentProfile,
    skills: [...currentProfile.skills],
    interests: [...currentProfile.interests],
    experience: [...currentProfile.experience],
  }
  const changes = []

  const academicMatch = text.match(/(?:third|3rd|first|1st|second|2nd|fourth|4th)[- ]year\s+([a-z][a-z ]+?)(?: student| major| interested|\.|,|$)/i)
  if (academicMatch) {
    const year = academicMatch[0].match(/(?:third|3rd|first|1st|second|2nd|fourth|4th)[- ]year/i)?.[0]
      .replace(/first|1st/i, '1st')
      .replace(/second|2nd/i, '2nd')
      .replace(/third|3rd/i, '3rd')
      .replace(/fourth|4th/i, '4th')
    const field = academicMatch[1].trim().replace(/\s+/g, ' ')
    const academic = `${field.replace(/\b\w/g, (letter) => letter.toUpperCase())} · ${year}`
    if (academic !== currentProfile.academic) nextProfile.academic = academic
  }

  skillAliases.forEach(({ label, aliases }) => {
    if (!findSkill(text, aliases)) return
    const existing = currentProfile.skills.find((skill) => skill.label === label)
    const mentionsNlpInterest = label === 'NLP' && /interested in (?:nlp|natural language processing)/i.test(text)
    const explicitlyRatesNlp = /(?:nlp|natural language processing).{0,35}(?:beginner|intermediate|comfortable|proficient)|(?:beginner|intermediate|comfortable|proficient).{0,35}(?:nlp|natural language processing)/i.test(text)
    const saysIntermediate = /intermediate|comfortable|proficient|strong/i.test(text) && (!mentionsNlpInterest || explicitlyRatesNlp)
    const level = saysIntermediate ? 'Intermediate' : existing?.level || 'Beginner'
    if (!existing) {
      nextProfile.skills.push({ label, level })
      changes.push({ type: 'added', label, value: level })
    } else if (existing.level !== level && saysIntermediate) {
      nextProfile.skills = nextProfile.skills.map((skill) =>
        skill.label === label ? { ...skill, level } : skill,
      )
      changes.push({ type: 'changed', label, from: existing.level, to: level })
    }
  })

  if (findSkill(text, ['nlp', 'natural language processing'])) {
    if (!nextProfile.interests.includes('Natural Language Processing')) {
      nextProfile.interests.push('Natural Language Processing')
      changes.push({ type: 'added', label: 'Natural Language Processing' })
    }
  }
  if (findSkill(text, ['ai', 'artificial intelligence', 'machine learning', 'ml'])) {
    if (!nextProfile.interests.includes('AI / Machine Learning')) {
      nextProfile.interests.push('AI / Machine Learning')
      changes.push({ type: 'added', label: 'AI / Machine Learning' })
    }
  }

  const availabilityMatch = text.match(/(?:around|about|roughly|can spend|spend)\s+(\d+)\s*(?:hours?|hrs?)(?:\s+a|\s*\/| per)\s*week/i)
  if (availabilityMatch) {
    const availability = `${availabilityMatch[1]} hrs / week`
    if (availability !== currentProfile.availability) {
      nextProfile.availability = availability
      changes.push({ type: 'changed', label: 'Weekly availability', to: availability })
    }
  }

  return { profile: nextProfile, changes }
}

function createReply(message, profile, changes) {
  const text = message.toLowerCase()
  const hasProfileDetails = profile.academic || profile.skills.length || profile.interests.length || profile.availability

  if (changes.some((change) => change.type === 'changed' && change.label === 'NLP')) {
    return "Got it. I've updated your profile. NLP is now marked as intermediate."
  }
  if (hasProfileDetails && changes.length > 0) {
    const captured = []
    if (profile.academic) captured.push('your academic background')
    if (profile.skills.length) captured.push('your skills')
    if (profile.interests.length) captured.push('your interests')
    if (profile.availability) captured.push('your weekly availability')
    return `Got it. I've started building your research profile. I've captured ${captured.join(', ')}.`
  }
  if (/interested|curious|explore|direction/i.test(text)) {
    return 'Tell me what you have worked on so far, and I will connect it with the research directions that interest you.'
  }
  return 'Tell me a little more about your academic background, skills, interests, or the time you can make for research.'
}

export function createEmptyProfile() {
  return { ...mockProfile, skills: [], interests: [], experience: [] }
}

export function mockGenieResponse(message, currentProfile) {
  const { profile, changes } = extractProfile(message, currentProfile)
  return {
    message: createReply(message, profile, changes),
    profile,
    changes,
  }
}
