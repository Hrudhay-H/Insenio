"""Seeds realistic demo data: labs + required skills, a few student profiles
(including the Ananya persona from the PRD), and matching user rows.

Run once (safe to re-run — it upserts by deleting first):
    python -m app.db.seed_data
"""

import uuid
from datetime import datetime, timedelta, timezone

from app.config import settings
from app.db.client import get_connection
from app.security import hash_password

FS = settings.full_schema

# Known login for every seeded student persona (Ananya et al.) — lets anyone
# on the team log in as the demo personas through the real /auth/login flow
# instead of only being able to see their data via direct DB queries.
DEMO_STUDENT_PASSWORD = "campus2026"

LABS = [
    {
        "lab_name": "Computer Vision & Robotics Lab",
        "pi_name": "Dr. Rekha Nair",
        "research_focus": "Real-time object detection and SLAM for autonomous ground robots",
        "time_commitment_hrs": 10,
        "capacity": 6,
        "current_team_size": 4,
        "recent_publications": "Efficient SLAM on Embedded GPUs (ICRA 2025)",
        "required_skills": [("Python", "intermediate"), ("PyTorch", "intermediate"), ("ROS", "beginner")],
    },
    {
        "lab_name": "NLP & Language Understanding Group",
        "pi_name": "Dr. Arjun Mehta",
        "research_focus": "Low-resource language modeling and evaluation for Indic languages",
        "time_commitment_hrs": 8,
        "capacity": 5,
        "current_team_size": 5,
        "recent_publications": "Tokenizer-free Modeling for Indic Scripts (ACL 2025)",
        "required_skills": [("Python", "intermediate"), ("PyTorch", "advanced"), ("NLP", "intermediate")],
    },
    {
        "lab_name": "Distributed Systems Lab",
        "pi_name": "Dr. Priya Ramamurthy",
        "research_focus": "Consensus protocols and fault tolerance for edge computing clusters",
        "time_commitment_hrs": 12,
        "capacity": 4,
        "current_team_size": 2,
        "recent_publications": "Byzantine-Tolerant Consensus at the Edge (OSDI 2024)",
        "required_skills": [("Go", "intermediate"), ("Distributed Systems", "intermediate"), ("Linux", "intermediate")],
    },
    {
        "lab_name": "Human-Computer Interaction Lab",
        "pi_name": "Dr. Sameera Iyer",
        "research_focus": "Accessible interfaces for assistive technology on low-cost devices",
        "time_commitment_hrs": 6,
        "capacity": 8,
        "current_team_size": 3,
        "recent_publications": "Voice-first UI for Low-Literacy Users (CHI 2025)",
        "required_skills": [("JavaScript", "beginner"), ("UX Research", "beginner")],
    },
    {
        "lab_name": "Bioinformatics & Genomics Lab",
        "pi_name": "Dr. Kavitha Suresh",
        "research_focus": "Machine learning for variant calling in whole-genome sequencing data",
        "time_commitment_hrs": 10,
        "capacity": 5,
        "current_team_size": 5,
        "recent_publications": "Deep Variant Calling at Population Scale (Nature Methods 2025)",
        "required_skills": [("Python", "advanced"), ("Machine Learning", "intermediate"), ("Statistics", "intermediate")],
    },
    {
        "lab_name": "Cybersecurity & Systems Lab",
        "pi_name": "Dr. Vikram Rao",
        "research_focus": "Binary analysis and automated vulnerability discovery",
        "time_commitment_hrs": 10,
        "capacity": 6,
        "current_team_size": 1,
        "recent_publications": "Symbolic Execution for Firmware Fuzzing (USENIX Security 2025)",
        "required_skills": [("C", "intermediate"), ("Reverse Engineering", "beginner"), ("Python", "beginner")],
    },
    {
        "lab_name": "Reinforcement Learning Lab",
        "pi_name": "Dr. Aditi Bhatt",
        "research_focus": "Sample-efficient RL for multi-agent coordination in simulation",
        "time_commitment_hrs": 12,
        "capacity": 5,
        "current_team_size": 3,
        "recent_publications": "Curriculum Learning for Multi-Agent RL (NeurIPS 2025)",
        "required_skills": [("Python", "advanced"), ("PyTorch", "intermediate"), ("Reinforcement Learning", "intermediate")],
    },
    {
        "lab_name": "Data Systems & Databases Lab",
        "pi_name": "Dr. Nikhil Deshpande",
        "research_focus": "Query optimization for hybrid transactional/analytical workloads",
        "time_commitment_hrs": 8,
        "capacity": 6,
        "current_team_size": 2,
        "recent_publications": "Adaptive Query Planning for HTAP Systems (VLDB 2025)",
        "required_skills": [("SQL", "intermediate"), ("Java", "intermediate"), ("Data Structures", "intermediate")],
    },
    {
        "lab_name": "Computational Social Science Lab",
        "pi_name": "Dr. Meera Krishnan",
        "research_focus": "Network analysis of misinformation spread on social platforms",
        "time_commitment_hrs": 6,
        "capacity": 7,
        "current_team_size": 4,
        "recent_publications": "Graph-based Misinformation Detection (ICWSM 2025)",
        "required_skills": [("Python", "beginner"), ("Statistics", "beginner"), ("Data Visualization", "beginner")],
    },
    {
        "lab_name": "Applied AI & Foundation Models Lab",
        "pi_name": "Dr. Rohan Kapoor",
        "research_focus": "Efficient fine-tuning and evaluation of foundation models for domain tasks",
        "time_commitment_hrs": 10,
        "capacity": 6,
        "current_team_size": 6,
        "recent_publications": "LoRA at Scale: A Systems Study (MLSys 2025)",
        "required_skills": [("Python", "intermediate"), ("PyTorch", "intermediate"), ("Machine Learning", "intermediate")],
    },
    {
        "lab_name": "Wireless Networks Lab",
        "pi_name": "Dr. Sanjay Pillai",
        "research_focus": "5G/6G physical layer design and spectrum sharing algorithms",
        "time_commitment_hrs": 10,
        "capacity": 4,
        "current_team_size": 4,
        "recent_publications": "Spectrum Sharing for Dense 6G Deployments (IEEE Trans. Wireless 2025)",
        "required_skills": [("MATLAB", "intermediate"), ("Signal Processing", "intermediate"), ("C++", "beginner")],
    },
    {
        "lab_name": "Computational Biology & Drug Discovery Lab",
        "pi_name": "Dr. Ananya Ghosh",
        "research_focus": "Molecular property prediction using graph neural networks",
        "time_commitment_hrs": 10,
        "capacity": 5,
        "current_team_size": 3,
        "recent_publications": "GNNs for Molecular Property Prediction (NeurIPS 2024)",
        "required_skills": [("Python", "intermediate"), ("Machine Learning", "intermediate"), ("Chemistry", "beginner")],
    },
    {
        "lab_name": "Robotics Manipulation Lab",
        "pi_name": "Dr. Farhan Ahmed",
        "research_focus": "Dexterous manipulation and grasp planning with tactile sensing",
        "time_commitment_hrs": 12,
        "capacity": 5,
        "current_team_size": 5,
        "recent_publications": "Tactile-Guided Grasp Planning (RSS 2025)",
        "required_skills": [("C++", "intermediate"), ("ROS", "intermediate"), ("Control Systems", "beginner")],
    },
    {
        "lab_name": "Computer Graphics & Vision Lab",
        "pi_name": "Dr. Divya Chandran",
        "research_focus": "Neural rendering and 3D scene reconstruction from sparse views",
        "time_commitment_hrs": 8,
        "capacity": 5,
        "current_team_size": 2,
        "recent_publications": "Sparse-View Neural Rendering (SIGGRAPH 2025)",
        "required_skills": [("Python", "intermediate"), ("PyTorch", "beginner"), ("Linear Algebra", "intermediate")],
    },
    {
        "lab_name": "Software Engineering & Program Analysis Lab",
        "pi_name": "Dr. Karthik Subramaniam",
        "research_focus": "Automated bug detection using large language models",
        "time_commitment_hrs": 8,
        "capacity": 6,
        "current_team_size": 3,
        "recent_publications": "LLM-Assisted Static Analysis at Scale (ICSE 2025)",
        "required_skills": [("Python", "intermediate"), ("Java", "beginner"), ("Software Testing", "beginner")],
    },
    {
        "lab_name": "Climate & Environmental Data Lab",
        "pi_name": "Dr. Lakshmi Venkatesh",
        "research_focus": "Satellite imagery analysis for deforestation and land-use tracking",
        "time_commitment_hrs": 6,
        "capacity": 6,
        "current_team_size": 1,
        "recent_publications": "Deep Learning for Land-Use Change Detection (Remote Sensing 2025)",
        "required_skills": [("Python", "beginner"), ("Machine Learning", "beginner"), ("GIS", "beginner")],
    },
    {
        "lab_name": "Quantum Computing Lab",
        "pi_name": "Dr. Ishaan Malhotra",
        "research_focus": "Error mitigation techniques for near-term quantum devices",
        "time_commitment_hrs": 10,
        "capacity": 4,
        "current_team_size": 4,
        "recent_publications": "Zero-Noise Extrapolation at Scale (Quantum 2025)",
        "required_skills": [("Python", "intermediate"), ("Linear Algebra", "advanced"), ("Quantum Computing", "beginner")],
    },
    {
        "lab_name": "Educational Technology Lab",
        "pi_name": "Dr. Shreya Pandit",
        "research_focus": "Adaptive learning systems that personalize practice difficulty in real time",
        "time_commitment_hrs": 6,
        "capacity": 7,
        "current_team_size": 4,
        "recent_publications": "Bayesian Knowledge Tracing Revisited (EDM 2025)",
        "required_skills": [("Python", "beginner"), ("Data Analysis", "beginner"), ("JavaScript", "beginner")],
    },
]

