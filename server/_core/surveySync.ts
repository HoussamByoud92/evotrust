export type SurveyRespondent = {
  name: string;
  email: string;
  phone: string;
  message?: string;
};

const SURVEY_GAS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbySzQ5oNBt2KRpmzJ9vUD34mQgPMHxxScMEFOtwjTfKcUIzU4xUFv_Kq7mFE0iruWrs1g/exec";

type SyncPayload = {
  sessionId: string;
  submittedAtIso: string;
  answers: Record<string, string | string[] | null>;
  respondent: SurveyRespondent;
};

function buildAdminHtml(payload: SyncPayload): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.6;">
    <h2 style="margin:0 0 12px 0;color:#262b2d;">Nouvelle reponse Barometre Diaspora</h2>
    <p><strong>Session:</strong> ${payload.sessionId}</p>
    <p><strong>Date:</strong> ${payload.submittedAtIso}</p>
    <p><strong>Nom:</strong> ${payload.respondent.name}</p>
    <p><strong>Email:</strong> ${payload.respondent.email}</p>
    <p><strong>Telephone:</strong> ${payload.respondent.phone}</p>
    <p><strong>Message:</strong> ${payload.respondent.message?.trim() || "Aucun message"}</p>
    <hr />
    <p style="margin-bottom:6px;"><strong>Reponses:</strong></p>
    <pre style="white-space:pre-wrap;background:#f8f8f8;padding:12px;border-radius:6px;">${JSON.stringify(payload.answers, null, 2)}</pre>
  </div>
  `.trim();
}

function buildUserHtml(payload: SyncPayload): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.7;">
    <h2 style="margin:0 0 12px 0;color:#262b2d;">Merci pour votre participation</h2>
    <p>Bonjour ${payload.respondent.name},</p>
    <p>Nous vous confirmons la reception de votre contribution au Barometre Diaspora EVOTRUST.</p>
    <p>Votre numero de session est <strong>${payload.sessionId}</strong>.</p>
    <p>Notre equipe analysera les reponses et reviendra vers vous avec les resultats de l'etude.</p>
    <p style="margin-top:18px;">Cordialement,<br/>Equipe EVOTRUST</p>
  </div>
  `.trim();
}

export async function syncSurveySubmissionToGas(payload: SyncPayload): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const body = {
      event: "evotrust_barometer_submission",
      sessionId: payload.sessionId,
      submittedAt: payload.submittedAtIso,
      respondent: payload.respondent,
      answers: payload.answers,
      sheetsRow: {
        sessionId: payload.sessionId,
        submittedAt: payload.submittedAtIso,
        name: payload.respondent.name,
        email: payload.respondent.email,
        phone: payload.respondent.phone,
        message: payload.respondent.message || "",
        answersJson: JSON.stringify(payload.answers),
      },
      notifications: {
        admin: {
          to: null,
          subject: "Nouvelle reponse - Barometre Diaspora EVOTRUST",
          html: buildAdminHtml(payload),
        },
        respondent: {
          to: payload.respondent.email,
          subject: "Merci pour votre participation - EVOTRUST",
          html: buildUserHtml(payload),
        },
      },
    };

    const response = await fetch(SURVEY_GAS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[SurveySync] GAS sync failed (${response.status}) ${detail}`);
      return;
    }
  } catch (error) {
    console.warn("[SurveySync] GAS sync error:", error);
  } finally {
    clearTimeout(timeout);
  }
}
