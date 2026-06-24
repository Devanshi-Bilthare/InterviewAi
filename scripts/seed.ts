import { readFileSync } from "fs";
import { resolve } from "path";
import bcrypt from "bcryptjs";

import connectDB from "../lib/mongodb";
import { ensureIndexes } from "../lib/mongodb-indexes";
import CodingProblem from "../models/CodingProblem";
import Question from "../models/Question";
import User from "../models/User";
import { codingProblemsSeed } from "../lib/seed/coding-problems-data";
import { sampleQuestionsSeed } from "../lib/seed/sample-questions";

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

async function seed() {
  loadEnvFile();

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await connectDB();
  await ensureIndexes();

  console.log("Seeding coding problems...");
  await CodingProblem.deleteMany({});
  const problems = await CodingProblem.insertMany(codingProblemsSeed);
  console.log(`  → ${problems.length} coding problems`);

  console.log("Seeding interview questions...");
  const existingQuestions = await Question.countDocuments({ isAIGenerated: false });
  if (existingQuestions === 0) {
    const questions = await Question.insertMany(
      sampleQuestionsSeed.map((q) => ({ ...q, isAIGenerated: false }))
    );
    console.log(`  → ${questions.length} sample questions`);
  } else {
    console.log(`  → Skipped (${existingQuestions} questions already exist)`);
  }

  console.log("Creating admin user...");
  const adminEmail = "admin@interviewai.com";
  const adminPassword = "Admin@123";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: "Platform Admin",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      role: "admin",
      onboardingCompleted: true,
      experienceLevel: "senior",
      targetRole: "Platform Administrator",
    });
    console.log(`  → Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    await User.findOneAndUpdate(
      { email: adminEmail },
      { role: "admin", onboardingCompleted: true }
    );
    console.log(`  → Admin already exists: ${adminEmail}`);
  }

  console.log("\nSeed complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
