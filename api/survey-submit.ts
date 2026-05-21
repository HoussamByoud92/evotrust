const SURVEY_GAS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbySzQ5oNBt2KRpmzJ9vUD34mQgPMHxxScMEFOtwjTfKcUIzU4xUFv_Kq7mFE0iruWrs1g/exec";
const GAS_SHEET_NAME = "Barometer_responses_2";

type JsonRecord = Record<string, unknown>;

function normalizeAnswerValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map(v => v.trim())
      .filter(Boolean)
      .join(" | ");
  }
  if (typeof value === "string") return value.trim();
  if (value == null) return "";
  return String(value);
}

function extractNumericScore(value: unknown): number[] {
  const values = Array.isArray(value) ? value : [value];
  const scores: number[] = [];

  for (const item of values) {
    if (typeof item !== "string") continue;
    const text = item.trim();
    if (!text) continue;

    // Accept explicit numeric answers like "2", "2.5", or scale labels
    // prefixed with a number like "3 Oui, c'est mon projet".
    const direct = text.match(/^-?\d+(?:[.,]\d+)?$/);
    const prefixed = text.match(/^(-?\d+(?:[.,]\d+)?)\s+.+$/);
    const candidate = direct?.[0] ?? prefixed?.[1];
    if (!candidate) continue;

    const parsed = Number(candidate.replace(",", "."));
    if (!Number.isNaN(parsed)) scores.push(parsed);
  }

  return scores;
}

function buildQuestionColumns(answers: JsonRecord): {
  questionColumns: Record<string, string>;
  averageAnswer: string;
} {
  const questionColumns: Record<string, string> = {};
  const numericScores: number[] = [];

  for (let i = 1; i <= 25; i += 1) {
    const key = `q${i}`;
    const rawValue = answers[key];
    questionColumns[`Q${i}`] = normalizeAnswerValue(rawValue);
    numericScores.push(...extractNumericScore(rawValue));
  }

  if (numericScores.length === 0) {
    return { questionColumns, averageAnswer: "" };
  }

  const sum = numericScores.reduce((acc, n) => acc + n, 0);
  const avg = sum / numericScores.length;
  return { questionColumns, averageAnswer: avg.toFixed(2) };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as JsonRecord;
    const answers = ((body.answers as JsonRecord | undefined) ?? {}) as JsonRecord;
    const respondent = ((body.respondent as JsonRecord | undefined) ?? {}) as JsonRecord;
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    const submittedAt =
      typeof body.submittedAt === "string" && body.submittedAt.trim()
        ? body.submittedAt
        : new Date().toISOString();

    const { questionColumns, averageAnswer } = buildQuestionColumns(answers);

    // Sheet columns layout:
    // Q1 ... Q25, AverageAnswer (column 26), then respondent/session metadata.
    const sheetsRow: JsonRecord = {
      ...questionColumns,
      AverageAnswer: averageAnswer,
      SessionId: sessionId,
      SubmittedAt: submittedAt,
      LastName: typeof respondent.lastName === "string" ? respondent.lastName.trim() : "",
      FirstName: typeof respondent.firstName === "string" ? respondent.firstName.trim() : "",
      Email: typeof respondent.email === "string" ? respondent.email.trim() : "",
      Phone: typeof respondent.phone === "string" ? respondent.phone.trim() : "",
      Role: typeof respondent.role === "string" ? respondent.role.trim() : "",
      Sector: typeof respondent.sector === "string" ? respondent.sector.trim() : "",
    };

    const gasPayload: JsonRecord = {
      ...body,
      sheetName:
        typeof body.sheetName === "string" && body.sheetName.trim()
          ? body.sheetName
          : GAS_SHEET_NAME,
      targetSheetName:
        typeof body.targetSheetName === "string" && body.targetSheetName.trim()
          ? body.targetSheetName
          : (typeof body.sheetName === "string" && body.sheetName.trim() ? body.sheetName : GAS_SHEET_NAME),
      sheet_name:
        typeof body.sheet_name === "string" && body.sheet_name.trim()
          ? body.sheet_name
          : (typeof body.sheetName === "string" && body.sheetName.trim() ? body.sheetName : GAS_SHEET_NAME),
      sessionId,
      submittedAt,
      answers,
      respondent,
      sheetsRow,
    };

    const upstream = await fetch(SURVEY_GAS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gasPayload),
    });

    const responseText = await upstream.text();
    if (!upstream.ok) {
      return Response.json(
        { success: false, error: "GAS upstream failed", details: responseText },
        { status: 502 }
      );
    }

    return new Response(responseText || JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "survey_submit_failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
