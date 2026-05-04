import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const GOLD = "#c29c5e";

export default function Admin() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const responsesQuery = trpc.admin.getResponses.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const exportQuery = trpc.admin.exportCsv.useQuery(undefined, {
    enabled: false,
  });

  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (result.data?.csv) {
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `evotrust-barometre-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#28201d" }}>
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "rgba(194,156,94,0.5)", letterSpacing: "0.15em" }}>
          Chargement...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "#28201d" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", color: "#ffffff" }}>
          evo<span style={{ color: GOLD }}>t</span>rust
        </div>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>
          Accès réservé aux administrateurs
        </p>
        <a
          href={getLoginUrl()}
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#28201d",
            background: GOLD,
            padding: "12px 32px",
            borderRadius: "1px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Se connecter
        </a>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#28201d" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", color: "#ffffff" }}>
          Accès refusé
        </p>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }

  const responses = responsesQuery.data || [];
  const totalPages = Math.ceil(responses.length / pageSize);
  const paginatedResponses = responses.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="min-h-screen" style={{ background: "#28201d" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(194,156,94,0.15)" }}>
        <div className="flex items-center gap-4">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 600, letterSpacing: "0.05em", color: "#ffffff" }}>
            evo<span style={{ color: GOLD }}>t</span>rust
          </div>
          <span style={{ color: "rgba(194,156,94,0.3)", fontSize: "14px" }}>|</span>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(194,156,94,0.6)" }}>
            Administration
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(194,156,94,0.4)" }}>
            {user.name || user.email}
          </span>
          <a
            href="/dashboard"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(194,156,94,0.7)",
              textDecoration: "none",
              border: "1px solid rgba(194,156,94,0.3)",
              padding: "6px 16px",
              borderRadius: "1px",
            }}
          >
            Tableau de bord
          </a>
          <a
            href="/"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(194,156,94,0.5)",
              textDecoration: "none",
              border: "1px solid rgba(194,156,94,0.2)",
              padding: "6px 16px",
              borderRadius: "1px",
            }}
          >
            Retour
          </a>
        </div>
      </header>

      <div className="px-8 py-10">
        {/* Stats */}
        <div className="flex gap-8 mb-10">
          <div style={{ padding: "24px 32px", background: "rgba(194,156,94,0.06)", border: "1px solid rgba(194,156,94,0.15)", borderRadius: "2px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "40px", fontWeight: 600, color: GOLD }}>
              {responses.length}
            </div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(194,156,94,0.5)", marginTop: "4px" }}>
              Réponses collectées
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 500, color: "#ffffff" }}>
            Réponses du Baromètre
          </h2>
          <button
            onClick={handleExport}
            disabled={exportQuery.isFetching || responses.length === 0}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#28201d",
              background: responses.length === 0 ? "rgba(194,156,94,0.3)" : GOLD,
              border: "none",
              padding: "10px 24px",
              borderRadius: "1px",
              cursor: responses.length === 0 ? "not-allowed" : "pointer",
              fontWeight: 600,
              transition: "background 0.2s ease",
            }}
          >
            {exportQuery.isFetching ? "Export..." : "Exporter CSV"}
          </button>
        </div>

        {/* Table */}
        {responsesQuery.isLoading ? (
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "rgba(194,156,94,0.4)", padding: "40px 0", textAlign: "center" }}>
            Chargement des réponses...
          </div>
        ) : responses.length === 0 ? (
          <div style={{
            padding: "60px 40px",
            textAlign: "center",
            border: "1px solid rgba(194,156,94,0.1)",
            borderRadius: "2px",
          }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "rgba(255,255,255,0.4)" }}>
              Aucune réponse enregistrée pour le moment.
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(194,156,94,0.2)" }}>
                    {["ID", "Session", "Date de soumission", "Réponses"].map(col => (
                      <th key={col} style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "10px",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(194,156,94,0.6)",
                        fontWeight: 500,
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedResponses.map((response, i) => {
                    const answers = response.answers as Record<string, unknown>;
                    const answerCount = Object.keys(answers).filter(k => answers[k] !== null && answers[k] !== "").length;
                    return (
                      <tr
                        key={response.id}
                        style={{
                          borderBottom: "1px solid rgba(194,156,94,0.06)",
                          background: i % 2 === 0 ? "transparent" : "rgba(194,156,94,0.02)",
                        }}
                      >
                        <td style={{ padding: "14px 16px", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "rgba(194,156,94,0.6)" }}>
                          #{response.id}
                        </td>
                        <td style={{ padding: "14px 16px", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.03em" }}>
                          {response.sessionId.substring(0, 12)}...
                        </td>
                        <td style={{ padding: "14px 16px", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                          {new Date(response.completedAt).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "long", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <ResponseDetail answers={answers} answerCount={answerCount} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: page === 0 ? "rgba(194,156,94,0.2)" : "rgba(194,156,94,0.6)",
                    background: "transparent",
                    border: "1px solid",
                    borderColor: page === 0 ? "rgba(194,156,94,0.1)" : "rgba(194,156,94,0.2)",
                    padding: "8px 20px",
                    borderRadius: "1px",
                    cursor: page === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Précédent
                </button>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(194,156,94,0.4)" }}>
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: page === totalPages - 1 ? "rgba(194,156,94,0.2)" : "rgba(194,156,94,0.6)",
                    background: "transparent",
                    border: "1px solid",
                    borderColor: page === totalPages - 1 ? "rgba(194,156,94,0.1)" : "rgba(194,156,94,0.2)",
                    padding: "8px 20px",
                    borderRadius: "1px",
                    cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ResponseDetail({ answers, answerCount }: { answers: Record<string, unknown>; answerCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.1em",
          color: GOLD,
          background: "transparent",
          border: "1px solid rgba(194,156,94,0.25)",
          padding: "6px 14px",
          borderRadius: "1px",
          cursor: "pointer",
        }}
      >
        {answerCount} réponse{answerCount > 1 ? "s" : ""} {open ? "—" : "+"}
      </button>
      {open && (
        <div style={{
          marginTop: "12px",
          padding: "16px",
          background: "rgba(194,156,94,0.04)",
          border: "1px solid rgba(194,156,94,0.1)",
          borderRadius: "2px",
          maxHeight: "300px",
          overflowY: "auto",
        }}>
          {Object.entries(answers).map(([key, value]) => (
            value !== null && value !== "" && (
              <div key={key} style={{ marginBottom: "10px" }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(194,156,94,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {key}
                </span>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", color: "rgba(255,255,255,0.8)", marginTop: "2px" }}>
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}


