import { useState, useCallback, useEffect } from "react";
import { QUESTIONS, THEMES } from "@/data/questions";
import { trpc } from "@/lib/trpc";
import { nanoid } from "nanoid";
import { motion, AnimatePresence } from "framer-motion";

const GOLD = "#c29c5e";
const sessionId = nanoid();

type Answers = Record<string, string | string[] | null>;

export default function Survey() {
  const [step, setStep] = useState<"landing" | "survey" | "done">("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.survey.submit.useMutation();
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
      handleSubmit();
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
    try {
      await submitMutation.mutateAsync({ answers, sessionId });
      setStep("done");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  }, [answers, submitMutation]);

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
  if (step === "done") return <ConfirmationPage />;

  const questionImage = question?.image || currentTheme?.image || "/manus-storage/img_cover_92b3b2c3.jpg";
  const currentAnswer = answers[question?.id || ""];
  const isMultiple = question?.type === "multiple";
  const selectedMultiple = (currentAnswer as string[]) || [];
  const isLastQuestion = currentIndex === total - 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#28201d" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(194,156,94,0.15)" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 600, letterSpacing: "0.05em", color: "#ffffff" }}>
            evo<span style={{ color: GOLD }}>t</span>rust
          </span>
          <span style={{ color: "rgba(194,156,94,0.5)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>
            Connecting Talents
          </span>
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
                  background: "linear-gradient(to top, rgba(40,32,29,0.75) 0%, rgba(40,32,29,0.2) 55%, rgba(40,32,29,0.05) 100%)",
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
                              background: isMultiple ? "#28201d" : "transparent",
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
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #28201d 0%, rgba(40,32,29,0.3) 40%, rgba(40,32,29,0.1) 100%)" }} />
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
          disabled={submitMutation.isPending}
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#28201d",
            background: GOLD,
            border: "none",
            cursor: "pointer",
            padding: "12px 32px",
            borderRadius: "1px",
            fontWeight: 600,
            transition: "all 0.2s ease",
            opacity: submitMutation.isPending ? 0.7 : 1,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#c29c5e"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = GOLD; }}
        >
          {submitMutation.isPending ? "Envoi..." : isLastQuestion ? "Soumettre" : "Suivant"}
        </button>
      </div>
    </div>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#28201d" }}>
      <div className="flex flex-1">
        {/* Left content */}
        <div className="flex flex-col justify-between px-12 py-12 flex-1 max-w-2xl">
          {/* Logo */}
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 600, letterSpacing: "0.05em", color: "#ffffff" }}>
              evo<span style={{ color: GOLD }}>t</span>rust
            </div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(194,156,94,0.5)", marginTop: "4px" }}>
              Connecting Talents
            </div>
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
                color: "#28201d",
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
              backgroundImage: `url(/manus-storage/img_cover_92b3b2c3.jpg)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #28201d 0%, rgba(40,32,29,0.5) 50%, rgba(40,32,29,0.15) 100%)" }} />
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

function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#28201d" }}>
      <div className="flex flex-col items-center gap-8 text-center px-8" style={{ maxWidth: "560px" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 600, letterSpacing: "0.05em", color: "#ffffff" }}>
          evo<span style={{ color: GOLD }}>t</span>rust
        </div>

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
            color: "#28201d",
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



