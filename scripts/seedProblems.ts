import { readFileSync } from "fs";
import { resolve } from "path";

import connectDB from "../lib/mongodb";
import CodingProblem from "../models/CodingProblem";
import { codingProblemsSeed } from "../lib/seed/coding-problems-data";

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
    // .env.local is optional if env vars are already set
  }
}

async function seedProblems() {
  loadEnvFile();

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await connectDB();

  const count = await CodingProblem.countDocuments();
  if (count > 0) {
    console.log(`Database already has ${count} problems. Clearing...`);
    await CodingProblem.deleteMany({});
  }

  const inserted = await CodingProblem.insertMany(codingProblemsSeed);
  console.log(`Seeded ${inserted.length} coding problems.`);

  const byCategory = inserted.reduce<Record<string, number>>((acc, problem) => {
    acc[problem.category] = (acc[problem.category] ?? 0) + 1;
    return acc;
  }, {});

  console.log("By category:", byCategory);
  process.exit(0);
}

seedProblems().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
