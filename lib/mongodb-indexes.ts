import mongoose from "mongoose";

export async function ensureIndexes() {
  if (!mongoose.connection.db) return;

  const db = mongoose.connection.db;

  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("users").createIndex({ createdAt: -1 }),
    db.collection("interviewsessions").createIndex({ userId: 1, status: 1 }),
    db.collection("interviewsessions").createIndex({ userId: 1, completedAt: -1 }),
    db.collection("interviewsessions").createIndex({ category: 1 }),
    db.collection("interviewsessions").createIndex({ createdAt: -1 }),
    db.collection("answers").createIndex({ sessionId: 1 }),
    db.collection("answers").createIndex({ userId: 1 }),
    db.collection("evaluations").createIndex({ sessionId: 1 }),
    db.collection("evaluations").createIndex({ userId: 1 }),
    db.collection("questions").createIndex({ category: 1, difficulty: 1 }),
    db.collection("codingsubmissions").createIndex({ userId: 1, problemId: 1 }),
    db.collection("notifications").createIndex({ userId: 1, read: 1, createdAt: -1 }),
  ]);
}
