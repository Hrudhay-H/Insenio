import { useEffect, useRef, useState } from 'react'
import { sendMessage as sendGenieMessage, uploadResume } from './services/genieService'
import { labService } from './services/labService'
import { savedLabService } from './services/savedLabService'
import { profileService } from './services/profileService'
import { applyAssistService } from './services/applyAssistService'
import { mapLab, mapProfile, createUiEmptyProfile, diffProfiles } from './services/adapters'
import './DashboardApp.css'

const starterPrompts = [
  'Tell Genie about my skills',
  'Help me find my research direction',
  'Build my research profile',
]

const railItems = [
  { id: 'genie', label: 'AI Chat', icon: '✦' },
  { id: 'marketplace', label: 'Marketplace', icon: '⌘' },
  { id: 'profile', label: 'Profile', icon: '◉' },
]

const createConversation = (id = `conversation-${Date.now()}`) => ({
  id,
  title: 'New conversation',
  messages: [],
  profile: createUiEmptyProfile(),
  changes: [],
})

function GenieMark({ small = false }) {
  return <span className={`genie-mark ${small ? 'small' : ''}`} aria-hidden="true"><span className="genie-core" /></span>
}

function initials(name) {
  if (!name) return '—'
  return name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function Message({ message, studentInitials }) {
  return <article className={`message-row ${message.role}`}>
    {message.role === 'genie' ? <GenieMark small /> : <span className="student-avatar">{studentInitials}</span>}
    <div className="message-content"><p>{message.text}</p></div>
  </article>
}

function ProfileSummary({ profile, changes }) {
  const hasProfile = profile.academic || profile.skills.length || profile.interests.length || profile.availability
  if (!hasProfile) return null
  const changedSkill = changes.find((change) => change.type === 'changed' && change.label === 'NLP')

  return <section className={`profile-summary ${changedSkill ? 'profile-changed' : ''}`} aria-label="Research profile summary">
    <div className="profile-heading">{changedSkill ? 'Profile updated' : 'What I understood'}</div>
    {changedSkill && <div className="profile-change"><strong>{changedSkill.label}</strong><span>{changedSkill.from} <b>-&gt;</b> {changedSkill.to}</span></div>}
    <div className="profile-fields">
      {profile.academic && <div><span>Academic</span><p>{profile.academic}</p></div>}
      {profile.skills.length > 0 && <div><span>Skills</span><p>{profile.skills.map((skill) => `${skill.label} · ${skill.level}`).join('\n')}</p></div>}
      {profile.interests.length > 0 && <div><span>Interests</span><p>{profile.interests.join('\n')}</p></div>}
      {profile.availability && <div><span>Availability</span><p>{profile.availability}</p></div>}
    </div>
    {changedSkill && <div className="profile-footnote">Your profile is up to date.</div>}
  </section>
}

function FitBreakdown({ lab }) {
  return <div className="fit-breakdown">
    <div><span>Skills</span><strong>{lab.skillFit === '1 gap' ? '△' : '✓'} {lab.skillFit}</strong></div>
    <div><span>Interest</span><strong>✓ {lab.interestFit}</strong></div>
    <div><span>Availability</span><strong>✓ {lab.availabilityFit}</strong></div>
  </div>
}

function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const choose = (option) => {
    onChange(option)
    setOpen(false)
  }

  return <div className="dropdown" ref={dropdownRef}>
    <button type="button" className={`dropdown-trigger ${open ? 'open' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span>{label && <small>{label}</small>}{value}</span><b aria-hidden="true">⌄</b>
    </button>
    {open && <div className="dropdown-menu" role="listbox" aria-label={label}>
      {options.map((option) => <button type="button" role="option" aria-selected={option === value} className={option === value ? 'selected' : ''} key={option} onClick={() => choose(option)}>{option}<span>{option === value ? '✓' : ''}</span></button>)}
    </div>}
  </div>
}

function LabCard({ lab, onOpen, isSaved, onToggleSave, index }) {
  const [expanded, setExpanded] = useState(false)

  return <article className={`lab-card ${lab.readiness === 'Ready now' ? 'ready' : 'stretch'} ${expanded ? 'expanded' : ''}`}>
    <div className="lab-image-wrap"><img src={lab.image} alt="" className="lab-image" loading="lazy" /></div>
    <div className="lab-card-content"><div className="lab-card-top"><span className="lab-index">LAB / {String(index + 1).padStart(2, '0')}</span><div className="card-meta-actions"><span className="readiness">{lab.readiness}</span><button type="button" className={`save-lab-btn ${isSaved ? 'saved' : ''}`} onClick={(event) => { event.stopPropagation(); onToggleSave(lab.id) }} aria-label={isSaved ? `Remove ${lab.name} from saved labs` : `Save ${lab.name}`} title={isSaved ? 'Remove from saved' : 'Save lab'}>{isSaved ? '★' : '☆'}</button></div></div>
      <h3>{lab.name}</h3>
      <p className="institution">{lab.institution}</p>
      <div className="area-list">{lab.researchAreas.map((area) => <span key={area}>{area}</span>)}</div>
      <button type="button" className="expand-card-btn" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${lab.name} details`}><span>{expanded ? 'Show less' : 'More about this fit'}</span><b aria-hidden="true">↓</b></button>
      <div className="card-details"><div className="card-details-inner">
        <div className="why-fit"><span>Why this fits you</span><p>{lab.why}</p></div>
        <FitBreakdown lab={lab} />
        {lab.gaps.length > 0 && <div className="gap-note"><span>One bridgeable gap</span><strong>{lab.gaps[0]}</strong></div>}
        <div className="lab-card-footer"><span>Updated {lab.updatedAt}</span><button type="button" onClick={() => onOpen(lab.id)}>Explore opportunity <b>→</b></button></div>
      </div></div>
    </div>
  </article>
}

