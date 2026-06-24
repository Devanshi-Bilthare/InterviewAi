import type { CodingLanguage } from "@/types";

export const LANGUAGE_IDS: Record<CodingLanguage, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
};

export interface ExecutionResult {
  status: string;
  statusId: number;
  stdout: string;
  stderr: string;
  executionTime: number;
  memory: number;
  passed: boolean;
}

interface Judge0Result {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  message: string | null;
}

const JUDGE0_BASE_URL =
  process.env.JUDGE0_API_URL ?? "https://ce.judge0.com";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (process.env.JUDGE0_RAPIDAPI_KEY) {
    headers["x-rapidapi-key"] = process.env.JUDGE0_RAPIDAPI_KEY;
    headers["x-rapidapi-host"] =
      process.env.JUDGE0_RAPIDAPI_HOST ?? "judge0-ce.p.rapidapi.com";
  } else if (process.env.JUDGE0_API_KEY) {
    headers["X-Auth-Token"] = process.env.JUDGE0_API_KEY;
  }

  return headers;
}

function mapStatusId(statusId: number): string {
  switch (statusId) {
    case 3:
      return "accepted";
    case 4:
      return "wrong-answer";
    case 5:
      return "time-limit";
    case 6:
      return "compilation-error";
    default:
      return "runtime-error";
  }
}

function normalizeOutput(value: string | null | undefined): string {
  return (value ?? "").trimEnd();
}

function outputsMatch(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

async function submitCode(
  code: string,
  language: CodingLanguage,
  stdin = ""
): Promise<string> {
  const response = await fetch(
    `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        source_code: code,
        language_id: LANGUAGE_IDS[language],
        stdin,
        cpu_time_limit: 5,
        memory_limit: 128000,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Judge0 submit failed: ${text}`);
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

async function getResult(token: string): Promise<Judge0Result> {
  const response = await fetch(
    `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false&fields=*`,
    { headers: getHeaders(), cache: "no-store" }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Judge0 result failed: ${text}`);
  }

  return response.json() as Promise<Judge0Result>;
}

async function pollResult(
  token: string,
  maxAttempts = 20,
  intervalMs = 1000
): Promise<Judge0Result> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await getResult(token);

    if (result.status.id > 2) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Judge0 execution timed out while polling");
}

export async function runCode(
  code: string,
  language: CodingLanguage,
  stdin = "",
  expectedOutput?: string
): Promise<ExecutionResult> {
  const token = await submitCode(code, language, stdin);
  const result = await pollResult(token);

  const stdout = normalizeOutput(result.stdout);
  const stderr = normalizeOutput(
    result.stderr || result.compile_output || result.message
  );
  const status = mapStatusId(result.status.id);
  const passed =
    status === "accepted" &&
    (expectedOutput === undefined || outputsMatch(stdout, expectedOutput));

  return {
    status:
      expectedOutput !== undefined && status === "accepted" && !passed
        ? "wrong-answer"
        : status,
    statusId: result.status.id,
    stdout,
    stderr,
    executionTime: parseFloat(result.time ?? "0") * 1000,
    memory: result.memory ?? 0,
    passed,
  };
}

export async function executeWithTestCases(
  code: string,
  language: CodingLanguage,
  testCases: Array<{ input: string; expectedOutput: string }>
): Promise<
  Array<
    ExecutionResult & {
      input: string;
      expectedOutput: string;
    }
  >
> {
  const results: Array<
    ExecutionResult & { input: string; expectedOutput: string }
  > = [];

  for (const testCase of testCases) {
    const result = await runCode(
      code,
      language,
      testCase.input,
      testCase.expectedOutput
    );
    results.push({
      ...result,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
    });
  }

  return results;
}
