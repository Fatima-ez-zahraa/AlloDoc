"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
  Globe,
  Brain,
  Zap,
  X,
  Check,
  Languages,
  MessageSquareText,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

/* ───── Types ───── */

type Phrase = {
  id: string;
  content: string;
  intent: string;
  language: string;
  added_at: string | null;
};

type TestResult = {
  detected_language: string;
  detected_intent: string;
  confidence: number;
  method: string;
  matched_phrase: string | null;
  reply: string;
};

/* ───── Constants ───── */

const INTENTS = [
  "BOOK_APPOINTMENT",
  "CANCEL_APPOINTMENT",
  "GENERAL_QUESTION",
  "GREETING",
];

const LANGUAGES = [
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
  { value: "darija", label: "Darija", flag: "🇲🇦" },
];

const INTENT_LABELS: Record<string, { label: string; color: string }> = {
  BOOK_APPOINTMENT: { label: "Prise de RDV", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  CANCEL_APPOINTMENT: { label: "Annulation", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  GENERAL_QUESTION: { label: "Question", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  GREETING: { label: "Accueil", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  UNKNOWN: { label: "Inconnu", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
};

const LANG_LABELS: Record<string, { label: string; flag: string }> = {
  fr: { label: "Français", flag: "🇫🇷" },
  en: { label: "English", flag: "🇬🇧" },
  ar: { label: "العربية", flag: "🇸🇦" },
  darija: { label: "Darija", flag: "🇲🇦" },
};

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  rule: { label: "Règle", color: "text-brand-teal bg-brand-teal/10" },
  phrase_similarity: { label: "Similarité", color: "text-purple-400 bg-purple-500/10" },
  ml: { label: "Machine Learning", color: "text-pink-400 bg-pink-500/10" },
  fallback: { label: "Fallback", color: "text-slate-400 bg-slate-500/10" },
};

/* ───── Component ───── */

export default function AIPlaygroundPage() {
  /* ── State: Phrases ── */
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loadingPhrases, setLoadingPhrases] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLang, setFilterLang] = useState("all");
  const [filterIntent, setFilterIntent] = useState("all");

  /* ── State: Add/Edit Modal ── */
  const [showModal, setShowModal] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState<Phrase | null>(null);
  const [formContent, setFormContent] = useState("");
  const [formIntent, setFormIntent] = useState(INTENTS[0]);
  const [formLang, setFormLang] = useState("fr");
  const [saving, setSaving] = useState(false);

  /* ── State: Test Playground ── */
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);

  /* ── State: Training ── */
  const [training, setTraining] = useState(false);
  const [trainMsg, setTrainMsg] = useState("");

  /* ── State: Error/Success ── */
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ── Fetch phrases ── */
  const fetchPhrases = useCallback(() => {
    setLoadingPhrases(true);
    apiFetch<{ data: Phrase[] }>("/api/v1/ai/phrases")
      .then((res) => {
        setPhrases(res.data);
        setError("");
      })
      .catch(() => setError("Impossible de charger les phrases. Backend indisponible."))
      .finally(() => setLoadingPhrases(false));
  }, []);

  useEffect(() => { fetchPhrases(); }, [fetchPhrases]);

  /* ── Auto-hide success messages ── */
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  /* ── Handlers ── */

  const handleTest = async () => {
    if (!testText.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiFetch<TestResult & { status: string }>("/api/v1/ai/test", {
        method: "POST",
        body: JSON.stringify({ text: testText }),
      });
      setTestResult(res);
    } catch {
      setError("Erreur lors du test IA.");
    } finally {
      setTesting(false);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    setTrainMsg("");
    try {
      const res = await apiFetch<{ message: string }>("/api/v1/ai/train", { method: "POST" });
      setTrainMsg(res.message);
      setSuccess(res.message);
    } catch {
      setError("Erreur d'entraînement.");
    } finally {
      setTraining(false);
    }
  };

  const openAddModal = () => {
    setEditingPhrase(null);
    setFormContent("");
    setFormIntent(INTENTS[0]);
    setFormLang("fr");
    setShowModal(true);
  };

  const openEditModal = (p: Phrase) => {
    setEditingPhrase(p);
    setFormContent(p.content);
    setFormIntent(p.intent);
    setFormLang(p.language);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formContent.trim()) return;
    setSaving(true);
    try {
      if (editingPhrase) {
        await apiFetch(`/api/v1/ai/phrases/${editingPhrase.id}`, {
          method: "PUT",
          body: JSON.stringify({ content: formContent, actual_intent: formIntent, language: formLang }),
        });
        setSuccess("Phrase mise à jour ✓");
      } else {
        await apiFetch("/api/v1/ai/phrases", {
          method: "POST",
          body: JSON.stringify({ content: formContent, actual_intent: formIntent, language: formLang }),
        });
        setSuccess("Phrase ajoutée ✓");
      }
      setShowModal(false);
      fetchPhrases();
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/v1/ai/phrases/${id}`, { method: "DELETE" });
      setSuccess("Phrase supprimée ✓");
      fetchPhrases();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  /* ── Filtered phrases ── */
  const filtered = phrases.filter((p) => {
    const matchSearch =
      p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.intent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLang = filterLang === "all" || p.language === filterLang;
    const matchIntent = filterIntent === "all" || p.intent === filterIntent;
    return matchSearch && matchLang && matchIntent;
  });

  /* ── Render ── */
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal to-blue-500 shadow-lg shadow-brand-teal/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal">AlloDoc Intelligence</p>
            <h1 className="text-2xl font-bold text-white">Assistant IA — Playground & Vocabulaire</h1>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Testez l&apos;IA en temps réel, gérez les phrases d&apos;entraînement et entraînez le moteur NLP multilingue.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-in fade-in">
          <X className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-red-300 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 animate-in fade-in">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* ═══════ PLAYGROUND ═══════ */}
      <div className="rounded-[2rem] border border-white/5 bg-brand-card p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-bold text-white">Playground — Test en temps réel</h2>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <MessageSquareText className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              id="ai-test-input"
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTest()}
              placeholder="Tapez une phrase en FR, EN, AR ou Darija…"
              className="w-full rounded-2xl border border-white/10 bg-brand-dark py-4 pl-12 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
          </div>
          <button
            id="ai-test-btn"
            onClick={handleTest}
            disabled={testing || !testText.trim()}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-teal to-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-teal/20 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-teal/30 disabled:opacity-50 disabled:hover:scale-100"
          >
            {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Tester
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-white/5 bg-brand-dark/50 p-6 sm:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-bottom-4">
            {/* Language */}
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                <Globe className="h-3.5 w-3.5" /> Langue détectée
              </span>
              <span className="flex items-center gap-2 text-lg font-bold text-white">
                {LANG_LABELS[testResult.detected_language]?.flag ?? "🌍"}
                {LANG_LABELS[testResult.detected_language]?.label ?? testResult.detected_language}
              </span>
            </div>

            {/* Intent */}
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                <Brain className="h-3.5 w-3.5" /> Intention
              </span>
              <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${INTENT_LABELS[testResult.detected_intent]?.color ?? INTENT_LABELS.UNKNOWN.color}`}>
                {INTENT_LABELS[testResult.detected_intent]?.label ?? testResult.detected_intent}
              </span>
            </div>

            {/* Confidence */}
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                <Zap className="h-3.5 w-3.5" /> Confiance
              </span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">{Math.round(testResult.confidence * 100)}%</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-teal to-blue-500 transition-all duration-700"
                    style={{ width: `${Math.round(testResult.confidence * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Method */}
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                <Languages className="h-3.5 w-3.5" /> Méthode
              </span>
              <span className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${METHOD_LABELS[testResult.method]?.color ?? "text-slate-400 bg-slate-500/10"}`}>
                {METHOD_LABELS[testResult.method]?.label ?? testResult.method}
              </span>
              {testResult.matched_phrase && (
                <span className="mt-0.5 text-[11px] italic text-slate-500 truncate" title={testResult.matched_phrase}>
                  ≈ &quot;{testResult.matched_phrase}&quot;
                </span>
              )}
            </div>

            {/* Reply */}
            <div className="col-span-full mt-2 rounded-xl border border-brand-teal/20 bg-brand-teal/5 p-4">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-teal">Réponse IA</span>
              <p className="text-sm leading-relaxed text-white">{testResult.reply}</p>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ VOCABULARY TABLE ═══════ */}
      <div className="rounded-[2rem] border border-white/5 bg-brand-card p-6 shadow-2xl sm:p-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Languages className="h-5 w-5 text-brand-teal" />
            <h2 className="text-lg font-bold text-white">
              Vocabulaire d&apos;entraînement
              <span className="ml-2 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-normal text-slate-400">{phrases.length}</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-48 rounded-xl border border-white/10 bg-brand-dark/50 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>

            {/* Filter: Language */}
            <select
              id="filter-lang"
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="rounded-xl border border-white/10 bg-brand-dark/50 px-3 py-2 text-sm text-white focus:border-brand-teal focus:outline-none"
            >
              <option value="all">Toutes langues</option>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>

            {/* Filter: Intent */}
            <select
              id="filter-intent"
              value={filterIntent}
              onChange={(e) => setFilterIntent(e.target.value)}
              className="rounded-xl border border-white/10 bg-brand-dark/50 px-3 py-2 text-sm text-white focus:border-brand-teal focus:outline-none"
            >
              <option value="all">Tous intents</option>
              {INTENTS.map((i) => (
                <option key={i} value={i}>
                  {INTENT_LABELS[i]?.label ?? i}
                </option>
              ))}
            </select>

            {/* Train button */}
            <button
              id="ai-train-btn"
              onClick={handleTrain}
              disabled={training}
              className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 transition-all hover:bg-purple-500/20 hover:text-purple-200 disabled:opacity-50"
            >
              {training ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Entraîner
            </button>

            {/* Add button */}
            <button
              id="ai-add-btn"
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-teal to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-teal/20 transition-all hover:scale-[1.02] hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>
        </div>

        {/* Train feedback */}
        {trainMsg && (
          <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-sm text-purple-300">
            {trainMsg}
          </div>
        )}

        {/* Table */}
        {loadingPhrases ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-brand-teal" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-white/5 bg-white/5 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Phrase</th>
                    <th className="px-6 py-4 font-medium">Intention</th>
                    <th className="px-6 py-4 font-medium">Langue</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((p) => {
                    const intentStyle = INTENT_LABELS[p.intent] ?? INTENT_LABELS.UNKNOWN;
                    const langInfo = LANG_LABELS[p.language];
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-white/[0.03]">
                        <td className="max-w-xs truncate px-6 py-4 font-medium text-white" title={p.content}>
                          {p.content}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${intentStyle.color}`}>
                            {intentStyle.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm">
                            {langInfo?.flag ?? "🌍"} {langInfo?.label ?? p.language}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                              title="Modifier"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                        Aucune phrase trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ MODAL ═══════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-brand-card p-8 shadow-2xl animate-in zoom-in-95">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingPhrase ? "Modifier la phrase" : "Ajouter une phrase"}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Content */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">Contenu de la phrase</label>
                <textarea
                  id="modal-content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={3}
                  placeholder="Ex: bghit nchouf tbib, bonjour je veux un rdv..."
                  className="w-full rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>

              {/* Intent */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">Intention (Intent)</label>
                <select
                  id="modal-intent"
                  value={formIntent}
                  onChange={(e) => setFormIntent(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-sm text-white focus:border-brand-teal focus:outline-none"
                >
                  {INTENTS.map((i) => (
                    <option key={i} value={i}>
                      {INTENT_LABELS[i]?.label ?? i}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">Langue</label>
                <select
                  id="modal-lang"
                  value={formLang}
                  onChange={(e) => setFormLang(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-sm text-white focus:border-brand-teal focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.flag} {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal actions */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Annuler
              </button>
              <button
                id="modal-save-btn"
                onClick={handleSave}
                disabled={saving || !formContent.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-teal to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editingPhrase ? "Mettre à jour" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