STUDENTS = [
    {
        "student_id": "student_ananya",
        "email": "ananya@campus.edu",
        "academic_year": "3rd year",
        "major": "Computer Science",
        "availability_hrs": 8,
        "interests_text": "Vaguely interested in AI, leaning toward how models are actually built rather than just applying APIs.",
        "interest_tags": ["ai", "machine learning", "model building"],
        "skills": [("Python", "intermediate"), ("DSA", "intermediate")],
    },
    {
        "student_id": "student_ravi",
        "email": "ravi@campus.edu",
        "academic_year": "4th year",
        "major": "Electronics & Communication",
        "availability_hrs": 10,
        "interests_text": "Interested in robotics and embedded control systems, has built a line-following robot.",
        "interest_tags": ["robotics", "embedded systems", "control"],
        "skills": [("C++", "intermediate"), ("ROS", "beginner"), ("Python", "beginner")],
    },
    {
        "student_id": "student_meher",
        "email": "meher@campus.edu",
        "academic_year": "2nd year",
        "major": "Computer Science",
        "availability_hrs": 6,
        "interests_text": "Curious about how misinformation spreads online and wants to work with real social data.",
        "interest_tags": ["social science", "networks", "data analysis"],
        "skills": [("Python", "beginner"), ("Statistics", "beginner")],
    },
]


