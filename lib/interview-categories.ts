export const INTERVIEW_CATEGORIES = [
  {
    id: "mern-stack",
    name: "MERN Stack",
    description: "MongoDB, Express, React, Node.js full-stack questions",
    icon: "database",
    color: "#47A248",
    avgDifficulty: "Medium",
    interviewType: "technical" as const,
  },
  {
    id: "frontend",
    name: "Frontend",
    description: "React, CSS, browser APIs, and UI architecture",
    icon: "react",
    color: "#61DAFB",
    avgDifficulty: "Medium",
    interviewType: "technical" as const,
  },
  {
    id: "backend",
    name: "Backend",
    description: "APIs, databases, authentication, and server design",
    icon: "server",
    color: "#68A063",
    avgDifficulty: "Hard",
    interviewType: "technical" as const,
  },
  {
    id: "java",
    name: "Java Developer",
    description: "Core Java, Spring, JVM, and enterprise patterns",
    icon: "coffee",
    color: "#E76F00",
    avgDifficulty: "Hard",
    interviewType: "technical" as const,
  },
  {
    id: "python",
    name: "Python Developer",
    description: "Python fundamentals, frameworks, and data handling",
    icon: "code",
    color: "#3776AB",
    avgDifficulty: "Medium",
    interviewType: "technical" as const,
  },
  {
    id: "data-structures",
    name: "Data Structures",
    description: "Arrays, trees, graphs, and algorithmic thinking",
    icon: "git-branch",
    color: "#8B5CF6",
    avgDifficulty: "Hard",
    interviewType: "technical" as const,
  },
  {
    id: "hr",
    name: "HR Interview",
    description: "Behavioral, situational, and soft-skill questions",
    icon: "user",
    color: "#F59E0B",
    avgDifficulty: "Easy",
    interviewType: "hr" as const,
  },
  {
    id: "system-design",
    name: "System Design",
    description: "Scalability, architecture, and distributed systems",
    icon: "layers",
    color: "#6366F1",
    avgDifficulty: "Hard",
    interviewType: "technical" as const,
  },
] as const;

export type InterviewCategoryId = (typeof INTERVIEW_CATEGORIES)[number]["id"];

export function getCategoryById(id: string) {
  return INTERVIEW_CATEGORIES.find((c) => c.id === id);
}

export function resolveQuestionType(
  interviewType: "technical" | "hr" | "behavioral"
): "technical" | "hr" | "behavioral" {
  return interviewType;
}

export function resolveDifficultyForQuestion(
  sessionDifficulty: string,
  index: number
): "easy" | "medium" | "hard" {
  if (sessionDifficulty === "mixed") {
    const levels: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];
    return levels[index % 3];
  }
  if (sessionDifficulty === "easy" || sessionDifficulty === "medium" || sessionDifficulty === "hard") {
    return sessionDifficulty;
  }
  return "medium";
}
