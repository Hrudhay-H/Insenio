import { useEffect, useState } from 'react'
import { labService } from './services/labService'
import { applyAssistService } from './services/applyAssistService'
import { authService } from './services/authService'
import './DashboardApp.css'

const DEPTH_OPTIONS = ['beginner', 'intermediate', 'advanced']
const STATUS_OPTIONS = ['Applied', 'Pending', 'Interview', 'Decision']

function initials(name) {
  if (!name) return '—'
  return name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function GenieMark({ small = false }) {
  return <span className={`genie-mark ${small ? 'small' : ''}`} aria-hidden="true"><span className="genie-core" /></span>
}

function AppRail({ onCreateLab, onGoHome }) {
  return <nav className="app-rail" aria-label="Primary navigation">
    <button type="button" className="rail-brand" onClick={onGoHome} aria-label="My Labs" style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><GenieMark /></button>
    <div className="rail-items">
      <button type="button" className="rail-item active" onClick={onGoHome} aria-label="My Labs" title="My Labs"><span>⌘</span></button>
      <button type="button" className="rail-item" onClick={onCreateLab} aria-label="New Lab" title="New Lab"><span>+</span></button>
    </div>
  </nav>
}

function PISidebar({ collapsed, onToggle, onGoHome, onCreateLab, me }) {
  return <aside className={`marketplace-sidebar ${collapsed ? 'collapsed' : ''}`}>
    <div className="market-brand"><GenieMark /><span>INSENIO</span><button type="button" className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}>{collapsed ? '→' : '←'}</button></div>
    <div className="market-nav">
      <span className="market-nav-label">Labs</span>
      <button type="button" className="market-nav-item active" onClick={onGoHome}><span>⌘</span> My Labs</button>
    </div>
    <button type="button" className="new-chat-btn" style={{ marginTop: 18 }} onClick={onCreateLab}><span>+</span> New lab</button>
    <button type="button" className="account-row" style={{ marginTop: 'auto' }} aria-label={me?.display_name ? `${me.display_name}'s account` : 'Your account'}>
      <span className="account-avatar">{initials(me?.display_name)}</span>
      <div className="account-copy"><strong>{me?.display_name || 'Principal Investigator'}</strong><span>{me?.email || ''}</span></div>
    </button>
  </aside>
}

function emptyLabForm() {
  return {
    lab_name: '',
    research_focus: '',
    time_commitment_hrs: 8,
    capacity: 4,
    current_team_size: 0,
    recent_publications: '',
    department: '',
    team_composition: '',
    website_url: '',
    application_process_text: '',
    application_questions: [''],
    required_skills: [{ skill_name: '', depth: 'intermediate' }],
  }
}

function formFromLab(lab) {
  return {
    lab_name: lab.lab_name || '',
    research_focus: lab.research_focus || '',
    time_commitment_hrs: lab.time_commitment_hrs ?? 8,
    capacity: lab.capacity ?? 4,
    current_team_size: lab.current_team_size ?? 0,
    recent_publications: lab.recent_publications || '',
    department: lab.department || '',
    team_composition: lab.team_composition || '',
    website_url: lab.website_url || '',
    application_process_text: lab.application_process_text || '',
    application_questions: lab.application_questions?.length ? lab.application_questions : [''],
    required_skills: lab.required_skills?.length ? lab.required_skills.map((s) => ({ skill_name: s.skill_name, depth: s.depth })) : [{ skill_name: '', depth: 'intermediate' }],
  }
}

