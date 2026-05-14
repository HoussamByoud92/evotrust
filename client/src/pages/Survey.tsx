import { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from "react";
import { QUESTIONS, THEMES } from "@/data/questions";
import { nanoid } from "nanoid";
import { motion, AnimatePresence } from "framer-motion";

const GOLD = "#c29c5e";
const sessionId = nanoid();
const LOGO_SRC = "/logo-evotrust.png";

const STEP_IMAGE_BY_QUESTION_ID: Record<string, string> = {
  q1: "https://images.pexels.com/photos/4344114/pexels-photo-4344114.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q2: "https://images.pexels.com/photos/4342126/pexels-photo-4342126.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q3: "https://images.pexels.com/photos/4343027/pexels-photo-4343027.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q4: "https://images.pexels.com/photos/4343206/pexels-photo-4343206.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q5: "https://images.pexels.com/photos/4345109/pexels-photo-4345109.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q6: "https://images.pexels.com/photos/4344116/pexels-photo-4344116.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q7: "https://images.pexels.com/photos/18999158/pexels-photo-18999158.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q8: "https://images.pexels.com/photos/8068833/pexels-photo-8068833.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q9: "https://images.pexels.com/photos/7495493/pexels-photo-7495493.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q10: "https://images.pexels.com/photos/6930273/pexels-photo-6930273.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q11: "https://images.pexels.com/photos/7652044/pexels-photo-7652044.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q12: "https://images.pexels.com/photos/7654407/pexels-photo-7654407.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q13: "https://images.pexels.com/photos/6146812/pexels-photo-6146812.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q14: "https://images.pexels.com/photos/7652049/pexels-photo-7652049.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q15: "https://images.pexels.com/photos/7652046/pexels-photo-7652046.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q16: "https://images.pexels.com/photos/5946207/pexels-photo-5946207.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q17: "https://images.pexels.com/photos/7495557/pexels-photo-7495557.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q18: "https://images.pexels.com/photos/6913217/pexels-photo-6913217.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q19: "https://images.pexels.com/photos/6914012/pexels-photo-6914012.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q20: "https://images.pexels.com/photos/8519089/pexels-photo-8519089.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q21: "https://images.pexels.com/photos/6150528/pexels-photo-6150528.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q22: "https://images.pexels.com/photos/7648222/pexels-photo-7648222.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q23: "https://images.pexels.com/photos/6248968/pexels-photo-6248968.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q24: "https://images.pexels.com/photos/7495649/pexels-photo-7495649.jpeg?auto=compress&cs=tinysrgb&w=1600",
  q25: "https://images.pexels.com/photos/7652256/pexels-photo-7652256.jpeg?auto=compress&cs=tinysrgb&w=1600",
};

const IMG_MOROCCAN_CORPORATE = STEP_IMAGE_BY_QUESTION_ID.q2;
const IMG_MOROCCAN_EXEC_TEAM = STEP_IMAGE_BY_QUESTION_ID.q6;

type Answers = Record<string, string | string[] | null>;
type RespondentInfo = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

async function submitSurveyViaServer(payload: {
  sessionId: string;
  answers: Answers;
  respondent: RespondentInfo;
}) {
  const body = {
    event: "evotrust_barometer_submission",
    sessionId: payload.sessionId,
    submittedAt: new Date().toISOString(),
    respondent: payload.respondent,
    answers: payload.answers,
    sheetsRow: {
      sessionId: payload.sessionId,
      submittedAt: new Date().toISOString(),
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
      },
      respondent: {
        to: payload.respondent.email,
        subject: "Merci pour votre participation - EVOTRUST",
      },
    },
  };

  const response = await fetch("/api/survey-submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Survey submit failed (${response.status}) ${details}`);
  }
}