def _now():
    return datetime.now(timezone.utc)


def clear_all():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            for table in [
                "lab_views",
                "saved_labs",
                "applications",
                "lab_required_skills",
                "labs",
                "student_skills",
                "student_profiles",
                "users",
            ]:
                cursor.execute(f"DELETE FROM {FS}.{table}")


def seed_labs():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            for lab in LABS:
                lab_id = f"lab_{uuid.uuid4().hex[:10]}"
                cursor.execute(
                    f"""
                    INSERT INTO {FS}.labs
                        (lab_id, lab_name, pi_name, pi_user_id, research_focus,
                         time_commitment_hrs, capacity, current_team_size,
                         recent_publications, reliability_score, last_updated)
                    VALUES
                        (:lab_id, :lab_name, :pi_name, NULL, :research_focus,
                         :time_commitment_hrs, :capacity, :current_team_size,
                         :recent_publications, :reliability_score, :last_updated)
                    """,
                    {
                        "lab_id": lab_id,
                        "lab_name": lab["lab_name"],
                        "pi_name": lab["pi_name"],
                        "research_focus": lab["research_focus"],
                        "time_commitment_hrs": lab["time_commitment_hrs"],
                        "capacity": lab["capacity"],
                        "current_team_size": lab["current_team_size"],
                        "recent_publications": lab["recent_publications"],
                        "reliability_score": 1.0,
                        "last_updated": _now() - timedelta(days=lab["current_team_size"]),
                    },
                )
                for skill_name, depth in lab["required_skills"]:
                    cursor.execute(
                        f"""
                        INSERT INTO {FS}.lab_required_skills (lab_id, skill_name, depth)
                        VALUES (:lab_id, :skill_name, :depth)
                        """,
                        {"lab_id": lab_id, "skill_name": skill_name, "depth": depth},
                    )
    print(f"Seeded {len(LABS)} labs")


def seed_students():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            for student in STUDENTS:
                cursor.execute(
                    f"""
                    INSERT INTO {FS}.users (user_id, email, password_hash, role, created_at)
                    VALUES (:user_id, :email, :password_hash, 'student', :created_at)
                    """,
                    {
                        "user_id": student["student_id"],
                        "email": student["email"],
                        "password_hash": hash_password(DEMO_STUDENT_PASSWORD),
                        "created_at": _now(),
                    },
                )
                cursor.execute(
                    f"""
                    INSERT INTO {FS}.student_profiles
                        (student_id, academic_year, major, availability_hrs,
                         interests_text, interest_tags, last_updated)
                    VALUES
                        (:student_id, :academic_year, :major, :availability_hrs,
                         :interests_text, :interest_tags, :last_updated)
                    """,
                    {
                        "student_id": student["student_id"],
                        "academic_year": student["academic_year"],
                        "major": student["major"],
                        "availability_hrs": student["availability_hrs"],
                        "interests_text": student["interests_text"],
                        "interest_tags": ",".join(student["interest_tags"]),
                        "last_updated": _now(),
                    },
                )
                for skill_name, proficiency in student["skills"]:
                    cursor.execute(
                        f"""
                        INSERT INTO {FS}.student_skills (student_id, skill_name, proficiency)
                        VALUES (:student_id, :skill_name, :proficiency)
                        """,
                        {"student_id": student["student_id"], "skill_name": skill_name, "proficiency": proficiency},
                    )
    print(f"Seeded {len(STUDENTS)} students")


def main():
    clear_all()
    seed_labs()
    seed_students()
    emails = ", ".join(s["email"] for s in STUDENTS)
    print(f"Demo student login password: {DEMO_STUDENT_PASSWORD!r} (accounts: {emails})")


if __name__ == "__main__":
    main()