function LabForm({ initial, onCancel, onSaved, labId }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const setSkill = (index, key, value) => {
    setForm((current) => ({
      ...current,
      required_skills: current.required_skills.map((skill, i) => i === index ? { ...skill, [key]: value } : skill),
    }))
  }
  const addSkill = () => setForm((current) => ({ ...current, required_skills: [...current.required_skills, { skill_name: '', depth: 'intermediate' }] }))
  const removeSkill = (index) => setForm((current) => ({ ...current, required_skills: current.required_skills.filter((_, i) => i !== index) }))

  const setQuestion = (index, value) => {
    setForm((current) => ({ ...current, application_questions: current.application_questions.map((q, i) => i === index ? value : q) }))
  }
  const addQuestion = () => setForm((current) => ({ ...current, application_questions: [...current.application_questions, ''] }))
  const removeQuestion = (index) => setForm((current) => ({ ...current, application_questions: current.application_questions.filter((_, i) => i !== index) }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      lab_name: form.lab_name.trim(),
      research_focus: form.research_focus.trim(),
      time_commitment_hrs: Number(form.time_commitment_hrs),
      capacity: Number(form.capacity),
      recent_publications: form.recent_publications.trim() || null,
      department: form.department.trim() || null,
      team_composition: form.team_composition.trim() || null,
      website_url: form.website_url.trim() || null,
      application_process_text: form.application_process_text.trim() || null,
      application_questions: form.application_questions.map((q) => q.trim()).filter(Boolean),
      required_skills: form.required_skills.filter((s) => s.skill_name.trim()).map((s) => ({ skill_name: s.skill_name.trim(), depth: s.depth })),
    }
    try {
      if (labId) {
        await labService.updateLab(labId, { ...payload, current_team_size: Number(form.current_team_size) })
      } else {
        await labService.createLab(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Could not save this lab.')
    } finally {
      setSaving(false)
    }
  }

  return <form onSubmit={handleSubmit}>
    {error && <div className="form-error" style={{ marginBottom: 18 }}>{error}</div>}

    <div className="field">
      <label className="field-label" htmlFor="lab_name">Lab name</label>
      <input id="lab_name" className="field-input" required value={form.lab_name} onChange={(e) => setField('lab_name', e.target.value)} />
    </div>

    <div className="field">
      <label className="field-label" htmlFor="research_focus">Research focus</label>
      <textarea id="research_focus" className="field-textarea" required value={form.research_focus} onChange={(e) => setField('research_focus', e.target.value)} />
      <span className="field-hint">A clear description of what the lab works on — this is what students' interests get semantically matched against.</span>
    </div>

    <div className="field-row">
      <div className="field">
        <label className="field-label" htmlFor="time_commitment_hrs">Weekly commitment (hrs)</label>
        <input id="time_commitment_hrs" type="number" min="1" className="field-input" required value={form.time_commitment_hrs} onChange={(e) => setField('time_commitment_hrs', e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="capacity">Capacity</label>
        <input id="capacity" type="number" min="1" className="field-input" required value={form.capacity} onChange={(e) => setField('capacity', e.target.value)} />
      </div>
    </div>

    {labId && (
      <div className="field">
        <label className="field-label" htmlFor="current_team_size">Current team size</label>
        <input id="current_team_size" type="number" min="0" className="field-input" value={form.current_team_size} onChange={(e) => setField('current_team_size', e.target.value)} />
        <span className="field-hint">How many students are already on the team — affects whether the lab shows as taking students.</span>
      </div>
    )}

    <div className="field-row">
      <div className="field">
        <label className="field-label" htmlFor="department">Department</label>
        <input id="department" className="field-input" value={form.department} onChange={(e) => setField('department', e.target.value)} placeholder="e.g. Computer Science" />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="team_composition">Team composition</label>
        <input id="team_composition" className="field-input" value={form.team_composition} onChange={(e) => setField('team_composition', e.target.value)} placeholder="e.g. 2 PhD, 1 undergraduate" />
      </div>
    </div>

    <div className="field">
      <label className="field-label" htmlFor="recent_publications">Recent publications</label>
      <input id="recent_publications" className="field-input" value={form.recent_publications} onChange={(e) => setField('recent_publications', e.target.value)} />
    </div>

    <div className="field">
      <label className="field-label" htmlFor="website_url">Lab website</label>
      <input id="website_url" type="url" className="field-input" value={form.website_url} onChange={(e) => setField('website_url', e.target.value)} placeholder="https://..." />
    </div>

    <div className="field">
      <label className="field-label" htmlFor="application_process_text">What happens after a student applies</label>
      <textarea id="application_process_text" className="field-textarea" value={form.application_process_text} onChange={(e) => setField('application_process_text', e.target.value)} />
    </div>

    <div className="field">
      <span className="field-label">Required skills</span>
      <div className="repeatable-list">
        {form.required_skills.map((skill, index) => (
          <div className="repeatable-row" key={index}>
            <input className="field-input" placeholder="Skill name (e.g. Python)" value={skill.skill_name} onChange={(e) => setSkill(index, 'skill_name', e.target.value)} />
            <select className="field-select" value={skill.depth} onChange={(e) => setSkill(index, 'depth', e.target.value)}>
              {DEPTH_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <button type="button" className="remove-row-btn" onClick={() => removeSkill(index)} aria-label="Remove skill">×</button>
          </div>
        ))}
      </div>
      <button type="button" className="add-row-btn" onClick={addSkill}><span>+</span> Add skill</button>
    </div>

    <div className="field">
      <span className="field-label">Application questions</span>
      <div className="repeatable-list">
        {form.application_questions.map((question, index) => (
          <div className="repeatable-row single" key={index}>
            <input className="field-input" placeholder="e.g. Why are you interested in this lab?" value={question} onChange={(e) => setQuestion(index, e.target.value)} />
            <button type="button" className="remove-row-btn" onClick={() => removeQuestion(index)} aria-label="Remove question">×</button>
          </div>
        ))}
      </div>
      <button type="button" className="add-row-btn" onClick={addQuestion}><span>+</span> Add question</button>
    </div>

    <div className="form-actions">
      <button type="button" className="secondary-action" onClick={onCancel} disabled={saving}>Cancel</button>
      <button type="submit" className="primary-action" disabled={saving}>{saving ? 'Saving...' : labId ? 'Save changes' : 'Create lab'}</button>
    </div>
  </form>
}

function statusClass(status) {
  if (status === 'Interview') return 'status-interview'
  if (status === 'Decision') return 'status-decision'
  return ''
}

function LabDetailView({ labId, onBack, onEdit }) {
  const [lab, setLab] = useState(null)
  const [stats, setStats] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([labService.getLabById(labId), labService.getLabStats(labId), labService.getLabApplicants(labId)])
      .then(([labResult, statsResult, applicantsResult]) => {
        if (cancelled) return
        setLab(labResult)
        setStats(statsResult)
        setApplicants(applicantsResult)
      })
      .catch(() => { if (!cancelled) setError('Could not load this lab.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [labId])

  const changeStatus = async (applicationId, status) => {
    setApplicants((current) => current.map((a) => a.application_id === applicationId ? { ...a, status } : a))
    try {
      await applyAssistService.updateApplicationStatus(applicationId, status)
    } catch (err) {
      setError(err.message || 'Could not update status.')
    }
  }

  if (loading) return <div className="marketplace-page"><p>Loading...</p></div>
  if (!lab) return <div className="marketplace-page"><p>{error || 'Lab not found.'}</p></div>

  return <div className="lab-detail-page">
    <div className="lab-detail-header">
      <button type="button" className="lab-back-btn" onClick={onBack}>← Back to my labs</button>
      <div className="lab-header-copy">
        <h1>{lab.lab_name}</h1>
        <p className="lab-subtitle">{[lab.department, `${lab.current_team_size}/${lab.capacity} team`].filter(Boolean).join(' · ')}</p>
      </div>
    </div>

    <div className="lab-detail-body">
      {error && <div className="form-error">{error}</div>}

      <section className="lab-card-panel">
        <h2>Stats</h2>
        <div className="stat-grid">
          <div><span>Views</span><strong>{stats.total_views}</strong></div>
          <div><span>Unique viewers</span><strong>{stats.unique_viewers}</strong></div>
          <div><span>Strong matches</span><strong>{stats.strong_matches}</strong></div>
          <div><span>Reliability</span><strong>{Math.round(stats.reliability_score * 100)}%</strong></div>
        </div>
        <button type="button" className="secondary-action" onClick={() => onEdit(labId)}>Edit lab details</button>
      </section>

      <section className="lab-card-panel">
        <h2>Applicants ({applicants.length})</h2>
        {applicants.length === 0
          ? <p>No applications yet.</p>
          : <div className="applicant-list">
              {applicants.map((applicant) => (
                <div className="applicant-row" key={applicant.application_id}>
                  <div>
                    <div className="applicant-id">{applicant.student_id}</div>
                    <span className={`status-badge ${statusClass(applicant.status)}`}>{applicant.status}</span>
                    <div className="applicant-skills">
                      {applicant.matched_skills.map((s) => <span className="matched" key={`m-${s}`}>{s}</span>)}
                      {applicant.missing_skills.map((s) => <span className="missing" key={`g-${s.skill_name}`}>{s.skill_name} ({s.required_depth})</span>)}
                    </div>
                  </div>
                  <div className="applicant-message">{applicant.drafted_message}</div>
                  <select
                    className="applicant-status-select"
                    value={applicant.status}
                    onChange={(e) => changeStatus(applicant.application_id, e.target.value)}
                    aria-label={`Status for ${applicant.student_id}`}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>}
      </section>
    </div>
  </div>
}

function LabsListView({ labs, loading, onOpenLab, onEditLab, onCreateLab }) {
  return <div className="marketplace-page">
    <header className="marketplace-header">
      <div><span className="eyebrow">INSENIO · PI DASHBOARD</span><h1>My labs</h1><p>Manage your labs, review applicants, and track engagement.</p></div>
      <button type="button" className="primary-action" onClick={onCreateLab}>+ New lab</button>
    </header>

    <section className="marketplace-section">
      {loading ? <p style={{ marginTop: 26 }}>Loading...</p> : labs.length === 0 ? (
        <div className="empty-marketplace">
          <h3>No labs yet.</h3>
          <p>Create your first lab to start receiving applications.</p>
          <button type="button" onClick={onCreateLab}>Create a lab →</button>
        </div>
      ) : (
        <div className="pi-lab-list">
          {labs.map((lab) => (
            <div className="pi-lab-row" key={lab.lab_id}>
              <div className="pi-lab-row-main">
                <h3>{lab.lab_name}</h3>
                <p>{lab.research_focus}</p>
                <div className="pi-lab-meta">
                  <span>{lab.current_team_size}/{lab.capacity} team</span>
                  <span>{lab.time_commitment_hrs} hrs/week</span>
                  <span>Reliability {Math.round(lab.reliability_score * 100)}%</span>
                </div>
              </div>
              <div className="pi-lab-row-actions">
                <button type="button" className="secondary-action" onClick={() => onEditLab(lab.lab_id)}>Edit</button>
                <button type="button" className="primary-action" onClick={() => onOpenLab(lab.lab_id)}>View applicants</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [view, setView] = useState('labs')
  const [activeLabId, setActiveLabId] = useState(null)
  const [labs, setLabs] = useState([])
  const [labsLoading, setLabsLoading] = useState(true)
  const [me, setMe] = useState(null)

  const refreshLabs = () => {
    setLabsLoading(true)
    labService.getMyLabs().then(setLabs).catch(() => setLabs([])).finally(() => setLabsLoading(false))
  }

  useEffect(() => {
    refreshLabs()
    authService.getMe().then(setMe).catch(() => {})
  }, [])

  const goHome = () => { setView('labs'); setActiveLabId(null); refreshLabs() }
  const openCreate = () => { setView('create'); setActiveLabId(null) }
  const openEdit = (labId) => { setActiveLabId(labId); setView('edit') }
  const openLab = (labId) => { setActiveLabId(labId); setView('detail') }

  const editingLab = view === 'edit' && activeLabId ? labs.find((l) => l.lab_id === activeLabId) : null

  return <div className={`product-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    <AppRail onCreateLab={openCreate} onGoHome={goHome} />
    <PISidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} onGoHome={goHome} onCreateLab={openCreate} me={me} />
    <main className="marketplace-workspace">
      {view === 'labs' && <LabsListView labs={labs} loading={labsLoading} onOpenLab={openLab} onEditLab={openEdit} onCreateLab={openCreate} />}

      {view === 'create' && (
        <div className="marketplace-page" style={{ maxWidth: 760 }}>
          <header className="marketplace-header" style={{ borderBottom: 0, paddingBottom: 0 }}>
            <div><span className="eyebrow">NEW LAB</span><h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)' }}>Create a lab</h1></div>
          </header>
          <div style={{ marginTop: 30 }}>
            <LabForm initial={emptyLabForm()} onCancel={goHome} onSaved={goHome} />
          </div>
        </div>
      )}

      {view === 'edit' && editingLab && (
        <div className="marketplace-page" style={{ maxWidth: 760 }}>
          <header className="marketplace-header" style={{ borderBottom: 0, paddingBottom: 0 }}>
            <div><span className="eyebrow">EDIT LAB</span><h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)' }}>{editingLab.lab_name}</h1></div>
          </header>
          <div style={{ marginTop: 30 }}>
            <LabForm initial={formFromLab(editingLab)} labId={activeLabId} onCancel={goHome} onSaved={goHome} />
          </div>
        </div>
      )}

      {view === 'detail' && activeLabId && <LabDetailView labId={activeLabId} onBack={goHome} onEdit={openEdit} />}
    </main>
  </div>
}

export default App