export default function Survey() {
  const [step, setStep] = useState<"landing" | "survey" | "contact" | "done">("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [respondent, setRespondent] = useState<RespondentInfo>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const question = QUESTIONS[currentIndex];
  const total = QUESTIONS.length;
  const progress = ((currentIndex) / total) * 100;
  const currentTheme = THEMES.find(t => t.id === question?.theme);

  const handleAnswer = useCallback((value: string) => {
    if (!question) return;
    if (question.type === "single" || question.type === "scale") {
      setAnswers(prev => ({ ...prev, [question.id]: value }));
      setError(null);
    }
  }, [question]);

  const handleMultiAnswer = useCallback((value: string) => {
    if (!question) return;
    const current = (answers[question.id] as string[]) || [];
    const max = question.maxChoices || 99;
    if (current.includes(value)) {
      setAnswers(prev => ({ ...prev, [question.id]: current.filter(v => v !== value) }));
    } else if (current.length < max) {
      setAnswers(prev => ({ ...prev, [question.id]: [...current, value] }));
    }
    setError(null);
  }, [question, answers]);

  const handleOpenAnswer = useCallback((value: string) => {
    if (!question) return;
    setAnswers(prev => ({ ...prev, [question.id]: value }));
    setError(null);
  }, [question]);

  const handleNext = useCallback(() => {
    if (!question) return;
    if (question.required && !answers[question.id]) {
      setError("Merci de répondre à cette question avant de continuer.");
      return;
    }
    if (currentIndex < total - 1) {
      setDirection(1);
      setCurrentIndex(i => i + 1);
      setError(null);
    } else {
      setStep("contact");
      setError(null);
    }
  }, [question, answers, currentIndex, total]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(i => i - 1);
      setError(null);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    const email = respondent.email.trim();
    const phone = respondent.phone.trim();
    const name = respondent.name.trim();

    if (!name) {
      setError("Merci d'indiquer votre nom complet.");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Merci d'indiquer une adresse e-mail valide.");
      return;
    }
    if (!phone) {
      setError("Merci d'indiquer votre numéro de téléphone.");
      return;
    }

    try {
      setIsSubmitting(true);
      const respondentPayload = {
        name,
        email,
        phone,
        message: respondent.message.trim(),
      };
      await submitSurveyViaServer({
        answers,
        sessionId,
        respondent: respondentPayload,
      });
      setStep("done");
      setError(null);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, respondent]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (step !== "survey") return;
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, handleNext, handlePrev]);

  if (step === "landing") return <LandingPage onStart={() => setStep("survey")} />;
  if (step === "contact") {
    return (
      <ContactStep
        respondent={respondent}
        setRespondent={setRespondent}
        onBack={() => {
          setStep("survey");
          setCurrentIndex(total - 1);
          setError(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    );
  }
  if (step === "done") return <ConfirmationPage />;

  const questionImage =
    (question?.id ? STEP_IMAGE_BY_QUESTION_ID[question.id] : undefined) ||
    STEP_IMAGE_BY_QUESTION_ID.q1;
  const currentAnswer = answers[question?.id || ""];
  const isMultiple = question?.type === "multiple";
  const selectedMultiple = (currentAnswer as string[]) || [];
  const isLastQuestion = currentIndex === total - 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#262b2d" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(194,156,94,0.15)" }}>
        <div className="flex items-center gap-3">
          <img
            src={LOGO_SRC}
            alt="EVOTRUST logo"
            className="h-9 w-auto object-contain"
          />
        </div>
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(194,156,94,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Baromètre Diaspora 2025–2026
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full h-px" style={{ background: "rgba(194,156,94,0.1)" }}>
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, rgba(194,156,94,0.4), ${GOLD})` }}
        />
      </div>

      {/* Theme indicator */}
      <div className="flex items-center gap-6 px-8 py-3" style={{ borderBottom: "1px solid rgba(194,156,94,0.08)" }}>
        {THEMES.map(theme => (
          <div
            key={theme.id}
            className="flex items-center gap-2"
            style={{
              opacity: theme.id === question?.theme ? 1 : 0.3,
              transition: "opacity 0.4s ease",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: theme.id === question?.theme ? GOLD : "rgba(194,156,94,0.4)",
                transition: "background 0.4s ease",
              }}
            />
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: theme.id === question?.theme ? GOLD : "rgba(194,156,94,0.5)",
            }}>
              {theme.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Mobile / Tablet: Question image per step */}
        <div className="lg:hidden px-6 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`mobile-${question?.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-[190px] sm:h-[230px] overflow-hidden rounded-sm border"
              style={{ borderColor: "rgba(194,156,94,0.25)" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${questionImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(38,43,45,0.75) 0%, rgba(38,43,45,0.2) 55%, rgba(38,43,45,0.05) 100%)",
                }}
              />
              <div className="absolute left-4 bottom-4 right-4">
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "10px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(194,156,94,0.9)",
                    marginBottom: "4px",
                  }}
                >
                  {currentTheme?.questions}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#ffffff",
                    letterSpacing: "0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {currentTheme?.label}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Left: Question */}
        <div className="flex flex-col flex-1 justify-center px-6 lg:px-12 py-8 lg:py-10 max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={question?.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col gap-8"
            >
              {/* Question number */}
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.2em", color: "rgba(194,156,94,0.5)", textTransform: "uppercase" }}>
                Question {question?.number} sur {total}
              </div>

              {/* Question text */}
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(22px, 3vw, 34px)",
                fontWeight: 500,
                lineHeight: 1.3,
                color: "#ffffff",
                letterSpacing: "0.01em",
              }}>
                {question?.text}
              </h2>

              {/* Multiple choice hint */}
              {isMultiple && question?.maxChoices && (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "rgba(194,156,94,0.6)", letterSpacing: "0.05em" }}>
                  Sélectionnez jusqu'à {question.maxChoices} réponse{question.maxChoices > 1 ? "s" : ""}
                  {selectedMultiple.length > 0 && ` — ${selectedMultiple.length}/${question.maxChoices} sélectionné${selectedMultiple.length > 1 ? "s" : ""}`}
                </p>
              )}

              {/* Options */}
              {question?.type !== "open" && question?.options && (
                <div className="flex flex-col gap-3">
                  {question.options.map((option) => {
                    const isSelected = isMultiple
                      ? selectedMultiple.includes(option)
                      : currentAnswer === option;
                    const isDisabled = isMultiple && !isSelected && selectedMultiple.length >= (question.maxChoices || 99);

                    return (
                      <button
                        key={option}
                        onClick={() => isMultiple ? handleMultiAnswer(option) : handleAnswer(option)}
                        disabled={isDisabled}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "14px 20px",
                          background: isSelected ? "rgba(194,156,94,0.12)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${isSelected ? GOLD : "rgba(194,156,94,0.2)"}`,
                          borderRadius: "2px",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.35 : 1,
                          transition: "all 0.2s ease",
                          textAlign: "left",
                          width: "100%",
                        }}
                        onMouseEnter={e => {
                          if (!isSelected && !isDisabled) {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(194,156,94,0.5)";
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(194,156,94,0.05)";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(194,156,94,0.2)";
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)";
                          }
                        }}
                      >
                        <div style={{
                          width: "18px",
                          height: "18px",
                          border: `1px solid ${isSelected ? GOLD : "rgba(194,156,94,0.3)"}`,
                          borderRadius: isMultiple ? "2px" : "50%",
                          flexShrink: 0,
                          background: isSelected ? GOLD : "transparent",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          {isSelected && (
                            <div style={{
                              width: isMultiple ? "10px" : "8px",
                              height: isMultiple ? "10px" : "8px",
                              background: isMultiple ? "#262b2d" : "transparent",
                              borderRadius: isMultiple ? "1px" : "50%",
                            }} />
                          )}
                        </div>
                        <span style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "14px",
                          color: isSelected ? "#ffffff" : "rgba(255,255,255,0.7)",
                          fontWeight: isSelected ? 500 : 400,
                          letterSpacing: "0.02em",
                          lineHeight: 1.4,
                        }}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Open text */}
              {question?.type === "open" && (
                <textarea
                  value={(currentAnswer as string) || ""}
                  onChange={e => handleOpenAnswer(e.target.value)}
                  placeholder="Votre réponse..."
                  rows={5}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(194,156,94,0.25)",
                    borderRadius: "2px",
                    padding: "16px 20px",
                    color: "#ffffff",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "16px",
                    lineHeight: 1.7,
                    resize: "vertical",
                    outline: "none",
                  }}
                  onFocus={e => { e.target.style.borderColor = GOLD; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(194,156,94,0.25)"; }}
                />
              )}

              {/* Error */}
              {error && (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#c29c5e", letterSpacing: "0.05em" }}>
                  {error}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Image */}
        <div className="hidden lg:block flex-1 relative overflow-hidden" style={{ maxWidth: "45%" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`desktop-${question?.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${questionImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #262b2d 0%, rgba(38,43,45,0.3) 40%, rgba(38,43,45,0.1) 100%)" }} />
              {/* Theme label overlay */}
              <div style={{
                position: "absolute",
                bottom: "40px",
                right: "40px",
                textAlign: "right",
              }}>
                <div style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(194,156,94,0.7)",
                  marginBottom: "6px",
                }}>
                  {currentTheme?.questions}
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "20px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                  letterSpacing: "0.02em",
                }}>
                  {currentTheme?.label}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-12 py-6" style={{ borderTop: "1px solid rgba(194,156,94,0.1)" }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: currentIndex === 0 ? "rgba(194,156,94,0.2)" : "rgba(194,156,94,0.6)",
            background: "transparent",
            border: "none",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            padding: "8px 0",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={e => { if (currentIndex > 0) (e.currentTarget as HTMLButtonElement).style.color = GOLD; }}
          onMouseLeave={e => { if (currentIndex > 0) (e.currentTarget as HTMLButtonElement).style.color = "rgba(194,156,94,0.6)"; }}
        >
          Précédent
        </button>

        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(194,156,94,0.4)", letterSpacing: "0.1em" }}>
          {currentIndex + 1} / {total}
        </div>

        <button
          onClick={handleNext}
          disabled={isSubmitting}
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#262b2d",
            background: GOLD,
            border: "none",
            cursor: "pointer",
            padding: "12px 32px",
            borderRadius: "1px",
            fontWeight: 600,
            transition: "all 0.2s ease",
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#c29c5e"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = GOLD; }}
        >
          {isSubmitting ? "Envoi..." : isLastQuestion ? "Continuer" : "Suivant"}
        </button>
      </div>
    </div>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#262b2d" }}>
      <div className="flex flex-1">
        {/* Left content */}
        <div className="flex flex-col justify-between px-12 py-12 flex-1 max-w-2xl">
          {/* Logo */}
          <div>
            <img
              src={LOGO_SRC}
              alt="EVOTRUST logo"
              className="h-14 md:h-16 w-auto object-contain"
            />
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-8">
            <div style={{ width: "40px", height: "2px", background: GOLD }} />

            <div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(194,156,94,0.6)", marginBottom: "16px" }}>
                Édition 2025–2026
              </div>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(36px, 5vw, 60px)",
                fontWeight: 400,
                lineHeight: 1.1,
                color: "#ffffff",
                letterSpacing: "-0.01em",
              }}>
                Baromètre<br />
                <span style={{ color: GOLD }}>Diaspora</span>
              </h1>
            </div>

            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "18px",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.65)",
              maxWidth: "440px",
            }}>
              25 questions. 5 thématiques. Une étude exclusive sur les attentes, les freins et les aspirations des talents marocains à l'international.
            </p>

            <div className="flex gap-8" style={{ borderTop: "1px solid rgba(194,156,94,0.15)", paddingTop: "24px" }}>
              {[
                { value: "25", label: "Questions" },
                { value: "5", label: "Thématiques" },
                { value: "10 min", label: "Durée estimée" },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 600, color: GOLD }}>{item.value}</div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(194,156,94,0.5)", marginTop: "2px" }}>{item.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={onStart}
              style={{
                alignSelf: "flex-start",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "12px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "#262b2d",
                background: GOLD,
                border: "none",
                padding: "16px 48px",
                borderRadius: "1px",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#c29c5e";
                (e.currentTarget as HTMLButtonElement).style.letterSpacing = "0.25em";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = GOLD;
                (e.currentTarget as HTMLButtonElement).style.letterSpacing = "0.2em";
              }}
            >
              Commencer
            </button>
          </div>

          {/* Footer */}
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(194,156,94,0.3)", letterSpacing: "0.1em" }}>
            Document confidentiel · EVOTRUST · Casablanca
          </div>
        </div>

        {/* Right: Hero image */}
        <div className="hidden lg:block flex-1 relative overflow-hidden">
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${IMG_MOROCCAN_EXEC_TEAM})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #262b2d 0%, rgba(38,43,45,0.5) 50%, rgba(38,43,45,0.15) 100%)" }} />
          </div>
          {/* Decorative quote */}
          <div style={{
            position: "absolute",
            bottom: "60px",
            right: "50px",
            maxWidth: "280px",
            textAlign: "right",
          }}>
            <div style={{ width: "30px", height: "1px", background: GOLD, marginLeft: "auto", marginBottom: "16px" }} />
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "17px",
              fontStyle: "italic",
              fontWeight: 300,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.6,
            }}>
              Great people makes great companies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactStep({
  respondent,
  setRespondent,
  onBack,
  onSubmit,
  isSubmitting,
  error,
}: {
  respondent: RespondentInfo;
  setRespondent: Dispatch<SetStateAction<RespondentInfo>>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#262b2d" }}>
      <header className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(194,156,94,0.15)" }}>
        <img src={LOGO_SRC} alt="EVOTRUST logo" className="h-9 w-auto object-contain" />
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(194,156,94,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Finaliser votre participation
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 px-6 lg:px-12 py-8 lg:py-12 max-w-3xl">
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.2em", color: "rgba(194,156,94,0.55)", textTransform: "uppercase", marginBottom: "14px" }}>
            Étape finale
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 42px)", color: "#ffffff", fontWeight: 500, lineHeight: 1.2 }}>
            Vos coordonnées
          </h2>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.68)", marginTop: "10px", lineHeight: 1.7 }}>
            Merci de renseigner vos informations. Le message est facultatif.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={respondent.name}
              onChange={e => setRespondent(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nom complet *"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(194,156,94,0.28)",
                color: "#ffffff",
                borderRadius: "2px",
                padding: "12px 14px",
                outline: "none",
                fontFamily: "'Montserrat', sans-serif",
              }}
            />
            <input
              type="email"
              value={respondent.email}
              onChange={e => setRespondent(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email *"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(194,156,94,0.28)",
                color: "#ffffff",
                borderRadius: "2px",
                padding: "12px 14px",
                outline: "none",
                fontFamily: "'Montserrat', sans-serif",
              }}
            />
            <input
              value={respondent.phone}
              onChange={e => setRespondent(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Téléphone *"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(194,156,94,0.28)",
                color: "#ffffff",
                borderRadius: "2px",
                padding: "12px 14px",
                outline: "none",
                fontFamily: "'Montserrat', sans-serif",
              }}
            />
            <div />
            <textarea
              value={respondent.message}
              onChange={e => setRespondent(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Message (facultatif)"
              rows={5}
              className="md:col-span-2"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(194,156,94,0.28)",
                color: "#ffffff",
                borderRadius: "2px",
                padding: "14px",
                outline: "none",
                resize: "vertical",
                fontFamily: "'Montserrat', sans-serif",
              }}
            />
          </div>

          {error ? (
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#c29c5e", marginTop: "12px", letterSpacing: "0.04em" }}>
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={onBack}
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(194,156,94,0.65)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "10px 0",
              }}
            >
              Retour
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#262b2d",
                background: GOLD,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                padding: "12px 30px",
                borderRadius: "1px",
                fontWeight: 600,
                opacity: isSubmitting ? 0.75 : 1,
              }}
            >
              {isSubmitting ? "Envoi..." : "Soumettre"}
            </button>
          </div>
        </div>

        <div className="hidden lg:block flex-1 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${IMG_MOROCCAN_CORPORATE})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #262b2d 0%, rgba(38,43,45,0.3) 40%, rgba(38,43,45,0.1) 100%)" }} />
        </div>
      </div>
    </div>
  );
}

function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#262b2d" }}>
      <div className="flex flex-col items-center gap-8 text-center px-8" style={{ maxWidth: "560px" }}>
        <img
          src={LOGO_SRC}
          alt="EVOTRUST logo"
          className="h-12 w-auto object-contain"
        />

        <div style={{ width: "40px", height: "1px", background: GOLD }} />

        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 400,
          color: "#ffffff",
          lineHeight: 1.2,
        }}>
          Merci pour votre contribution
        </h2>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "17px",
          fontWeight: 300,
          color: "rgba(255,255,255,0.65)",
          lineHeight: 1.8,
        }}>
          Vos réponses ont bien été enregistrées. Elles contribueront à mieux comprendre les attentes et les aspirations des talents marocains à l'international.
        </p>

        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "12px",
          color: "rgba(194,156,94,0.6)",
          letterSpacing: "0.08em",
          lineHeight: 1.7,
        }}>
          EVOTRUST vous recontactera prochainement avec les résultats de cette étude exclusive.
        </p>

        <div style={{ width: "40px", height: "1px", background: "rgba(194,156,94,0.3)" }} />

        <a
          href="https://www.evotrust.ma"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#262b2d",
            background: GOLD,
            padding: "14px 40px",
            borderRadius: "1px",
            textDecoration: "none",
            fontWeight: 600,
            transition: "background 0.2s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#c29c5e"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = GOLD; }}
        >
          Découvrir EVOTRUST
        </a>

        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(194,156,94,0.25)", letterSpacing: "0.1em" }}>
          Document confidentiel · EVOTRUST · Casablanca
        </p>
      </div>
    </div>
  );
}





