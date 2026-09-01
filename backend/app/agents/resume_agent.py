"""Resume upload — an alternative to the conversational intake for students
who'd rather not chat through their profile. Extracts the same profile
schema as the Genie intake chat (plus a free-text experience summary),
so the merge logic in routers/intake.py can be reused unchanged.

Same no-fabrication posture as the rest of the intake layer: only pull
what the resume actually states. The one interpretive judgment call is
skill proficiency, since resumes rarely label it explicitly — documented
in the prompt below rather than left implicit.
"""

import io

from pypdf import PdfReader

from app.agents.llm_client import chat_json

MAX_RESUME_CHARS = 8000

RESUME_EXTRACT_SYSTEM_PROMPT = """\
You extract a structured student profile from resume text.

Output ONLY a JSON object with this exact shape, nothing else:
{
  "academic_year": string or null,
  "major": string or null,
  "availability_hrs": integer or null,
  "interests_text": string or null (a short free-text summary of research/technical interests),
  "interest_tags": array of short lowercase tags (2-4 words each) derived only from what's stated,
  "skills": array of {"skill_name": string, "proficiency": "beginner"|"intermediate"|"advanced"},
  "experience_text": string or null (2-4 sentence summary of relevant projects, research, or work experience)
}

Rules:
- Use null (or an empty array) for anything not present in the resume. Never invent a
  skill, project, or credential that isn't actually there.
- academic_year: infer from a stated class year or expected graduation date if present
  (e.g. "Expected May 2027" at a 4-year program implies roughly junior/senior); otherwise null.
- availability_hrs: resumes essentially never state this — leave null unless a specific
  weekly hour commitment is explicitly written somewhere (e.g. a part-time role listing hours).
- skills: pull from any skills/technologies section AND from tools clearly used in listed
  projects or experience. Resumes rarely state a proficiency level explicitly, so default
  to "intermediate" for a skill that's just listed — that's a genuine judgment call, not a
  fact from the document. Use "beginner" only if the surrounding text signals limited/coursework-only
  exposure (e.g. "exposure to", "coursework in"). Use "advanced" only if the text signals real
  depth (e.g. "expert in", multiple years of substantial use, led a project built on it).
- interests_text / interest_tags: derive from an explicit interests/objective section if present;
  otherwise infer loosely from the research/project work actually described — don't fabricate
  interests unconnected to anything in the document.
- experience_text: summarize actual listed projects, research positions, or relevant work —
  this becomes the student's profile experience blurb, so keep it grounded in specifics from
  the resume, not generic praise.
"""


def extract_text_from_upload(filename: str, content_type: str | None, content: bytes) -> str:
    """Returns extracted plain text, truncated to MAX_RESUME_CHARS. Raises ValueError
    for an unsupported file type or a file with no extractable text."""
    is_pdf = (content_type == "application/pdf") or filename.lower().endswith(".pdf")
    is_text = (content_type in ("text/plain", None)) and filename.lower().endswith(".txt")

    if is_pdf:
        try:
            reader = PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            raise ValueError(f"Could not read this PDF: {e}")
    elif is_text or filename.lower().endswith(".txt"):
        text = content.decode("utf-8", errors="ignore")
    else:
        raise ValueError("Unsupported file type — upload a PDF or .txt resume.")

    text = text.strip()
    if not text:
        raise ValueError("Couldn't find any readable text in this file.")
    return text[:MAX_RESUME_CHARS]


def extract_from_resume(resume_text: str) -> dict:
    return chat_json(
        [
            {"role": "system", "content": RESUME_EXTRACT_SYSTEM_PROMPT},
            {"role": "user", "content": f"Resume text:\n\n{resume_text}"},
        ],
        temperature=0.0,
        max_tokens=800,
    )
