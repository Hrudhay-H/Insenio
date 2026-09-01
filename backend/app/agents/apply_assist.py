"""Apply Assist — TRD §2.3/§2.5. Drafts a personalized outreach message (and
answers to a lab's extra application questions) grounded strictly in the
student's actual profile data. Higher stakes than intake: the output is meant
to reach a real professor, so grounding and no-fabrication matter more here.

This only ever produces a draft. Nothing here has a path to send anything —
the calling endpoint requires a separate, explicit student confirmation
(POST /applications) before a record is created. See TRD §2.5: "the send
action requires an explicit student confirmation step; the agent has no path
to email/submit without it."
"""

from app.agents.llm_client import chat_json

SYSTEM_PROMPT = """\
You draft a research-lab outreach message on behalf of a student, for the student to
review and edit before sending. This message will be read by a real professor, so
accuracy and specificity matter more than enthusiasm.

STRICT GROUNDING RULE: only reference facts given to you below in STUDENT PROFILE.
Never invent projects, experience, coursework, or skills the student doesn't have.
If the student has a real gap versus what the lab needs, do not paper over it or
claim skills they don't have — just don't dwell on gaps in an outreach message either;
focus on genuine, stated overlap.

Write in first person, as the student, addressed to the PI. Keep it short (120-180
words), specific (reference actual matched skills/interests and why this lab), and
factual — no generic filler like "I am a highly motivated individual."

If APPLICATION QUESTIONS are given, answer each one separately, still grounded only
in the student's real profile data, in 1-3 sentences each.

Output ONLY a JSON object of this exact shape:
{
  "message": string,
  "answers": [{"question": string, "answer": string}, ...]
}
If there are no application questions, "answers" must be an empty array.
"""


def draft_application(profile: dict, lab: dict) -> dict:
    student_skills = ", ".join(f"{s['skill_name']} ({s['proficiency']})" for s in profile.get("skills", []))
    required_skills = ", ".join(f"{s['skill_name']} ({s['depth']})" for s in lab.get("required_skills", []))
    questions = lab.get("application_questions") or []

    context = f"""\
STUDENT PROFILE:
- Academic year: {profile.get('academic_year') or 'not stated'}
- Major: {profile.get('major') or 'not stated'}
- Skills: {student_skills or 'not stated'}
- Stated interests: {profile.get('interests_text') or 'not stated'}
- Weekly availability: {profile.get('availability_hrs') or 'not stated'} hours

TARGET LAB:
- Name: {lab['lab_name']}
- PI: {lab['pi_name']}
- Research focus: {lab['research_focus']}
- Required skills: {required_skills or 'not stated'}

APPLICATION QUESTIONS:
{chr(10).join(f'- {q}' for q in questions) if questions else '(none)'}
"""

    return chat_json(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": context},
        ],
        temperature=0.3,
        max_tokens=700,
    )
