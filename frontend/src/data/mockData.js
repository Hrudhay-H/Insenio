export const MOCK_LABS = [
  {
    lab_id: "lab_01",
    pi: "Dr. Elena Rostova",
    research_focus: "LLM agent alignment and conversational reasoning.",
    required_skills: [
      { name: "Python", depth: "Intermediate" },
      { name: "PyTorch", depth: "Basic" },
      { name: "Prompt Engineering", depth: "Intermediate" }
    ],
    time_commitment: 10,
    capacity: 2,
    current_team_size: 5,
    recent_publications: "Evaluating Agentic Workflows in Educational Contexts (2025)",
    last_updated: "2 days ago",
    match_status: "Ready now",
    match_reasoning: {
      skill_overlap: "Strong match. You have Python and Prompt Engineering.",
      interest_alignment: "Very high semantic similarity (AI, agents, reasoning).",
      availability_overlap: "Fits your 12 hrs/week."
    }
  },
  {
    lab_id: "lab_02",
    pi: "Dr. Marcus Chen",
    research_focus: "Distributed systems for large-scale data processing.",
    required_skills: [
      { name: "C++", depth: "Advanced" },
      { name: "Python", depth: "Intermediate" },
      { name: "Distributed Systems", depth: "Basic" }
    ],
    time_commitment: 15,
    capacity: 1,
    current_team_size: 8,
    recent_publications: "Optimizing Delta Lake for High-Throughput Streaming (2026)",
    last_updated: "1 week ago",
    match_status: "Stretch pick",
    missing_skills: ["C++", "Distributed Systems"],
    match_reasoning: {
      skill_overlap: "Gap in C++ and Distributed Systems.",
      interest_alignment: "Low alignment. You prefer AI/ML, this is systems.",
      availability_overlap: "Requires 15 hrs, you have 12 hrs."
    }
  },
  {
    lab_id: "lab_03",
    pi: "Dr. Sarah Jenkins",
    research_focus: "Machine Learning applied to genomic sequences.",
    required_skills: [
      { name: "Python", depth: "Advanced" },
      { name: "Data Analysis", depth: "Intermediate" },
      { name: "Biology", depth: "Basic" }
    ],
    time_commitment: 12,
    capacity: 3,
    current_team_size: 4,
    recent_publications: "Predictive Models for Gene Expression (2026)",
    last_updated: "1 month ago",
    match_status: "Ready now",
    match_reasoning: {
      skill_overlap: "Good match. You have Python and Data structures.",
      interest_alignment: "Moderate. Uses ML, but domain is biology.",
      availability_overlap: "Exact match (12 hrs/week)."
    }
  }
];

export const STUDENT_PERSONA = {
  name: "Ananya",
  year: "3rd-year",
  major: "Computer Science",
  skills: [
    { name: "Python", proficiency: "Intermediate" },
    { name: "Data Structures/Algorithms", proficiency: "Intermediate" }
  ],
  interests: ["AI", "Machine Learning", "Not sure exactly, exploring"],
  availability: 12
};
