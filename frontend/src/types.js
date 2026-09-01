/** @typedef {{ label: string, level: string }} Skill */
/** @typedef {{ label: string, value?: string, from?: string, to?: string, type: string }} FitReason */
/** @typedef {{ label: string, from?: string, to?: string }} SkillGap */
/** @typedef {{ id: string, name: string, institution: string, researchAreas: string[], readiness: string, image: string, why: string, reasons: string[], skillFit: string, interestFit: string, availabilityFit: string, gaps: string[], updatedAt: string }} Lab */
/** @typedef {{ name: string, studentId: string, academic: string, academicYear: string, skills: Skill[], interests: string[], interestDescription: string, availability: string, experience: string[], lastUpdated: string }} UserProfile */
/** @typedef {{ labId: string, savedAt: string }} SavedLab */
/** @typedef {{ lab: Lab, resources: LearningResource[] }} OpportunityDetail */
/** @typedef {{ id: string, title: string, type: string, url?: string }} LearningResource */
/** @typedef {{ labId: string, content: string }} ApplyAssistDraft */
