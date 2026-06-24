import { Types } from "mongoose";

export type UserRole = "candidate" | "admin";
export type ExperienceLevel = "fresher" | "junior" | "mid" | "senior";
export type InterviewType =
  | "technical"
  | "hr"
  | "behavioral"
  | "ai-conversational";
export type Difficulty = "easy" | "medium" | "hard";
export type InterviewDifficulty = Difficulty | "mixed";
export type SessionStatus = "pending" | "in-progress" | "completed";
export type QuestionType = "technical" | "hr" | "behavioral";
export type CodingLanguage = "javascript" | "python" | "java" | "cpp";
export type SubmissionStatus =
  | "accepted"
  | "wrong-answer"
  | "time-limit"
  | "runtime-error"
  | "pending";
export type ReportType = "weekly" | "monthly" | "milestone";

export interface DimensionScores {
  relevance: number;
  technicalAccuracy: number;
  communication: number;
  confidence: number;
  completeness: number;
}

export interface AIConversationMessage {
  role: string;
  content: string;
  timestamp: Date;
}

export interface CodingExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingTestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface StarterCode {
  javascript: string;
  python: string;
  java: string;
  cpp: string;
}

export interface RecommendedSkill {
  skill: string;
  priority: string;
  reason: string;
}

export interface RecommendedProject {
  title: string;
  description: string;
  skills: string[];
}

export interface RoadmapWeek {
  week: number;
  focus: string;
  tasks: string[];
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  role: UserRole;
  skills: string[];
  experienceLevel?: ExperienceLevel;
  targetRole?: string;
  linkedIn?: string;
  github?: string;
  totalInterviews: number;
  averageScore: number;
  isSuspended?: boolean;
  onboardingCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResume {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fileUrl: string;
  fileName: string;
  extractedText?: string;
  skills: string[];
  missingSkills: string[];
  suggestedTopics: string[];
  experienceLevel?: string;
  overallScore?: number;
  summary?: string;
  analyzedAt?: Date;
}

export interface IInterviewSession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  category: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  status: SessionStatus;
  questions: Types.ObjectId[];
  overallScore?: number;
  dimensionScores?: DimensionScores;
  duration?: number;
  aiConversation: AIConversationMessage[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface IQuestion {
  _id: Types.ObjectId;
  category: string;
  question: string;
  expectedAnswer?: string;
  keyPoints: string[];
  followUpQuestions: string[];
  difficulty: Difficulty;
  type: QuestionType;
  isAIGenerated: boolean;
  usageCount: number;
  createdAt: Date;
}

export interface IAnswer {
  _id: Types.ObjectId;
  sessionId: Types.ObjectId;
  questionId: Types.ObjectId;
  userId: Types.ObjectId;
  audioUrl?: string;
  transcript?: string;
  duration?: number;
  recordedAt?: Date;
}

export interface IEvaluation {
  _id: Types.ObjectId;
  answerId: Types.ObjectId;
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  overallScore: number;
  dimensions: DimensionScores;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missedKeyPoints: string[];
  idealAnswer?: string;
  evaluatedAt?: Date;
}

export interface ICodingProblem {
  _id: Types.ObjectId;
  problemNumber?: number;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  examples: CodingExample[];
  testCases: CodingTestCase[];
  starterCode: StarterCode;
  solution?: string;
  constraints: string[];
  hints: string[];
  tags: string[];
  acceptanceRate?: number;
  totalSubmissions: number;
}

export interface ICodingSubmission {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  code: string;
  language: CodingLanguage;
  status: SubmissionStatus;
  passedTestCases: number;
  totalTestCases: number;
  executionTime?: number;
  memoryUsed?: number;
  submittedAt?: Date;
}

export interface IReport {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  reportType: ReportType;
  overallAssessment: string;
  strengths: string[];
  areasToImprove: string[];
  recommendedSkills: RecommendedSkill[];
  recommendedProjects: RecommendedProject[];
  thirtyDayRoadmap: RoadmapWeek[];
  interviewsAnalyzed: number;
  averageScore: number;
  generatedAt?: Date;
}