function Marketplace({ onOpenLab, marketplaceView, onNavigateSection, savedIds, onToggleSave, labs, recommendedLabs, profile }) {
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('All areas')
  const [readiness, setReadiness] = useState('All readiness')
  const [sort, setSort] = useState('Recommended')
  const areas = ['All areas', ...Array.from(new Set(labs.map((lab) => lab.researchAreas[0]).filter(Boolean))).sort()]
  const filteredLabs = labs.filter((lab) => {
    const searchable = `${lab.name} ${lab.institution} ${lab.researchAreas.join(' ')}`.toLowerCase()
    const matchesQuery = searchable.includes(query.toLowerCase())
    const matchesArea = area === 'All areas' || lab.researchAreas.includes(area)
    const matchesReadiness = readiness === 'All readiness' || lab.readiness === readiness
    return matchesQuery && matchesArea && matchesReadiness
  }).sort((first, second) => {
    if (sort === 'Alphabetical') return first.name.localeCompare(second.name)
    if (sort === 'Recently updated') return first.updatedAt.localeCompare(second.updatedAt)
    return labs.indexOf(first) - labs.indexOf(second)
  })
  const savedLabs = labs.filter((lab) => savedIds.includes(lab.id))

  const toggleSaved = (id) => {
    onToggleSave(id)
  }
  const clearFilters = () => { setQuery(''); setArea('All areas'); setReadiness('All readiness'); setSort('Recommended') }
  const exploreLabs = filteredLabs
  const config = {
    recommended: ['RECOMMENDED FOR YOU', `Recommended for ${profile.name || 'you'}`, 'Based on your current profile'],
    explore: ['EXPLORE LABS', 'Discover research opportunities', 'Browse the wider research ecosystem.'],
    saved: ['SAVED LABS', 'Research opportunities for later', 'Keep the opportunities you want to revisit.'],
  }[marketplaceView]
  const visibleLabs = marketplaceView === 'recommended' ? recommendedLabs : marketplaceView === 'saved' ? savedLabs : exploreLabs

  return <div className="marketplace-page">
    <header className="marketplace-header">
      <div><span className="eyebrow">INSENIO MARKETPLACE</span><h1>Research opportunities</h1><p>Research opportunities selected around your interests, skills, and availability.</p></div>
      <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search labs..." aria-label="Search labs" /></label>
    </header>
    <section className={`marketplace-section ${marketplaceView}-view`}><div className="section-heading"><div><span className="eyebrow">{config[0]}</span><h2>{config[1]}</h2><p>{config[2]}</p></div><span className="result-count">{visibleLabs.length} {marketplaceView === 'saved' ? 'saved' : 'opportunities'}</span></div>
      {marketplaceView === 'explore' && <div className="marketplace-toolbar"><div className="filter-row"><Dropdown label="Research area" value={area} options={areas} onChange={setArea} /><Dropdown label="Readiness" value={readiness} options={['All readiness', 'Ready now', 'Stretch pick']} onChange={setReadiness} /></div><div className="sort-control"><Dropdown label="Sort" value={sort} options={['Recommended', 'Best fit', 'Recently updated', 'Alphabetical']} onChange={setSort} /></div></div>}
      {visibleLabs.length > 0 ? <div className="lab-grid">{visibleLabs.map((lab, index) => <LabCard key={lab.id} lab={lab} index={index} onOpen={onOpenLab} isSaved={savedIds.includes(lab.id)} onToggleSave={toggleSaved} />)}</div> : <div className="empty-marketplace"><h3>{marketplaceView === 'saved' ? 'No saved labs yet.' : 'No labs match these filters.'}</h3><p>{marketplaceView === 'saved' ? 'Save a lab while exploring and it’ll appear here.' : 'Try broadening your filters or exploring all opportunities.'}</p>{marketplaceView === 'saved' ? <button type="button" onClick={() => onNavigateSection('explore')}>Explore labs →</button> : <button type="button" onClick={clearFilters}>Clear filters →</button>}</div>}
    </section>
  </div>
}

