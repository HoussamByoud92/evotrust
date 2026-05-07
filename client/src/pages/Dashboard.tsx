import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

const GOLD = "#c29c5e";
const GOLD_LIGHT = "rgba(194,156,94,0.6)";
const GOLD_FAINT = "rgba(194,156,94,0.15)";
const CHARCOAL = "#262b2d";
const CHARCOAL_CARD = "#262b2d";
const TEXT = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.5)";

const PALETTE = [
  "#c29c5e", "#c29c5e", "#c29c5e", "#c29c5e", "#c29c5e",
  "#c29c5e", "#c29c5e", "#c29c5e", "#c29c5e", "#c29c5e",
];

const FONT_SERIF = "'Cormorant Garamond', serif";
const FONT_SANS = "'Montserrat', sans-serif";
const LOGO_SRC = "/logo-evotrust.png";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#262b2d",
      border: `1px solid ${GOLD_FAINT}`,
      borderRadius: "2px",
      padding: "10px 16px",
    }}>
      {label && <p style={{ fontFamily: FONT_SANS, fontSize: "11px", color: GOLD_LIGHT, marginBottom: "4px", letterSpacing: "0.05em" }}>{label}</p>}
      <p style={{ fontFamily: FONT_SERIF, fontSize: "18px", color: TEXT, fontWeight: 600 }}>{payload[0].value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
      <div style={{ width: "24px", height: "1px", background: GOLD }} />
      <h3 style={{ fontFamily: FONT_SERIF, fontSize: "20px", fontWeight: 500, color: TEXT, letterSpacing: "0.02em" }}>
        {children}
      </h3>
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      padding: "28px 32px",
      background: CHARCOAL_CARD,
      border: `1px solid ${GOLD_FAINT}`,
      borderRadius: "2px",
      flex: 1,
      minWidth: "160px",
    }}>
      <div style={{ fontFamily: FONT_SERIF, fontSize: "44px", fontWeight: 600, color: GOLD, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: FONT_SANS, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD_LIGHT, marginTop: "8px" }}>{label}</div>
      {sub && <div style={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_MUTED, marginTop: "4px" }}>{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children, fullWidth }: { title: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div style={{
      padding: "28px",
      background: CHARCOAL_CARD,
      border: `1px solid ${GOLD_FAINT}`,
      borderRadius: "2px",
      flex: fullWidth ? "1 1 100%" : "1 1 calc(50% - 12px)",
      minWidth: fullWidth ? "100%" : "300px",
    }}>
      <div style={{ fontFamily: FONT_SANS, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD_LIGHT, marginBottom: "20px" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: FONT_SERIF, fontSize: "16px", color: TEXT_MUTED, fontStyle: "italic" }}>
        Aucune donnée disponible
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "responses">("dashboard");

  const statsQuery = trpc.admin.getStats.useQuery(undefined, {
    enabled: user?.role === "admin",
    refetchInterval: 30000,
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: CHARCOAL }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: "12px", color: GOLD_LIGHT, letterSpacing: "0.15em" }}>Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", background: CHARCOAL }}>
        <img src={LOGO_SRC} alt="EVOTRUST logo" style={{ height: "52px", width: "auto" }} />
        <p style={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_MUTED }}>Accès réservé aux administrateurs</p>
        <a href={getLoginUrl()} style={{ fontFamily: FONT_SANS, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: CHARCOAL, background: GOLD, padding: "12px 32px", borderRadius: "1px", textDecoration: "none", fontWeight: 600 }}>
          Se connecter
        </a>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: CHARCOAL }}>
        <p style={{ fontFamily: FONT_SERIF, fontSize: "24px", color: TEXT }}>Accès refusé</p>
        <a href="/" style={{ fontFamily: FONT_SANS, fontSize: "11px", color: GOLD_LIGHT, textDecoration: "none" }}>Retour à l'accueil</a>
      </div>
    );
  }

  const stats = statsQuery.data;

  return (
    <div style={{ minHeight: "100vh", background: CHARCOAL }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: `1px solid ${GOLD_FAINT}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img src={LOGO_SRC} alt="EVOTRUST logo" style={{ height: "40px", width: "auto" }} />
          <span style={{ color: GOLD_FAINT, fontSize: "14px" }}>|</span>
          <span style={{ fontFamily: FONT_SANS, fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD_LIGHT }}>
            Tableau de bord
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/admin" style={{ fontFamily: FONT_SANS, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: TEXT_MUTED, textDecoration: "none", border: `1px solid rgba(194,156,94,0.15)`, padding: "7px 18px", borderRadius: "1px" }}>
            Réponses brutes
          </a>
          <a href="/" style={{ fontFamily: FONT_SANS, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: TEXT_MUTED, textDecoration: "none", border: `1px solid rgba(194,156,94,0.15)`, padding: "7px 18px", borderRadius: "1px" }}>
            Questionnaire
          </a>
        </div>
      </header>

      <div style={{ padding: "40px" }}>
        {/* Title */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD_LIGHT, marginBottom: "8px" }}>
            Édition 2025–2026
          </div>
          <h1 style={{ fontFamily: FONT_SERIF, fontSize: "36px", fontWeight: 400, color: TEXT, letterSpacing: "0.01em" }}>
            Résultats du Baromètre Diaspora
          </h1>
        </div>

        {statsQuery.isLoading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: FONT_SERIF, fontSize: "18px", color: TEXT_MUTED, fontStyle: "italic" }}>Chargement des statistiques...</p>
          </div>
        ) : !stats || stats.total === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", border: `1px solid ${GOLD_FAINT}`, borderRadius: "2px" }}>
            <p style={{ fontFamily: FONT_SERIF, fontSize: "22px", color: TEXT_MUTED, fontStyle: "italic" }}>
              Aucune réponse enregistrée pour le moment.
            </p>
            <p style={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_MUTED, marginTop: "12px", letterSpacing: "0.05em" }}>
              Les données apparaîtront ici dès les premières soumissions.
            </p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
              <KpiCard label="Réponses collectées" value={stats.total} />
              <KpiCard label="Pays représentés" value={stats.pays.length} />
              <KpiCard label="Secteurs représentés" value={stats.secteur.length} />
              <KpiCard
                label="Intention de retour"
                value={`${Math.round(((stats.intentionRetour.find(d => d.name.includes("projet"))?.value || 0) / stats.total) * 100)}%`}
                sub="Ont un projet concret"
              />
            </div>

            {/* Évolution temporelle */}
            {stats.submissionsByDay.length > 1 && (
              <div style={{ marginBottom: "32px" }}>
                <ChartCard title="Évolution des soumissions" fullWidth>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={stats.submissionsByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,156,94,0.08)" />
                      <XAxis dataKey="date" tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="count" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }} activeDot={{ r: 5, fill: GOLD }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}

            {/* Profil */}
            <div style={{ marginBottom: "16px" }}>
              <SectionTitle>Profil des répondants</SectionTitle>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
              {/* Genre */}
              <ChartCard title="Genre (Q1)">
                {stats.genre.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={stats.genre} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                        {stats.genre.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <Legend data={stats.genre} />
              </ChartCard>

              {/* Pays */}
              <ChartCard title="Pays de résidence (Q5)">
                {stats.pays.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.pays.slice(0, 7)} layout="vertical" margin={{ left: 0, right: 16 }}>
                      <XAxis type="number" tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                        {stats.pays.slice(0, 7).map((_, i) => <Cell key={i} fill={i === 0 ? GOLD : GOLD_FAINT} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Secteur */}
              <ChartCard title="Secteur d'activité (Q6)">
                {stats.secteur.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.secteur.slice(0, 7)} layout="vertical" margin={{ left: 0, right: 16 }}>
                      <XAxis type="number" tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                        {stats.secteur.slice(0, 7).map((_, i) => <Cell key={i} fill={i === 0 ? GOLD : GOLD_FAINT} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Niveau de poste */}
              <ChartCard title="Niveau de poste (Q7)">
                {stats.poste.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.poste} layout="vertical" margin={{ left: 0, right: 16 }}>
                      <XAxis type="number" tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={130} tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                        {stats.poste.map((_, i) => <Cell key={i} fill={i === 0 ? GOLD : GOLD_FAINT} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Envie de Maroc */}
            <div style={{ marginBottom: "16px" }}>
              <SectionTitle>L'Envie de Maroc</SectionTitle>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
              {/* Intention de retour */}
              <ChartCard title="Intention de retour au Maroc (Q8)">
                {stats.intentionRetour.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={stats.intentionRetour} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                        {stats.intentionRetour.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <Legend data={stats.intentionRetour} />
              </ChartCard>

              {/* Horizon de retour */}
              <ChartCard title="Horizon de retour envisagé (Q9)">
                {stats.horizonRetour.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.horizonRetour} margin={{ bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontFamily: FONT_SANS, fontSize: 9, fill: TEXT_MUTED }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                        {stats.horizonRetour.map((_, i) => <Cell key={i} fill={i === 0 ? GOLD : GOLD_FAINT} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Freins */}
            <div style={{ marginBottom: "16px" }}>
              <SectionTitle>Craintes & Freins</SectionTitle>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
              <ChartCard title="Principaux obstacles au retour (Q11 — Top 8)" fullWidth>
                {stats.freins.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.freins} layout="vertical" margin={{ left: 0, right: 24 }}>
                      <XAxis type="number" tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={220} tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                        {stats.freins.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? GOLD : i < 3 ? GOLD_LIGHT : GOLD_FAINT} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Perception */}
            <div style={{ marginBottom: "16px" }}>
              <SectionTitle>Perception & Confiance</SectionTitle>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
              {/* Ville préférée */}
              <ChartCard title="Ville préférée au Maroc (Q18)">
                {stats.villeMaroc.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={stats.villeMaroc} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                        {stats.villeMaroc.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <Legend data={stats.villeMaroc} />
              </ChartCard>

              {/* Confiance économique */}
              <ChartCard title="Confiance dans l'avenir économique (Q19)">
                {stats.confianceEco.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.confianceEco} margin={{ bottom: 10 }}>
                      <XAxis dataKey="name" tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontFamily: FONT_SANS, fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                        {stats.confianceEco.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Footer */}
            <div style={{ borderTop: `1px solid ${GOLD_FAINT}`, paddingTop: "24px", textAlign: "center" }}>
              <p style={{ fontFamily: FONT_SANS, fontSize: "10px", color: TEXT_MUTED, letterSpacing: "0.1em" }}>
                Données actualisées toutes les 30 secondes · EVOTRUST Baromètre Diaspora 2025–2026
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Legend({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
          <span style={{ fontFamily: FONT_SANS, fontSize: "10px", color: TEXT_MUTED, letterSpacing: "0.03em" }}>
            {item.name} <span style={{ color: GOLD_LIGHT }}>({Math.round((item.value / total) * 100)}%)</span>
          </span>
        </div>
      ))}
    </div>
  );
}



