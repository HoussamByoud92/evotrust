const SURVEY_GAS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbySzQ5oNBt2KRpmzJ9vUD34mQgPMHxxScMEFOtwjTfKcUIzU4xUFv_Kq7mFE0iruWrs1g/exec";

type JsonRecord = Record<string, unknown>;

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as JsonRecord;

    const upstream = await fetch(SURVEY_GAS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