function AppRail({ view, onNavigate, sidebarCollapsed, onToggleSidebar }) {
  return <nav className="app-rail" aria-label="Primary navigation">
    <div className="rail-brand"><GenieMark /></div>
    <div className="rail-items">{railItems.map((item) => <button type="button" key={item.id} className={`rail-item ${view === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)} aria-label={item.label} title={item.label}><span>{item.icon}</span></button>)}</div>
    <button type="button" className="rail-toggle" onClick={onToggleSidebar} aria-label={sidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{sidebarCollapsed ? '→' : '←'}</button>
  </nav>
}

function MarketplaceSidebar({ onNavigate, collapsed, onToggle, activeSection, onSection, profile }) {
  const topic = profile.interests?.[0] || 'Research interests'
  const highlightSkill = profile.skills?.[0]?.label || 'Research'

  return <aside className={`marketplace-sidebar ${collapsed ? 'collapsed' : ''}`}>
    <div className="market-brand"><GenieMark /><span>INSENIO</span><button type="button" className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}>{collapsed ? '→' : '←'}</button></div>
    <div className="market-nav"><span className="market-nav-label">Discover</span><button type="button" className={`market-nav-item ${activeSection === 'recommended' ? 'active' : ''}`} onClick={() => onSection('recommended')}><span>✦</span> Recommended</button><button type="button" className={`market-nav-item ${activeSection === 'explore' ? 'active' : ''}`} onClick={() => onSection('explore')}><span>⌕</span> Explore labs</button><button type="button" className={`market-nav-item ${activeSection === 'saved' ? 'active' : ''}`} onClick={() => onSection('saved')}><span>♡</span> Saved</button></div>
  </aside>
}

function ProfilePage({ profile, _onEdit, _onNavigate, onBack }) {
  const skillItems = Array.isArray(profile.skills) && profile.skills.length
    ? profile.skills.map((skill) => ({ name: skill.label || skill, level: skill.level || 'Intermediate' }))
    : [{ name: 'Research', level: 'Intermediate' }, { name: 'Python', level: 'Intermediate' }, { name: 'DSA', level: 'Intermediate' }]

  const interestText = profile.interestDescription || "I'm interested in exploring AI systems, human-centered computing, and practical applications of machine learning."
  const interests = Array.isArray(profile.interests) && profile.interests.length ? profile.interests : ['AI / ML', 'NLP', 'Research']
  const lastUpdated = profile.lastUpdated || 'Recently'

  return <div className="profile-page">
    <header className="profile-page-header">
      <div>
        <button type="button" className="lab-back-btn" onClick={onBack}>← Back to Marketplace</button>
        <span className="eyebrow">INSENIO PROFILE</span>
        <h1>Your research identity</h1>
      </div>
      <button type="button" className="profile-edit-btn">Edit Profile</button>
    </header>

    <div className="profile-layout">
      <aside className="profile-identity-card">
        <div className="profile-avatar">{initials(profile.name)}</div>
        <h2>{profile.name}</h2>
        <p className="profile-student-id">Student ID · {profile.studentId}</p>
        <div className="identity-divider" />
        <div className="identity-meta">
          <strong>{profile.academic}</strong>
          <span>{profile.academicYear}</span>
        </div>
      </aside>

      <main className="profile-details">
        <section className="profile-section">
          <span className="eyebrow">Academics</span>
          <div className="profile-grid">
            <div><span>Major</span><strong>{profile.academic}</strong></div>
            <div><span>Academic year</span><strong>{profile.academicYear}</strong></div>
            <div><span>Student ID</span><strong>{profile.studentId}</strong></div>
          </div>
        </section>

        <section className="profile-section">
          <span className="eyebrow">Skills</span>
          <div className="skill-list">
            {skillItems.map((skill) => <div className="skill-row" key={`${skill.name}-${skill.level}`}><strong>{skill.name}</strong><span>{skill.level}</span></div>)}
          </div>
        </section>

        <section className="profile-section">
          <span className="eyebrow">Interests</span>
          <p className="interest-description">{interestText}</p>
          <div className="interest-list">{interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
        </section>

        <section className="profile-section profile-meta-grid">
          <div>
            <span className="eyebrow">Availability</span>
            <strong>{profile.availability}</strong>
          </div>
          <div>
            <span className="eyebrow">Last updated</span>
            <strong>{lastUpdated}</strong>
          </div>
        </section>

        <section className="profile-status-card">
          <div className="status-copy">
            <span className="eyebrow">Profile completeness</span>
            <strong>Profile taking shape</strong>
          </div>
          <div className="profile-progress"><span /></div>
        </section>
      </main>
    </div>
  </div>
}

function getRouteState() {
  const path = window.location.pathname
  const rel = path.startsWith('/dashboard') ? path.slice('/dashboard'.length) || '/' : path
  if (rel === '/' || rel === '') return { view: 'genie', labId: null }
  if (rel === '/profile') return { view: 'profile', labId: null }
  const labMatch = rel.match(/^\/labs\/([^/]+)(?:\/(build|apply))?$/)
  if (labMatch) {
    const [, labId, subpage] = labMatch
    if (subpage === 'build') return { view: 'lab-build', labId }
    if (subpage === 'apply') return { view: 'lab-apply', labId }
    return { view: 'lab-detail', labId }
  }
  const route = rel.split('/').pop()
  if (['explore', 'saved', 'recommended'].includes(route)) return { view: 'marketplace', labId: null }
  return { view: 'genie', labId: null }
}

function LabDetailPage({ lab, profile, onBack, onSave, onBuild, onReachOut, isSaved }) {
  if (!lab) return null

  const labInstitution = lab.institution?.split(' · ')[0] || 'Research lab'
  const labMode = lab.institution?.includes('Remote-friendly') ? 'Remote-friendly' : lab.institution?.includes('Hybrid') ? 'Hybrid' : lab.institution?.includes('On campus') ? 'On campus' : 'Research environment'
  const readinessText = lab.readiness === 'Ready now' ? 'Ready now' : 'Stretch pick'
  const skillMap = new Map((profile.skills || []).map((skill) => [skill.label || skill, skill.level || 'Intermediate']))
  const skillRows = lab.requiredSkills.map((req) => ({
    name: req.name,
    you: skillMap.get(req.name) || 'Not in profile',
    lab: req.depth.charAt(0).toUpperCase() + req.depth.slice(1),
    state: lab.matchedSkills.includes(req.name) ? 'Meets' : skillMap.has(req.name) ? 'Meets' : 'Gap',
  }))
  const buildingGap = lab.gaps && lab.gaps[0] ? lab.gaps[0].split(' · ')[0] : (skillRows.find((row) => row.state === 'Gap')?.name || lab.requiredSkills[0]?.name || 'a required skill')
  const focusTags = lab.researchAreas || []

  return <div className="lab-detail-page">
    <div className="lab-detail-header">
      <button type="button" className="lab-back-btn" onClick={onBack}>← Back to marketplace</button>
      <div className="lab-header-content">
        <div className="lab-header-image-wrap"><img src={lab.image} alt="" className="lab-header-image" /></div>
        <div className="lab-header-copy">
          <span className={`lab-readiness-badge ${readinessText === 'Ready now' ? 'ready' : 'stretch'}`}>{readinessText}</span>
          <h1>{lab.name}</h1>
          <p className="lab-subtitle">{labInstitution} · {labMode}</p>
          <div className="lab-focus-row">{focusTags.map((tag) => <span key={tag} className="lab-focus-pill">{tag}</span>)}</div>
        </div>
      </div>
    </div>

    <div className="lab-detail-body">
      <section className="lab-card-panel">
        <h2>Why this lab fits you</h2>
        <div className="fit-grid">
          <div><span>Skills</span><strong>{lab.gaps.length === 0 ? '✓ Strong' : `△ ${lab.gaps.length} gap${lab.gaps.length > 1 ? 's' : ''}`}</strong></div>
          <div><span>Interest</span><strong>{lab.interestFit !== '—' ? `✓ ${lab.interestFit}` : '—'}</strong></div>
          <div><span>Availability</span><strong>{lab.availabilityFit === 'Fits' ? '✓ Fits' : lab.availabilityFit === 'Tight' ? '△ Tight' : '—'}</strong></div>
        </div>
        <p>{lab.why}</p>
      </section>

      <section className="lab-card-panel">
        <h2>Your skills</h2>
        <div className="skill-compare">
          <div className="compare-heading"><span>Your skills</span><span>Lab expects</span></div>
          {skillRows.map((row) => <div className="compare-row" key={row.name}><div className="compare-label"><strong>{row.name}</strong><span>You: {row.you}</span></div><div className="compare-lab"><span>{row.lab}</span><strong>{row.state}</strong></div></div>)}
        </div>
      </section>

      <section className="lab-card-panel">
        <h2>Interest alignment</h2>
        <p>Your interest in {profile.interests?.[0] || 'research'} and practical machine learning aligns strongly with this lab’s focus in {lab.researchAreas[0] || 'applied research'}.</p>
      </section>

      <section className="lab-card-panel compact-grid">
        <div>
          <h2>Your availability</h2>
          <p>{profile.availability}</p>
        </div>
        <div>
          <h2>Lab commitment</h2>
          <p>{lab.timeCommitmentHrs} hrs / week</p>
        </div>
      </section>

      <section className="lab-card-panel gap-panel">
        <h2>One bridgeable gap</h2>
        <div className="gap-header">
          <span>{buildingGap}</span>
          <strong>{lab.gaps?.[0] || 'Need a practical bridge to sharpen your foundation'}</strong>
        </div>
        <p>You have strong interest alignment and compatible availability. The main thing holding you back is your current {buildingGap} proficiency.</p>
      </section>

      <section className="lab-card-panel">
        <h2>Lab expects</h2>
        <div className="requirement-list">
          {lab.requiredSkills.map((req) => <span key={req.name}>{req.name} · {req.depth.charAt(0).toUpperCase() + req.depth.slice(1)}</span>)}
          <span>{lab.timeCommitmentHrs} hrs / week</span>
        </div>
      </section>

      <div className="lab-action-row">
        <button type="button" className="primary-action" onClick={lab.readiness === 'Ready now' ? onReachOut : onBuild}>{lab.readiness === 'Ready now' ? 'Reach out with Genie →' : 'Build toward this lab →'}</button>
        <button type="button" className="secondary-action" onClick={onSave}>{isSaved ? 'Saved' : 'Save lab'}</button>
      </div>
    </div>
  </div>
}

function LabBuildPage({ lab, profile, onBack, onSave, isSaved }) {
  if (!lab) return null

  const gapName = lab.gaps && lab.gaps[0] ? lab.gaps[0].split(' · ')[0] : 'NLP'
  const resources = [
    { title: 'NLP Fundamentals', copy: 'Build the foundation needed to reach the lab\'s intermediate NLP expectation.', action: 'Explore resource →' },
    { title: 'Text Classification', copy: 'Relevant because this lab works with applied language modeling and decision-making workflows.', action: 'Explore resource →' },
    { title: 'Transformers', copy: 'Useful for moving from a beginner foundation to the lab\'s practical research expectations.', action: 'Explore resource →' },
  ]

  return <div className="lab-detail-page build-page">
    <div className="lab-detail-header compact-header">
      <button type="button" className="lab-back-btn" onClick={onBack}>← Back</button>
      <div className="lab-header-copy build-copy">
        <span className="lab-page-kicker">Build toward this lab</span>
        <h1>{lab.name}</h1>
      </div>
    </div>

    <div className="lab-detail-body">
      <section className="lab-card-panel">
        <h2>Your current level</h2>
        <div className="level-stack">
          <div><span>{gapName}</span><strong>{profile.skills?.find((skill) => (skill.label || skill).toLowerCase().includes(gapName.toLowerCase()))?.level || 'Beginner'}</strong></div>
          <div><span>Lab expectation</span><strong>Intermediate</strong></div>
        </div>
      </section>

      <section className="lab-card-panel">
        <h2>What you need to build</h2>
        <ul className="build-list">
          <li>NLP fundamentals</li>
          <li>Text classification</li>
          <li>Embeddings</li>
          <li>Transformers</li>
        </ul>
      </section>

      <section className="lab-card-panel">
        <h2>Relevant learning resources</h2>
        <div className="resource-list">
          {resources.map((resource) => <div className="resource-item" key={resource.title}><div><strong>{resource.title}</strong><p>{resource.copy}</p></div><button type="button">{resource.action}</button></div>)}
        </div>
      </section>

      <div className="lab-action-row single-row">
        <button type="button" className="primary-action" onClick={onBack}>Return to lab</button>
        <button type="button" className="secondary-action" onClick={onSave}>{isSaved ? 'Saved' : 'Save lab'}</button>
      </div>
    </div>
  </div>
}

function ApplyAssistPage({ lab, profile, onBack, onSend }) {
  const [draft, setDraft] = useState('')
  const [loadingDraft, setLoadingDraft] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoadingDraft(true)
    setError('')
    applyAssistService.generateDraft(lab.id)
      .then((result) => {
        if (cancelled) return
        const qa = (result.answers || []).map((item) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')
        setDraft(qa ? `${result.message || ''}\n\n---\n${qa}` : (result.message || ''))
      })
      .catch(() => { if (!cancelled) setError('Could not generate a draft right now. You can still write your own message below.') })
      .finally(() => { if (!cancelled) setLoadingDraft(false) })
    return () => { cancelled = true }
  }, [lab.id])

  const handleSend = async () => {
    setSending(true)
    setError('')
    try {
      await applyAssistService.sendApplication({ lab_id: lab.id, message: draft, answers: [] })
      onSend()
    } catch (err) {
      setError(err.message || 'Could not send this application.')
      setSending(false)
    }
  }

  return <div className="lab-detail-page apply-page">
    <div className="lab-detail-header compact-header">
      <button type="button" className="lab-back-btn" onClick={onBack}>← Back</button>
      <div className="lab-header-copy build-copy">
        <span className="lab-page-kicker">Apply assist</span>
        <h1>Review outreach</h1>
      </div>
    </div>

    <div className="lab-detail-body">
      <section className="lab-card-panel">
        <h2>Your opportunity</h2>
        <p className="apply-opportunity">{lab.name}</p>
      </section>

      <section className="lab-card-panel">
        <h2>Genie draft</h2>
        {loadingDraft
          ? <p>Drafting your message...</p>
          : <textarea className="apply-message" value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Outreach message" />}
        {error && <p>{error}</p>}
      </section>

      <div className="lab-action-row single-row">
        <button type="button" className="secondary-action" onClick={onBack} disabled={sending}>Edit message</button>
        <button type="button" className="primary-action" onClick={handleSend} disabled={sending || loadingDraft}>{sending ? 'Sending...' : 'Send outreach →'}</button>
      </div>
    </div>
  </div>
}

function App() {
  const [view, setView] = useState(() => getRouteState().view)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [marketplaceView, setMarketplaceView] = useState(() => {
    const route = window.location.pathname.split('/').pop()
    return ['explore', 'saved'].includes(route) ? route : 'recommended'
  })
  const [profile, setProfile] = useState(createUiEmptyProfile())
  const [labs, setLabs] = useState([])
  const [recommendedLabs, setRecommendedLabs] = useState([])
  const [savedIds, setSavedIds] = useState([])
  const [activeLabId, setActiveLabId] = useState(() => getRouteState().labId)
  const [conversations, setConversations] = useState([createConversation('current')])
  const [activeId, setActiveId] = useState('current')
  const [draft, setDraft] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const messageAreaRef = useRef(null)
  const textareaRef = useRef(null)
  const resumeInputRef = useRef(null)
  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || conversations[0]
  const hasMessages = activeConversation.messages.length > 0

  useEffect(() => {
    if (messageAreaRef.current) messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight
  }, [activeConversation.messages.length, isThinking])

  useEffect(() => {
    let cancelled = false

    async function loadDashboardData() {
      const [profileResult, exploreResult, recommendedResult, savedResult] = await Promise.allSettled([
        profileService.getProfile(),
        labService.getExploreLabs(),
        labService.getRecommendedLabs(),
        savedLabService.getSavedLabs(),
      ])
      if (cancelled) return

      const matchByLabId = new Map()
      if (recommendedResult.status === 'fulfilled') {
        recommendedResult.value.forEach((match) => matchByLabId.set(match.lab_id, match))
      }

      if (profileResult.status === 'fulfilled') setProfile(mapProfile(profileResult.value))

      if (exploreResult.status === 'fulfilled') {
        const mergedLabs = exploreResult.value.map((lab) => mapLab(lab, matchByLabId.get(lab.lab_id)))
        setLabs(mergedLabs)
        const labById = new Map(mergedLabs.map((lab) => [lab.id, lab]))
        if (recommendedResult.status === 'fulfilled') {
          setRecommendedLabs(
            recommendedResult.value
              .filter((match) => match.label)
              .slice(0, 3)
              .map((match) => labById.get(match.lab_id) || mapLab(null, match))
          )
        }
      }

      if (savedResult.status === 'fulfilled') {
        setSavedIds(savedResult.value.map((lab) => lab.lab_id))
      }
    }

    loadDashboardData()
    return () => { cancelled = true }
  }, [])

  const toggleSavedLab = (labId) => {
    setSavedIds((current) => {
      const next = current.includes(labId) ? current.filter((savedId) => savedId !== labId) : [...current, labId]
      if (next.includes(labId)) savedLabService.saveLab(labId)
      else savedLabService.unsaveLab(labId)
      return next
    })
  }

  const updateConversation = (id, update) => {
    setConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, ...update } : conversation))
  }

  const sendMessage = async (value = draft) => {
    const trimmed = value.trim()
    if (!trimmed || isThinking) return
    const conversation = activeConversation
    const userMessage = { id: `${Date.now()}-user`, role: 'student', text: trimmed }
    const title = conversation.messages.length === 0 ? trimmed.slice(0, 30) : conversation.title

    updateConversation(activeId, { title, messages: [...conversation.messages, userMessage], changes: [] })
    setDraft('')
    setIsThinking(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const apiMessages = [...conversation.messages, userMessage].map((message) => ({
      role: message.role === 'genie' ? 'assistant' : 'user',
      content: message.text,
    }))

    try {
      const result = await sendGenieMessage(apiMessages)
      const nextProfile = mapProfile(result.profile)
      const changes = diffProfiles(conversation.profile, nextProfile)
      const genieMessage = { id: `${Date.now()}-genie`, role: 'genie', text: result.reply }
      updateConversation(activeId, { messages: [...conversation.messages, userMessage, genieMessage], profile: nextProfile, changes })
      setProfile(nextProfile)
    } catch (err) {
      const genieMessage = { id: `${Date.now()}-genie`, role: 'genie', text: "Sorry, I couldn't reach the server just now. Please try again." }
      updateConversation(activeId, { messages: [...conversation.messages, userMessage, genieMessage] })
    } finally {
      setIsThinking(false)
    }
  }

  const handleResumeUpload = async (file) => {
    if (!file || uploadingResume) return
    setUploadingResume(true)
    const conversation = activeConversation
    const userMessage = { id: `${Date.now()}-user`, role: 'student', text: `Uploaded resume: ${file.name}` }
    updateConversation(activeId, { messages: [...conversation.messages, userMessage], changes: [] })

    try {
      const result = await uploadResume(file)
      const nextProfile = mapProfile(result.profile)
      const changes = diffProfiles(conversation.profile, nextProfile)
      const genieMessage = { id: `${Date.now()}-genie`, role: 'genie', text: result.reply }
      updateConversation(activeId, { messages: [...conversation.messages, userMessage, genieMessage], profile: nextProfile, changes })
      setProfile(nextProfile)
    } catch (err) {
      const genieMessage = { id: `${Date.now()}-genie`, role: 'genie', text: err.message || "Sorry, I couldn't read that file. Try a PDF or .txt resume." }
      updateConversation(activeId, { messages: [...conversation.messages, userMessage, genieMessage] })
    } finally {
      setUploadingResume(false)
    }
  }

  const startNewConversation = () => {
    const nextConversation = createConversation()
    setConversations((current) => [nextConversation, ...current])
    setActiveId(nextConversation.id)
    setDraft('')
    setIsThinking(false)
  }

  const openLab = (labId) => {
    window.history.pushState({}, '', `/dashboard/labs/${labId}`)
    setView('lab-detail')
    setActiveLabId(labId)
  }

  const openLabBuild = (labId) => {
    window.history.pushState({}, '', `/dashboard/labs/${labId}/build`)
    setView('lab-build')
    setActiveLabId(labId)
  }

  const openApplyAssist = (labId) => {
    window.history.pushState({}, '', `/dashboard/labs/${labId}/apply`)
    setView('lab-apply')
    setActiveLabId(labId)
  }

  const openGenie = () => {
    window.history.pushState({}, '', '/dashboard')
    setView('genie')
  }

  useEffect(() => {
    const handleHistoryChange = () => {
      const state = getRouteState()
      const route = state.view
      if (route === 'marketplace') {
        const candidate = window.location.pathname.split('/').pop()
        setMarketplaceView(['explore', 'saved'].includes(candidate) ? candidate : 'recommended')
      }
      setView(route)
      setActiveLabId(state.labId)
    }
    window.addEventListener('popstate', handleHistoryChange)
    return () => window.removeEventListener('popstate', handleHistoryChange)
  }, [])

  const navigateMarketplace = (section) => {
    setMarketplaceView(section)
    window.history.pushState({}, '', `/dashboard/labs/${section}`)
    setView('marketplace')
  }

  const navigatePrimary = (target) => {
    setView(target)
    if (target === 'marketplace' && !window.location.pathname.startsWith('/dashboard/labs/')) {
      window.history.pushState({}, '', `/dashboard/labs/${marketplaceView}`)
    }
    if (target === 'genie') window.history.pushState({}, '', '/dashboard')
    if (target === 'profile') window.history.pushState({}, '', '/dashboard/profile')
  }

  const lab = labs.find((item) => item.id === activeLabId) || null

  if (view === 'lab-build') {
    return <div className={`product-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}><AppRail view="marketplace" onNavigate={navigatePrimary} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((current) => !current)} /><MarketplaceSidebar profile={profile} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} onNavigate={navigatePrimary} activeSection={marketplaceView} onSection={navigateMarketplace} /><main className="marketplace-workspace">{lab && <LabBuildPage lab={lab} profile={profile} onBack={() => openLab(lab.id)} onSave={() => toggleSavedLab(lab.id)} isSaved={savedIds.includes(lab.id)} />}</main></div>
  }

  if (view === 'lab-apply') {
    return <div className={`product-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}><AppRail view="marketplace" onNavigate={navigatePrimary} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((current) => !current)} /><MarketplaceSidebar profile={profile} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} onNavigate={navigatePrimary} activeSection={marketplaceView} onSection={navigateMarketplace} /><main className="marketplace-workspace">{lab && <ApplyAssistPage lab={lab} profile={profile} onBack={() => openLab(lab.id)} onSend={() => openLab(lab.id)} />}</main></div>
  }

  if (view === 'lab-detail') {
    return <div className={`product-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}><AppRail view="marketplace" onNavigate={navigatePrimary} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((current) => !current)} /><MarketplaceSidebar profile={profile} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} onNavigate={navigatePrimary} activeSection={marketplaceView} onSection={navigateMarketplace} /><main className="marketplace-workspace">{lab && <LabDetailPage lab={lab} profile={profile} onBack={() => navigatePrimary('marketplace')} onSave={() => toggleSavedLab(lab.id)} onBuild={() => openLabBuild(lab.id)} onReachOut={openGenie} isSaved={savedIds.includes(lab.id)} />}</main></div>
  }

  if (view === 'profile') {
    return <div className={`product-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}><AppRail view="profile" onNavigate={navigatePrimary} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((current) => !current)} /><MarketplaceSidebar profile={profile} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} onNavigate={navigatePrimary} activeSection={marketplaceView} onSection={navigateMarketplace} /><main className="marketplace-workspace"><ProfilePage profile={profile} _onEdit={() => {}} _onNavigate={navigatePrimary} onBack={() => navigatePrimary('marketplace')} /></main></div>
  }

  if (view === 'marketplace') {
    return <div className={`product-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}><AppRail view={view} onNavigate={navigatePrimary} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((current) => !current)} /><MarketplaceSidebar profile={profile} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} onNavigate={navigatePrimary} activeSection={marketplaceView} onSection={navigateMarketplace} /><main className="marketplace-workspace"><Marketplace onOpenLab={openLab} marketplaceView={marketplaceView} onNavigateSection={navigateMarketplace} savedIds={savedIds} onToggleSave={toggleSavedLab} labs={labs} recommendedLabs={recommendedLabs} profile={profile} /></main></div>
  }

  return <div className={`insenio-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    <AppRail view={view} onNavigate={navigatePrimary} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((current) => !current)} />
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="brand-block"><GenieMark /><span className="brand-text">INSENIO</span><button type="button" className="sidebar-toggle" onClick={() => setSidebarCollapsed((current) => !current)} aria-label={sidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}>{sidebarCollapsed ? '→' : '←'}</button></div>
      <button type="button" className="new-chat-btn" onClick={startNewConversation}><span>+</span> New conversation</button>
      <div className="sidebar-section"><span className="sidebar-label">Recent</span><div className="history-list">
        {conversations.slice(0, 5).map((conversation) => <button type="button" key={conversation.id} onClick={() => { setActiveId(conversation.id); setDraft('') }} className={`history-item ${conversation.id === activeId ? 'active' : ''}`}>{conversation.title}</button>)}
      </div></div>
      <div className="profile-teaser">
        <span className="teaser-label">Research profile</span>
        <strong>Build as you talk.</strong>
        <span className="teaser-copy">Genie keeps your interests and experience organized over time.</span>
        <div className="teaser-progress"><span /></div>
        <span className="teaser-status">Ready to take shape <b>→</b></span>
      </div>
      <button type="button" className="account-row" onClick={() => navigatePrimary('profile')} aria-label={`Open ${profile.name || 'your'} profile`}><span className="account-avatar">{initials(profile.name)}</span><div className="account-copy"><strong>{profile.name || 'Student'}</strong><span>{[profile.academic, profile.academicYear].filter(Boolean).join(' · ')}</span></div></button>
    </aside>

    <main className="workspace">
      <header className="workspace-header"><span>{activeConversation.title === 'New conversation' ? 'Genie' : activeConversation.title}</span></header>
      <div className="conversation-shell" ref={messageAreaRef}>
        <div className={`conversation-inner ${hasMessages ? 'has-messages' : 'empty-conversation'}`}>
          {!hasMessages && <div className="empty-state"><GenieMark /><div className="empty-label">GENIE</div><h1>Let's build your<br />research profile.</h1><p>Tell me about your background, skills,<br />interests, and what you'd like to explore.<br />I'll organize it as we go.</p></div>}
          {activeConversation.messages.map((message) => <Message key={message.id} message={message} studentInitials={initials(profile.name)} />)}
          {hasMessages && <ProfileSummary profile={activeConversation.profile} changes={activeConversation.changes} />}
          {isThinking && <div className="message-row genie thinking-row"><GenieMark small /><div className="thinking-content"><span className="thinking-dots"><i /><i /><i /></span><span>Thinking...</span></div></div>}
        </div>
      </div>
      <div className="composer-wrap">
        <div className={`composer ${draft.trim() ? 'has-draft' : ''}`}>
          <textarea ref={textareaRef} value={draft} rows={1} aria-label="Message Genie" placeholder="Tell Genie about yourself..." onChange={(event) => { setDraft(event.target.value); event.target.style.height = 'auto'; event.target.style.height = `${Math.min(event.target.scrollHeight, 180)}px` }} onKeyDown={(event) => { if (event.key === 'Escape') event.currentTarget.blur(); if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() } }} />
          <button type="button" className="send-btn" disabled={!draft.trim() || isThinking} onClick={() => sendMessage()} aria-label={isThinking ? 'Genie is thinking' : 'Send message'}>{isThinking ? '...' : 'Send'}</button>
        </div>
        {!hasMessages && <div className="starter-row" aria-label="Suggested prompts">{starterPrompts.map((prompt) => <button type="button" key={prompt} className="starter-btn" onClick={() => sendMessage(prompt)}><span>{prompt}</span><b aria-hidden="true">-&gt;</b></button>)}</div>}
        <div className="composer-note">Genie structures what you share into your research profile.</div>
        <div className="resume-upload-row">
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            style={{ display: 'none' }}
            onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) handleResumeUpload(file) }}
          />
          <button type="button" className="resume-upload-btn" disabled={uploadingResume || isThinking} onClick={() => resumeInputRef.current?.click()}>
            {uploadingResume ? 'Reading your resume...' : 'Prefer not to chat? Upload your resume instead (PDF or .txt)'}
          </button>
        </div>
      </div>
    </main>
  </div>
}

export default App
