"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  BarChart3, BookOpen, BookText, ChevronLeft, ChevronRight, Download,
  ExternalLink, FileText, GraduationCap, Highlighter, Info, LogIn, LogOut,
  MessageSquareText, Palette, Save, Search, ShieldCheck, Sparkles, UserRound, X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BOOK_INFO, BOOK_NAMES, ORIGINAL_WORDS, STUDIES, TOPICS, type ScriptureRef } from "@/lib/bible-content";
import { supabase } from "@/lib/supabase";

type BibleVerse = { number: number; text: string };
type BibleChapter = { chapter: number; verses: BibleVerse[] };
type BibleBook = { bookId: number; chapters: BibleChapter[] };
type BibleData = { version: string; language: string; books: BibleBook[] };
type DictionaryEntry = {
  term: string; category: string; definition: string; importance?: string; reading?: string;
  perspective?: string; distinction?: string; application?: string; deeper?: string;
};
type DictionaryData = { title: string; project: string; author: string; identity: string; entries: DictionaryEntry[] };
type DictionaryManifest = Omit<DictionaryData, "entries"> & { parts: string[] };
type View = "bible" | "dictionary" | "topics" | "studies" | "appeal" | "more" | "help" | "aboutMore";
type Theme = "default" | "brown" | "red" | "black";
type Annotation = { color?: string; note?: string };
type VerseSelection = { book: number; chapter: number; verse: BibleVerse };
type AuthMode = "login" | "register";
type StatsRange = "day" | "month" | "year" | "all";
type SavedListMode = "notes" | "marks" | null;
type MoreResource = "Strong" | "Estudos STEP Bible" | "Mapas Bíblicos" | "Pessoas" | "Lugares" | "Genealogias" | "Referências Cruzadas" | "Pesos e Medidas" | "Viagens Bíblicas" | "Assuntos Bíblicos" | null;
type SiteSettings = {
  external_button_label: string;
  external_button_url: string;
  information_content: string;
  help_title: string;
  help_content: string;
  donation_button_label: string;
  donation_url: string;
  donation_note: string;
  about_more_title: string; about_more_content: string;
  social_1_label: string; social_1_url: string; social_2_label: string; social_2_url: string;
  social_3_label: string; social_3_url: string; social_4_label: string; social_4_url: string;
  personal_site_url: string; books_projects_url: string; whatsapp_channel_url: string;
};
type AccessStats = { guest: number; registered: number; total: number; users: number };

const COLORS = [
  { name: "Amarelo", value: "#F8E58C" }, { name: "Azul", value: "#9FD6F5" },
  { name: "Verde", value: "#AEE3B4" }, { name: "Vermelho", value: "#F2A7A7" },
  { name: "Branco", value: "#FFFFFF" }, { name: "Preto", value: "#171717" },
];

const themeLabels: Record<Theme, string> = { default: "Padrão", brown: "Marrom", red: "Vermelho", black: "Preto" };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const verseKey = (book: number, chapter: number, verse: number) => `${book}-${chapter}-${verse}`;
const defaultSettings: SiteSettings = {
  external_button_label: "", external_button_url: "", information_content: "",
  help_title: "Como ajudar",
  help_content: "Este projeto existe para servir, ensinar e compartilhar a Palavra de Deus gratuitamente. Não aceitamos dinheiro para pregar o Evangelho e o ensino bíblico não está à venda. Se você desejar contribuir voluntariamente, sua doação ajuda a manter este trabalho e também nas necessidades da vida, como alimentação, água e outras despesas essenciais.",
  donation_button_label: "Fazer doação e ofertar",
  donation_url: "",
  donation_note: "Você pode doar o valor que quiser. Toda contribuição é voluntária.",
  about_more_title: "Saiba mais",
  about_more_content: "A Bíblia Online L.M. Lemos foi criada para facilitar o acesso gratuito à Palavra de Deus e a recursos de estudo bíblico. Luan Maciel de Lemos entende que o Evangelho não deve ser transformado em produto: não aceita dinheiro para pregar o Evangelho nem para oferecer estudos bíblicos. O objetivo deste projeto é servir, ensinar e compartilhar conhecimento bíblico gratuitamente.",
  social_1_label:"", social_1_url:"", social_2_label:"", social_2_url:"", social_3_label:"", social_3_url:"", social_4_label:"", social_4_url:"", personal_site_url:"", books_projects_url:"", whatsapp_channel_url:""
};

function getVisitorId() {
  const key = "lm-bible-visitor-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

function brazilDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
}

export function BibleApp() {
  const [bible, setBible] = useState<BibleData | null>(null);
  const [dictionary, setDictionary] = useState<DictionaryData | null>(null);
  const [view, setView] = useState<View>("bible");
  const [bookIndex, setBookIndex] = useState(42);
  const [chapterNumber, setChapterNumber] = useState(3);
  const [focusVerse, setFocusVerse] = useState<number | null>(16);
  const [selectedVerse, setSelectedVerse] = useState<VerseSelection | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dictionarySearch, setDictionarySearch] = useState("");
  const [dictionaryLetter, setDictionaryLetter] = useState("TODAS");
  const [savedListMode, setSavedListMode] = useState<SavedListMode>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [moreResource, setMoreResource] = useState<MoreResource>(null);
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceLetter, setResourceLetter] = useState("TODAS");
  const [externalResourceItems, setExternalResourceItems] = useState<Record<string, {title:string; text:string}[]>>({});
  const [resourceExternal, setResourceExternal] = useState<Record<string, {title:string; text:string; refs?:ScriptureRef[]}[]>>({});
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  useEffect(() => {
    const files: Partial<Record<Exclude<MoreResource, null>, string>> = {
      "Pessoas": "/data/resources/people-200.json",
      "Lugares": "/data/resources/places-200.json",
      "Mapas Bíblicos": "/data/resources/maps-200.json",
    };
    Object.entries(files).forEach(([resource, url]) => {
      fetch(url as string).then(r => r.ok ? r.json() : Promise.reject()).then(data => {
        setResourceExternal(prev => ({ ...prev, [resource]: data.entries || [] }));
      }).catch(() => {});
    });
  }, []);

  const [theme, setTheme] = useState<Theme>("default");
  const [themeOpen, setThemeOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [annotations, setAnnotations] = useState<Record<string, Annotation>>({});
  const [noteDraft, setNoteDraft] = useState("");
  const [status, setStatus] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [statsRange, setStatsRange] = useState<StatsRange>("month");
  const [stats, setStats] = useState<AccessStats>({ guest: 0, registered: 0, total: 0, users: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings>(defaultSettings);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationBusy, setDonationBusy] = useState(false);
  const [donationMessage, setDonationMessage] = useState("");
  const deferredSearchText = useDeferredValue(searchText);
  const deferredDictionarySearch = useDeferredValue(dictionarySearch);

  useEffect(() => {
    Promise.all([
      fetch("https://raw.githubusercontent.com/midvash/bible-data/main/versions/pt/almeida-livre/almeida-livre.json").then((r) => r.json()),
      fetch("/data/dictionary/manifest.json").then((r) => r.json() as Promise<DictionaryManifest>).then(async (manifest) => ({
        ...manifest,
        entries: (await Promise.all(manifest.parts.map((file: string) => fetch(`/data/dictionary/${file}`).then((r) => r.json())))).flat(),
      })),
    ]).then(([bibleData, dictionaryData]) => {
      setBible(bibleData as BibleData);
      setDictionary(dictionaryData as DictionaryData);
    });
    setAnnotations(loadLocal<Record<string, Annotation>>("lm-bible-annotations", {}));
    setTheme(loadLocal<Theme>("lm-bible-theme", "default"));
  }, []);

  useEffect(() => {
    if (authReady && !user) localStorage.setItem("lm-bible-annotations", JSON.stringify(annotations));
  }, [annotations, authReady, user]);
  useEffect(() => { localStorage.setItem("lm-bible-theme", JSON.stringify(theme)); }, [theme]);

  const recordAccess = useCallback(async (currentUser: User | null) => {
    const accessType = currentUser ? "registered" : "guest";
    await supabase.from("access_logs").upsert({
      visitor_id: getVisitorId(), access_date: brazilDate(), access_type: accessType,
      user_id: currentUser?.id ?? null,
    }, { onConflict: "visitor_id,access_date,access_type", ignoreDuplicates: true });
  }, []);

  const loadAccount = useCallback(async (currentUser: User | null) => {
    setUser(currentUser);
    if (!currentUser) {
      setProfileName("");
      setIsAdmin(false);
      setAnnotations(loadLocal<Record<string, Annotation>>("lm-bible-annotations", {}));
      await recordAccess(null);
      return;
    }

    const [{ data: profile }, { data: adminRow }, { data: cloudRows }] = await Promise.all([
      supabase.from("profiles").select("name").eq("id", currentUser.id).maybeSingle(),
      supabase.from("admin_users").select("user_id").eq("user_id", currentUser.id).maybeSingle(),
      supabase.from("annotations").select("verse_key,color,note").eq("user_id", currentUser.id),
    ]);
    setProfileName(profile?.name || currentUser.user_metadata?.name || "Usuário");
    setIsAdmin(Boolean(adminRow));

    const cloud: Record<string, Annotation> = Object.fromEntries((cloudRows || []).map((row) => [row.verse_key, {
      color: row.color || undefined, note: row.note || undefined,
    }]));
    const migrationKey = `lm-bible-migrated-${currentUser.id}`;
    const guest = loadLocal<Record<string, Annotation>>("lm-bible-annotations", {});
    const merged = localStorage.getItem(migrationKey) ? cloud : { ...cloud, ...guest };
    if (!localStorage.getItem(migrationKey) && Object.keys(guest).length) {
      await supabase.from("annotations").upsert(Object.entries(merged).map(([key, value]) => ({
        user_id: currentUser.id, verse_key: key, color: value.color || null, note: value.note || null,
      })), { onConflict: "user_id,verse_key" });
      localStorage.setItem(migrationKey, "true");
    }
    setAnnotations(merged);
    await recordAccess(currentUser);
  }, [recordAccess]);

  useEffect(() => {
    let active = true;
    supabase.from("site_settings").select("external_button_label,external_button_url,information_content,help_title,help_content,donation_button_label,donation_url,donation_note,about_more_title,about_more_content,social_1_label,social_1_url,social_2_label,social_2_url,social_3_label,social_3_url,social_4_label,social_4_url,personal_site_url,books_projects_url,whatsapp_channel_url").eq("id", 1).maybeSingle()
      .then(({ data }) => { if (active && data) { setSettings(data); setSettingsDraft(data); } });
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      loadAccount(data.session?.user || null).finally(() => active && setAuthReady(true));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) loadAccount(session?.user || null).finally(() => active && setAuthReady(true));
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [loadAccount]);

  const currentBook = bible?.books[bookIndex];
  const currentChapter = currentBook?.chapters.find((chapter) => chapter.chapter === chapterNumber);
  const bookInfo = BOOK_INFO[bookIndex];

  const allVerses = useMemo(() => {
    if (!bible) return [];
    return bible.books.flatMap((bookData, bookNumber) => bookData.chapters.flatMap((chapter) =>
      chapter.verses.map((verse) => ({ book: bookNumber, chapter: chapter.chapter, verse: verse.number, text: verse.text })),
    ));
  }, [bible]);

  const searchResults = useMemo(() => {
    const query = normalize(deferredSearchText.trim());
    if (!query || query.length < 2) return [];
    return allVerses.filter((item) => normalize(item.text).includes(query)).slice(0, 80);
  }, [allVerses, deferredSearchText]);

  const dictionaryResults = useMemo(() => {
    if (!dictionary) return [];
    const query = normalize(deferredDictionarySearch.trim());
    return dictionary.entries
      .filter((entry) => dictionaryLetter === "TODAS" || normalize(entry.term).startsWith(normalize(dictionaryLetter)))
      .filter((entry) => !query || normalize(entry.term).includes(query))
      .sort((a, b) => {
        if (query) {
          const aTerm = normalize(a.term);
          const bTerm = normalize(b.term);
          const aExact = aTerm === query ? 0 : aTerm.startsWith(query) ? 1 : 2;
          const bExact = bTerm === query ? 0 : bTerm.startsWith(query) ? 1 : 2;
          if (aExact !== bExact) return aExact - bExact;
        }
        return a.term.localeCompare(b.term, "pt-BR", { sensitivity: "base" });
      });
  }, [dictionary, deferredDictionarySearch, dictionaryLetter]);

  useEffect(() => {
    if (!moreResource || externalResourceItems[moreResource]) return;
    const resource = moreResource;
    const loadResources = async () => {
      try {
        const { data, error } = await supabase.from("bible_resources").select("title,body,sort_order").eq("category", resource).order("sort_order", { ascending: true }).limit(200);
        if (error || !data?.length) throw error || new Error("Sem dados");
        setExternalResourceItems(prev => ({ ...prev, [resource]: data.map((x: { title: string; body: string }) => ({ title: x.title, text: x.body })) }));
      } catch {
        setExternalResourceItems(prev => ({ ...prev, [resource]: RESOURCE_DATA[resource] || [] }));
      }
    };
    void loadResources();
  }, [moreResource, externalResourceItems]);

  const savedItems = useMemo(() => Object.entries(annotations).map(([key, annotation]) => {
    const [book, chapter, verse] = key.split("-").map(Number);
    const verseText = bible?.books[book]?.chapters.find((item) => item.chapter === chapter)?.verses.find((item) => item.number === verse)?.text || "";
    return { key, book, chapter, verse, verseText, annotation };
  }), [annotations, bible]);

  const bookExtremes = useMemo(() => {
    if (!currentBook) return null;
    const verses = currentBook.chapters.flatMap((chapter) => chapter.verses.map((verse) => ({ ...verse, chapter: chapter.chapter })));
    if (!verses.length) return null;
    return {
      longest: verses.reduce((a, b) => a.text.length > b.text.length ? a : b),
      shortest: verses.reduce((a, b) => a.text.length < b.text.length ? a : b),
    };
  }, [currentBook]);

  function goToReference(reference: ScriptureRef | { book: number; chapter: number; verse: number }) {
    setBookIndex(reference.book); setChapterNumber(reference.chapter); setFocusVerse(reference.verse); setView("bible");
    setSearchOpen(false); setSelectedVerse(null);
    window.setTimeout(() => document.getElementById(`verse-${reference.verse}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 220);
  }

  function selectVerse(verse: BibleVerse) {
    setSelectedVerse({ book: bookIndex, chapter: chapterNumber, verse });
    setNoteDraft(annotations[verseKey(bookIndex, chapterNumber, verse.number)]?.note || "");
  }

  async function persistAnnotation(key: string, annotation: Annotation) {
    if (!user) return;
    const hasContent = Boolean(annotation.color || annotation.note?.trim());
    const result = hasContent
      ? await supabase.from("annotations").upsert({
          user_id: user.id, verse_key: key, color: annotation.color || null,
          note: annotation.note?.trim() || null, updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,verse_key" })
      : await supabase.from("annotations").delete().eq("user_id", user.id).eq("verse_key", key);
    if (result.error) {
      setStatus("Não foi possível sincronizar agora.");
      return;
    }
    setStatus("Salvo na sua conta.");
    window.setTimeout(() => setStatus(""), 2400);
  }

  function saveColor(color?: string) {
    if (!selectedVerse) return;
    setSelectedColor(color || null);
    window.setTimeout(() => setSelectedColor(null), 420);
    const key = verseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse.number);
    const next = { ...annotations[key], color };
    setAnnotations((old) => ({ ...old, [key]: next }));
    persistAnnotation(key, next);
  }

  function saveNote() {
    if (!selectedVerse) return;
    const key = verseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse.number);
    const next = { ...annotations[key], note: noteDraft.trim() };
    setAnnotations((old) => ({ ...old, [key]: next }));
    if (user) persistAnnotation(key, next);
    else {
      setStatus("Nota salva neste aparelho. Entre para sincronizar.");
      window.setTimeout(() => setStatus(""), 2400);
    }
  }

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    if (authMode === "register" && authName.trim().length < 2) {
      setAuthMessage("Digite seu nome com pelo menos duas letras."); return;
    }
    if (authPassword.length < 6) {
      setAuthMessage("A senha precisa ter pelo menos 6 caracteres."); return;
    }
    setAuthBusy(true);
    const result = authMode === "register"
      ? await supabase.auth.signUp({ email: authEmail.trim(), password: authPassword, options: { data: { name: authName.trim() } } })
      : await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });
    setAuthBusy(false);
    if (result.error) {
      const message = result.error.message.toLowerCase().includes("invalid login")
        ? "E-mail ou senha incorretos."
        : result.error.message.toLowerCase().includes("already registered")
          ? "Este e-mail já possui cadastro."
          : "Não foi possível concluir. Confira os dados e tente novamente.";
      setAuthMessage(message);
      return;
    }
    setAuthPassword("");
    if (result.data.session) {
      setAuthOpen(false);
      setAuthMessage("");
    } else {
      setAuthMessage("Cadastro realizado. Confira seu e-mail para confirmar a conta.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setAuthOpen(false);
    setAdminOpen(false);
  }

  const loadAdminStats = useCallback(async (range: StatsRange) => {
    if (!isAdmin) return;
    setStatsLoading(true);
    const today = brazilDate();
    const start = range === "day" ? today : range === "month" ? `${today.slice(0, 7)}-01` : range === "year" ? `${today.slice(0, 4)}-01-01` : null;
    let accessQuery = supabase.from("access_logs").select("access_type");
    if (start) accessQuery = accessQuery.gte("access_date", start);
    const [{ data: accessRows }, { count: usersCount }] = await Promise.all([
      accessQuery,
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    const guest = (accessRows || []).filter((row) => row.access_type === "guest").length;
    const registered = (accessRows || []).filter((row) => row.access_type === "registered").length;
    setStats({ guest, registered, total: guest + registered, users: usersCount || 0 });
    setStatsLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (adminOpen && isAdmin) loadAdminStats(statsRange);
  }, [adminOpen, isAdmin, loadAdminStats, statsRange]);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !isAdmin) return;
    const url = settingsDraft.external_button_url.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      setStatus("O link externo deve começar com http:// ou https://"); return;
    }
    setSettingsBusy(true);
    const clean = {
      external_button_label: settingsDraft.external_button_label.trim(),
      external_button_url: url,
      information_content: settingsDraft.information_content.trim(),
      help_title: settingsDraft.help_title.trim() || "Como ajudar",
      help_content: settingsDraft.help_content.trim(),
      donation_button_label: settingsDraft.donation_button_label.trim() || "Fazer doação e ofertar",
      donation_url: settingsDraft.donation_url.trim(),
      donation_note: settingsDraft.donation_note.trim(),
      about_more_title: settingsDraft.about_more_title.trim() || "Saiba mais", about_more_content: settingsDraft.about_more_content.trim(),
      social_1_label: settingsDraft.social_1_label.trim(), social_1_url: settingsDraft.social_1_url.trim(), social_2_label: settingsDraft.social_2_label.trim(), social_2_url: settingsDraft.social_2_url.trim(), social_3_label: settingsDraft.social_3_label.trim(), social_3_url: settingsDraft.social_3_url.trim(), social_4_label: settingsDraft.social_4_label.trim(), social_4_url: settingsDraft.social_4_url.trim(), personal_site_url: settingsDraft.personal_site_url.trim(), books_projects_url: settingsDraft.books_projects_url.trim(), whatsapp_channel_url: settingsDraft.whatsapp_channel_url.trim(),
    };
    const { error } = await supabase.from("site_settings").update({
      ...clean, updated_at: new Date().toISOString(), updated_by: user.id,
    }).eq("id", 1);
    setSettingsBusy(false);
    if (error) { setStatus("Não foi possível salvar as informações."); return; }
    setSettings(clean);
    setSettingsDraft(clean);
    setStatus("Informações públicas atualizadas.");
    window.setTimeout(() => setStatus(""), 2400);
  }

  async function startDonation() {
    const normalized = donationAmount.replace(",", ".").trim();
    const amount = Number(normalized);
    if (!Number.isFinite(amount) || amount < 1) {
      setDonationMessage("Digite um valor de pelo menos R$ 1,00.");
      return;
    }
    setDonationBusy(true);
    setDonationMessage("");
    try {
      const response = await fetch("/api/donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error("checkout");
      window.location.href = data.url;
    } catch {
      setDonationMessage("Não foi possível abrir o pagamento agora. Tente novamente.");
      setDonationBusy(false);
    }
  }

  async function createVerseImage() {
    if (!selectedVerse) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const palettes: Record<Theme, [string, string, string]> = {
      default: ["#F7F0DF", "#6E4F22", "#201B16"], brown: ["#2E2018", "#C99A5D", "#FFF6E8"],
      red: ["#350F13", "#E0A16E", "#FFF4EE"], black: ["#080808", "#C8A96A", "#F5F5F5"],
    };
    const [background, accent, foreground] = palettes[theme];
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1350); gradient.addColorStop(0, background); gradient.addColorStop(1, theme === "default" ? "#E6D6B7" : "#12100E");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 1350);
    ctx.strokeStyle = accent; ctx.lineWidth = 4; ctx.strokeRect(62, 62, 956, 1226);
    ctx.fillStyle = accent; ctx.font = "700 34px Georgia"; ctx.textAlign = "center"; ctx.fillText("BÍBLIA ON-LINE", 540, 150);
    ctx.fillStyle = foreground; ctx.font = "52px Georgia";
    const words = selectedVerse.verse.text.split(" "); let line = ""; const lines: string[] = [];
    for (const word of words) { const test = `${line}${word} `; if (ctx.measureText(test).width > 850) { lines.push(line.trim()); line = `${word} `; } else line = test; }
    if (line.trim()) lines.push(line.trim());
    const start = 600 - (lines.length * 36); lines.forEach((text, index) => ctx.fillText(text, 540, start + index * 72));
    ctx.fillStyle = accent; ctx.font = "700 38px Georgia"; ctx.fillText(`${BOOK_NAMES[selectedVerse.book]} ${selectedVerse.chapter}:${selectedVerse.verse.number}`, 540, 1080);
    ctx.fillStyle = foreground; ctx.globalAlpha = .78; ctx.font = "26px Arial"; ctx.fillText("Almeida 1819 — Bíblia Livre", 540, 1150); ctx.fillText("Projeto L.M. Lemos", 540, 1193);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png")); if (!blob) return;
    const file = new File([blob], `versiculo-${BOOK_NAMES[selectedVerse.book]}-${selectedVerse.chapter}-${selectedVerse.verse.number}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: `${BOOK_NAMES[selectedVerse.book]} ${selectedVerse.chapter}:${selectedVerse.verse.number}` }); }
    else { const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url); }
  }

  function changeChapter(delta: number) {
    if (!bible) return;
    let nextBook = bookIndex; let nextChapter = chapterNumber + delta;
    if (nextChapter < 1 && nextBook > 0) { nextBook -= 1; nextChapter = bible.books[nextBook].chapters.length; }
    if (nextChapter > bible.books[nextBook].chapters.length && nextBook < 65) { nextBook += 1; nextChapter = 1; }
    setBookIndex(nextBook); setChapterNumber(nextChapter); setFocusVerse(null); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const originalWords = selectedVerse && selectedVerse.book < 39 ? ORIGINAL_WORDS.old : ORIGINAL_WORDS.new;
  const nearby = selectedVerse && bible ? bible.books[selectedVerse.book].chapters.find((c) => c.chapter === selectedVerse.chapter)?.verses.filter((v) => Math.abs(v.number - selectedVerse.verse.number) <= 1) : [];

  return (
    <div className={`bible-app theme-${theme}`}>
      <header className="app-header">
        <button className="brand" onClick={() => setView("bible")} aria-label="Abrir a Bíblia">
          <span className="brand-mark"><BookOpen size={21} /></span>
          <span><strong>Bíblia On-line</strong><small>Projeto L.M. Lemos</small></span>
        </button>
        <div className="header-actions">
          <button className="icon-button" onClick={() => setSearchOpen(true)} aria-label="Pesquisar na Bíblia"><Search size={20} /></button>
          <button className="icon-button" onClick={() => setThemeOpen(true)} aria-label="Escolher tema"><Palette size={20} /></button>
          <button className="icon-button" onClick={() => setAboutOpen(true)} aria-label="Informações"><Info size={20} /></button>
          <button className="account-button" onClick={() => setAuthOpen(true)} aria-label={user ? "Abrir minha conta" : "Entrar na conta"}>
            {user ? <UserRound size={16} /> : <LogIn size={16} />}
            <span>{user ? (profileName.split(" ")[0] || "Conta") : "Entrar"}</span>
          </button>
        </div>
      </header>

      <div className="desktop-shell">
        <aside className="side-nav">
          <NavButton icon={<BookOpen />} label="Bíblia" active={view === "bible"} onClick={() => setView("bible")} />
          <NavButton icon={<BookText />} label="Dicionário" active={view === "dictionary"} onClick={() => setView("dictionary")} />
          <NavButton icon={<Sparkles />} label="Assuntos" active={view === "topics"} onClick={() => setView("topics")} />
          <NavButton icon={<GraduationCap />} label="Estudos" active={view === "studies"} onClick={() => setView("studies")} />
          <NavButton icon={<MessageSquareText />} label="Conheça Jesus" active={view === "appeal"} onClick={() => setView("appeal")} />
          <NavButton icon={<span className="more-nav-icon">👍🏻+</span>} label="Ver mais" active={view === "more"} onClick={() => setView("more")} />
          <div className="side-source"><span>Texto bíblico</span><strong>Almeida 1819</strong><small>Bíblia Livre · domínio público</small></div>
        </aside>

        <main className="main-content">
          {view === "bible" && (
            <section className="reader-view">
              <div className="mode-switch" aria-label="Alternar Bíblia e dicionário">
                <button className="active" onClick={() => setView("bible")}><BookOpen size={17} /> Bíblia</button>
                <button onClick={() => setView("dictionary")}><BookText size={17} /> Dicionário teológico</button>
              </div>
              <div className="reader-toolbar">
                <Select value={String(bookIndex)} onValueChange={(value) => { setBookIndex(Number(value)); setChapterNumber(1); setFocusVerse(null); }}>
                  <SelectTrigger className="book-select"><SelectValue /></SelectTrigger>
                  <SelectContent>{BOOK_NAMES.map((book, index) => <SelectItem key={book} value={String(index)}>{book}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={String(chapterNumber)} onValueChange={(value) => { setChapterNumber(Number(value)); setFocusVerse(null); }}>
                  <SelectTrigger className="chapter-select"><SelectValue /></SelectTrigger>
                  <SelectContent>{currentBook?.chapters.map((chapter) => <SelectItem key={chapter.chapter} value={String(chapter.chapter)}>Capítulo {chapter.chapter}</SelectItem>)}</SelectContent>
                </Select>
                <button className="search-pill" onClick={() => setSearchOpen(true)}><Search size={18} /><span>Pesquisar</span></button>
              </div>

              {!bible ? <ReaderSkeleton /> : (
                <>
                  <article className="book-intro">
                    <span className="eyebrow">Antes da leitura</span><h1>{bookInfo.name}</h1><p className="book-summary">{bookInfo.summary}</p>
                    <div className="book-facts">
                      <Fact label="Autor" value={bookInfo.author} /><Fact label="Data provável" value={bookInfo.date} /><Fact label="Destinatários" value={bookInfo.audience} />
                    </div>
                    <div className="famous-verses"><strong>Textos conhecidos</strong><span>{bookInfo.famous.join(" · ")}</span></div>
                    {bookExtremes && <div className="verse-extremes"><span><b>Maior versículo*</b> {bookInfo.name} {bookExtremes.longest.chapter}:{bookExtremes.longest.number}</span><span><b>Menor versículo*</b> {bookInfo.name} {bookExtremes.shortest.chapter}:{bookExtremes.shortest.number}</span><small>*Medidos pelo número de caracteres nesta edição.</small></div>}
                  </article>
                  <div className="chapter-heading"><span>Capítulo</span><strong>{chapterNumber}</strong><small>{BOOK_NAMES[bookIndex]}</small></div>
                  <div className="verses">
                    {currentChapter?.verses.map((verse) => {
                      const annotation = annotations[verseKey(bookIndex, chapterNumber, verse.number)];
                      const color = annotation?.color;
                      const black = color === "#171717";
                      return <button id={`verse-${verse.number}`} key={verse.number} onClick={() => selectVerse(verse)} className={`verse ${focusVerse === verse.number ? "verse-focused" : ""}`} style={color ? { backgroundColor: color, color: black ? "#fff" : "#171717" } : undefined}>
                        <sup>{verse.number}</sup><span>{verse.text}</span>{annotation?.note && <FileText className="note-mark" size={14} />}
                      </button>;
                    })}
                  </div>
                  <div className="chapter-navigation"><Button variant="outline" onClick={() => changeChapter(-1)} disabled={bookIndex === 0 && chapterNumber === 1}><ChevronLeft /> Anterior</Button><Button onClick={() => changeChapter(1)} disabled={bookIndex === 65 && chapterNumber === 22}>Próximo <ChevronRight /></Button></div>
                </>
              )}
            </section>
          )}

          {view === "dictionary" && (
            <section className="content-view dictionary-view">
              <div className="mode-switch"><button onClick={() => setView("bible")}><BookOpen size={17} /> Bíblia</button><button className="active" onClick={() => setView("dictionary")}><BookText size={17} /> Dicionário teológico</button></div>
              <div className="page-title"><span className="eyebrow">Projeto L.M. Lemos</span><h1>Dicionário Teológico</h1><p>Amplo Conhecimento · identidade evangélica · 260 verbetes</p></div>
              <label className="dictionary-search"><Search size={20} /><input value={dictionarySearch} onChange={(e) => setDictionarySearch(e.target.value)} placeholder="Pesquise qualquer palavra ou conteúdo..." /></label>
              <div className="dictionary-letters" aria-label="Filtrar dicionário por letra">
                <button className={dictionaryLetter === "TODAS" ? "active" : ""} onClick={() => setDictionaryLetter("TODAS")}>Todas</button>
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => <button key={letter} className={dictionaryLetter === letter ? "active" : ""} onClick={() => setDictionaryLetter(letter)}>{letter}</button>)}
              </div>
              {!dictionary ? <ReaderSkeleton /> : selectedEntry ? (
                <article className="dictionary-entry">
                  <button className="back-link" onClick={() => setSelectedEntry(null)}><ChevronLeft /> Voltar aos verbetes</button>
                  <span className="category">{selectedEntry.category}</span><h2>{selectedEntry.term}</h2><p className="lead">{selectedEntry.definition}</p>
                  <EntrySection title="Importância teológica" text={selectedEntry.importance} /><EntrySection title="Leitura bíblica" text={selectedEntry.reading} />
                  <EntrySection title="Perspectiva desta obra" text={selectedEntry.perspective} /><EntrySection title="Não confunda" text={selectedEntry.distinction} />
                  <EntrySection title="Aplicação" text={selectedEntry.application} /><EntrySection title="Para aprofundar" text={selectedEntry.deeper} />
                </article>
              ) : (
                <div className="dictionary-grid">{dictionaryResults.map((entry) => <button key={entry.term} onClick={() => setSelectedEntry(entry)} className="dictionary-card"><span>{entry.category}</span><strong>{entry.term}</strong><p>{entry.definition}</p><small>Ler verbete <ChevronRight size={15} /></small></button>)}</div>
              )}
            </section>
          )}

          {view === "more" && (
            <section className="content-view more-resources-view">
              {moreResource ? <>
                <button className="back-link" onClick={() => { setMoreResource(null); setResourceSearch(""); setResourceLetter("TODAS"); }}><ChevronLeft /> Voltar aos recursos</button>
                <div className="page-title"><span className="eyebrow">Mais recursos</span><h1>{moreResource}</h1></div>
                <ResourceContent resource={moreResource} goToReference={goToReference} search={resourceSearch} setSearch={setResourceSearch} letter={resourceLetter} setLetter={setResourceLetter} externalItems={externalResourceItems[moreResource] || resourceExternal[moreResource] || []} />
              </> : <>
                <div className="page-title"><span className="eyebrow">Ferramentas para aprofundar</span><h1>Mais recursos</h1><p>Escolha uma ferramenta de estudo bíblico.</p></div>
                <div className="more-resources-grid">
                  {[
                    ["Strong", "Palavras do hebraico e grego, números Strong e significados."],
                    ["Estudos STEP Bible", "Recursos para estudo dos textos e idiomas originais."],
                    ["Mapas Bíblicos", "Explore os lugares e a geografia dos acontecimentos bíblicos."],
                    ["Pessoas", "Conheça personagens, relações e referências bíblicas."],
                    ["Lugares", "Consulte cidades, regiões e outros lugares mencionados na Bíblia."],
                    ["Genealogias", "Acompanhe famílias e linhagens registradas nas Escrituras."],
                    ["Referências Cruzadas", "Encontre outros textos relacionados a uma passagem."],
                    ["Pesos e Medidas", "Entenda unidades, valores e medidas usadas no mundo bíblico."],
                    ["Viagens Bíblicas", "Acompanhe jornadas e deslocamentos narrados na Bíblia."],
                    ["Assuntos Bíblicos", "Estude temas bíblicos por assunto e suas referências."],
                  ].map(([title, description]) => (
                    <button key={title} className="more-resource-card" onClick={() => { setMoreResource(title as MoreResource); setResourceSearch(""); setResourceLetter("TODAS"); }}>
                      <strong>{title}</strong><span>{description}</span><ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              </>}
            </section>
          )}

          {view === "topics" && (
            <section className="content-view"><div className="page-title"><span className="eyebrow">A Bíblia por tema</span><h1>Assuntos</h1><p>Abra um assunto e siga as principais passagens no próprio texto bíblico.</p></div>
              <div className="topics-grid">{TOPICS.map((topic) => <article key={topic.name} className="topic-card"><span className="topic-icon"><Sparkles size={18} /></span><h2>{topic.name}</h2><p>{topic.description}</p><div className="reference-list">{topic.refs.map((item) => <button key={item.label} onClick={() => goToReference(item)}>{item.label}<ChevronRight size={14} /></button>)}</div></article>)}</div>
            </section>
          )}

          {view === "studies" && (
            <section className="content-view"><div className="page-title"><span className="eyebrow">Formação cristã</span><h1>Estudos bíblicos</h1><p>Estudos evangélicos com a Bíblia como autoridade final.</p></div>
              <div className="studies-list">{STUDIES.map((study, index) => <article key={study.title} className="study-card"><div className="study-number">{String(index + 1).padStart(2,"0")}</div><div><span className="category">Estudo essencial</span><h2>{study.title}</h2><p className="study-subtitle">{study.subtitle}</p><ol>{study.sections.map((section) => <li key={section}>{section}</li>)}</ol><div className="study-refs">{study.refs.map((item) => <span key={item}>{item}</span>)}</div></div></article>)}</div>
            </section>
          )}

          {view === "help" && (
            <section className="help-view">
              <button className="help-back" onClick={() => setView("bible")}><ChevronLeft /> Voltar para a Bíblia</button>
              <div className="help-card">
                <span className="eyebrow">Contribuição voluntária</span>
                <h1>{settings.help_title || "Como ajudar"}</h1>
                <p className="help-content">{settings.help_content}</p>
                <div className="help-principle"><ShieldCheck /><div><strong>O Evangelho não está à venda</strong><p>Não cobramos para pregar ou ensinar a Palavra de Deus. A contribuição é voluntária e ajuda nas necessidades da vida e na continuidade deste trabalho.</p></div></div>
                <div className="donation-box">
                  <label>Quanto você deseja doar ou ofertar?<div className="donation-input"><span>R$</span><input inputMode="decimal" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value.replace(/[^0-9,.]/g, ""))} placeholder="0,00" /></div></label>
                  <small>{settings.donation_note || "Você pode doar o valor que quiser. Toda contribuição é voluntária."}</small>
                  <button className="donation-button" onClick={startDonation} disabled={donationBusy}><ShieldCheck /> {donationBusy ? "Abrindo pagamento..." : (settings.donation_button_label || "Fazer doação e ofertar")}</button>
                  <p className="donation-provider">Pagamento processado com segurança pela InfinitePay.</p>
                  {donationMessage && <p className="auth-message" role="status">{donationMessage}</p>}
                </div>
              </div>
              <button className="help-back help-back-bottom" onClick={() => setView("bible")}><BookOpen /> Voltar para a Bíblia</button>
            </section>
          )}

          {view === "aboutMore" && (
            <section className="about-more-view"><button className="help-back" onClick={() => setView("bible")}><ChevronLeft /> Voltar para a Bíblia</button><article className="about-more-card"><span className="eyebrow">Projeto L.M. Lemos</span><h1>{settings.about_more_title || "Saiba mais"}</h1><div className="about-more-copy">{settings.about_more_content}</div><div className="about-more-principle"><ShieldCheck /><div><strong>O Evangelho não está à venda</strong><p>Luan Maciel de Lemos não aceita dinheiro para pregar o Evangelho nem para oferecer estudos bíblicos. O acesso a este projeto e ao ensino bíblico aqui oferecido permanece gratuito.</p></div></div><div className="about-more-confession"><ul><li>O Louvor é Dado A O Senhor Deus!</li><li>Somente A Deus A Glória!</li><li>Honra e majestade!</li><li>Somente as Escrituras!</li><li>Só Jesus Cristo salva!</li><li>Só O Espírito Santo Converte o homem do pecado.</li><li>Salvação somente pela Graça de Deus!</li><li>Somente a Fé em Deus e em Cristo!</li><li>Jesus Cristo Voltará!</li></ul></div><div className="about-links">{[[settings.social_1_label,settings.social_1_url],[settings.social_2_label,settings.social_2_url],[settings.social_3_label,settings.social_3_url],[settings.social_4_label,settings.social_4_url]].map(([label,url],i)=>label&&url?<a key={i} href={url} target="_blank" rel="noopener noreferrer">{label}<ExternalLink size={16}/></a>:null)}{settings.personal_site_url&&<a href={settings.personal_site_url} target="_blank" rel="noopener noreferrer">Site <ExternalLink size={16}/></a>}{settings.books_projects_url&&<a href={settings.books_projects_url} target="_blank" rel="noopener noreferrer">Conheça livros e projetos <BookOpen size={16}/></a>}{settings.whatsapp_channel_url&&<a href={settings.whatsapp_channel_url} target="_blank" rel="noopener noreferrer">Canal do WhatsApp <MessageSquareText size={16}/></a>}</div></article></section>
          )}

          {view === "appeal" && (
            <section className="appeal-view"><div className="appeal-cross" aria-hidden="true"/><span className="eyebrow">Um convite do Evangelho</span><h1>Jesus Cristo é Senhor</h1><p className="appeal-lead">A Bíblia anuncia que Jesus é o Filho de Deus, morreu pelos pecados, ressuscitou dentre os mortos e voltará com poder e glória.</p>
              <blockquote>“Se com a tua boca confessares ao Senhor Jesus, e em teu coração creres que Deus o ressuscitou dentre os mortos, serás salvo.”<cite>Romanos 10:9 — Almeida 1819, Bíblia Livre</cite></blockquote>
              <div className="appeal-steps"><div><b>1</b><span><strong>Reconheça</strong>Confesse seu pecado e sua necessidade da graça de Deus.</span></div><div><b>2</b><span><strong>Arrependa-se</strong>Volte-se do pecado para Deus e não adie esse chamado.</span></div><div><b>3</b><span><strong>Creia em Jesus</strong>Confie no Filho de Deus, em sua morte e ressurreição.</span></div><div><b>4</b><span><strong>Confesse e siga</strong>Confesse Jesus como Senhor e caminhe em obediência, numa igreja fiel à Palavra.</span></div></div>
              <div className="return-call"><Sparkles /><div><strong>Jesus voltará!</strong><p>Hoje é tempo de buscar a Deus. A salvação é pela graça, mediante a fé — não é comprada por obras, dinheiro ou religião.</p></div></div>
              <Button size="lg" onClick={() => goToReference({ book: 44, chapter: 10, verse: 9 })}>Ler Romanos 10 <BookOpen /></Button>
            </section>
          )}
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Navegação principal">
        <NavButton icon={<BookOpen />} label="Bíblia" active={view === "bible"} onClick={() => setView("bible")} />
        <NavButton icon={<BookText />} label="Dicionário" active={view === "dictionary"} onClick={() => setView("dictionary")} />
        <NavButton icon={<Sparkles />} label="Assuntos" active={view === "topics"} onClick={() => setView("topics")} />
        <NavButton icon={<GraduationCap />} label="Estudos" active={view === "studies"} onClick={() => setView("studies")} />
        <NavButton icon={<MessageSquareText />} label="Jesus" active={view === "appeal"} onClick={() => setView("appeal")} />
        <NavButton icon={<span className="more-nav-icon">👍🏻+</span>} label="Ver mais" active={view === "more"} onClick={() => setView("more")} />
      </nav>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className={`search-dialog theme-${theme}`}><DialogHeader><DialogTitle>Pesquisar na Bíblia</DialogTitle></DialogHeader>
          <label className="global-search"><Search /><input autoFocus value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Digite uma palavra ou frase..." /></label>
          <div className="search-results">{searchText.length < 2 ? <p className="empty-message">Digite pelo menos duas letras para pesquisar nos 31.102 versículos.</p> : searchResults.length ? searchResults.map((item) => <button key={`${item.book}-${item.chapter}-${item.verse}`} onClick={() => goToReference(item)}><strong>{BOOK_NAMES[item.book]} {item.chapter}:{item.verse}</strong><span>{item.text}</span></button>) : <p className="empty-message">Nenhum versículo encontrado.</p>}</div>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedVerse} onOpenChange={(open) => !open && setSelectedVerse(null)}>
        <SheetContent side="bottom" className={`verse-sheet theme-${theme}`}><SheetHeader><SheetTitle>{selectedVerse && `${BOOK_NAMES[selectedVerse.book]} ${selectedVerse.chapter}:${selectedVerse.verse.number}`}</SheetTitle></SheetHeader>
          {selectedVerse && <div className="verse-tools"><p className="selected-text">{selectedVerse.verse.text}</p>
            <section><h3><Highlighter /> Marcar com cor</h3><div className="color-row">{COLORS.map((color) => <button key={color.value} className={selectedColor === color.value ? "color-selected" : ""} onClick={() => saveColor(color.value)} title={color.name} aria-label={`${color.name}${selectedColor === color.value ? " selecionado" : ""}`} style={{ background: color.value }} />)}<button className="clear-color" onClick={() => saveColor(undefined)} aria-label="Remover cor"><X /></button></div></section>
            <section><h3><FileText /> Minha nota</h3><Textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Escreva aqui o que você aprendeu..." rows={4} /><Button onClick={saveNote}>Salvar nota</Button>{status && <span className="saved-status">{status}</span>}</section>
            <section><h3><Download /> Criar imagem</h3><p>Crie um cartão deste versículo no tema escolhido e salve ou compartilhe no celular.</p><Button variant="outline" onClick={createVerseImage}>Criar imagem do versículo</Button></section>
            <section className="deep-study"><h3><GraduationCap /> Estudo profundo</h3><div className="original-language"><span>{selectedVerse.book < 39 ? "Hebraico bíblico" : "Grego koiné"}</span>{originalWords.slice(0,4).map((word) => <div key={word.script}><b dir={selectedVerse.book < 39 ? "rtl" : "ltr"}>{word.script}</b><span><strong>{word.transliteration}</strong><small>Pronúncia aproximada: {word.pronunciation}</small><em>{word.meaning}</em></span></div>)}</div>
              <div className="context-box"><strong>Contexto literário</strong><p>{BOOK_INFO[selectedVerse.book].summary} Este versículo deve ser lido dentro do argumento do capítulo {selectedVerse.chapter}, observando os versos anteriores e posteriores.</p>{nearby?.map((verse) => <p key={verse.number} className={verse.number === selectedVerse.verse.number ? "current-context" : ""}><b>{verse.number}</b> {verse.text}</p>)}</div>
              <div className="study-guidance"><strong>Como aprofundar</strong><p>Observe quem fala, para quem fala e qual problema ou promessa está em foco. Compare passagens claras sobre o mesmo tema. As palavras acima são termos-chave representativos do idioma original; a aplicação deve permanecer subordinada ao contexto completo das Escrituras.</p></div>
            </section>
          </div>}
        </SheetContent>
      </Sheet>

      <Sheet open={themeOpen} onOpenChange={setThemeOpen}><SheetContent side="right" className={`theme-sheet theme-${theme}`}><SheetHeader><SheetTitle>Escolha o tema</SheetTitle></SheetHeader><div className="theme-options">{(Object.keys(themeLabels) as Theme[]).map((item) => <button key={item} className={`theme-option preview-${item} ${theme === item ? "selected" : ""}`} onClick={() => { setTheme(item); setThemeOpen(false); }}><span/><strong>{themeLabels[item]}</strong>{theme === item && <small>Em uso</small>}</button>)}</div></SheetContent></Sheet>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}><DialogContent className={`about-dialog theme-${theme}`}><DialogHeader><DialogTitle>Informações do projeto</DialogTitle></DialogHeader><div className="about-content">
        <div className="info-notice"><ShieldCheck /><div><strong>Projeto gratuito para todos</strong><p>É proibida a venda deste sistema. Ele foi criado para servir às pessoas e compartilhar a Palavra de Deus.</p></div></div>
        <p>Devemos respeitar e sempre temer a Deus: não roubar, não trapacear e, sim, amar o próximo.</p>
        {settings.information_content && <div className="custom-info"><strong>Informação adicional</strong><p>{settings.information_content}</p></div>}
        <button className="external-info-button about-more-button" onClick={() => { setAboutOpen(false); setView("aboutMore"); }}>Saiba mais <ChevronRight size={16}/></button>
        {settings.external_button_label && settings.external_button_url && <a className="external-info-button" href={settings.external_button_url} target="_blank" rel="noopener noreferrer">{settings.external_button_label}<ExternalLink size={16} /></a>}
        <p><strong>Bíblia:</strong> Almeida 1819 — Bíblia Livre. A fonte de dados identifica esta versão histórica como domínio público.</p><p><strong>Dicionário:</strong> Dicionário Teológico — Amplo Conhecimento, Projeto L.M. Lemos, por Luan Maciel de Lemos.</p><p><strong>Identidade:</strong> cristã evangélica, com influência reformada, cânon protestante de 66 livros e autoridade final das Escrituras.</p><p>Comentários, introduções e estudos são recursos humanos de apoio. Eles não possuem a mesma autoridade do texto bíblico.</p>
      </div></DialogContent></Dialog>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}><DialogContent className={`auth-dialog theme-${theme}`}><DialogHeader><DialogTitle>{user ? "Minha conta" : "Acesse sua conta"}</DialogTitle></DialogHeader>
        {user ? <div className="account-panel">
          <div className="account-identity"><span><UserRound /></span><div><strong>{profileName || "Usuário"}</strong><small>{user.email}</small></div></div>
          <p>Suas marcações e notas ficam sincronizadas nesta conta.</p>
          <div className="account-library-actions">
            <Button variant="outline" onClick={() => setSavedListMode("notes")}><FileText /> Minhas anotações</Button>
            <Button variant="outline" onClick={() => setSavedListMode("marks")}><Highlighter /> Minhas marcações</Button>
          </div>
          <Button className="help-account-button" onClick={() => { setAuthOpen(false); setView("help"); }}><Sparkles /> Como ajudar</Button>
          {isAdmin && <Button onClick={() => { setAuthOpen(false); setAdminOpen(true); }}><ShieldCheck /> Painel administrador</Button>}
          <Button variant="outline" onClick={signOut}><LogOut /> Sair da conta</Button>
        </div> : <>
          <div className="auth-tabs"><button className={authMode === "login" ? "active" : ""} onClick={() => { setAuthMode("login"); setAuthMessage(""); }}>Entrar</button><button className={authMode === "register" ? "active" : ""} onClick={() => { setAuthMode("register"); setAuthMessage(""); }}>Criar cadastro</button></div>
          <form className="auth-form" onSubmit={submitAuth}>
            {authMode === "register" && <label>Nome<input required autoComplete="name" value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Seu nome" /></label>}
            <label>E-mail<input required type="email" autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="voce@exemplo.com" /></label>
            <label>Senha<input required minLength={6} type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Mínimo de 6 caracteres" /></label>
            {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
            <Button type="submit" disabled={authBusy}>{authBusy ? "Aguarde..." : authMode === "register" ? "Criar minha conta" : "Entrar"}</Button>
            <small>Ao entrar, suas notas e marcações deste aparelho serão levadas para sua conta.</small>
          </form>
        </>}
      </DialogContent></Dialog>

      <Dialog open={!!savedListMode} onOpenChange={(open) => !open && setSavedListMode(null)}><DialogContent className={`saved-list-dialog theme-${theme}`}><DialogHeader><DialogTitle>{savedListMode === "notes" ? "Minhas anotações" : "Minhas marcações"}</DialogTitle></DialogHeader>
        <div className="saved-list">
          {savedItems.filter((item) => savedListMode === "notes" ? Boolean(item.annotation.note?.trim()) : Boolean(item.annotation.color)).length === 0 ? <p className="empty-message">{savedListMode === "notes" ? "Você ainda não fez anotações." : "Você ainda não marcou versículos."}</p> :
            savedItems.filter((item) => savedListMode === "notes" ? Boolean(item.annotation.note?.trim()) : Boolean(item.annotation.color)).map((item) => <button key={item.key} onClick={() => { setSavedListMode(null); setAuthOpen(false); goToReference({ book: item.book, chapter: item.chapter, verse: item.verse }); }}>
              <span className="saved-reference">{item.annotation.color && <i style={{ background: item.annotation.color }} />}{BOOK_NAMES[item.book]} {item.chapter}:{item.verse}</span>
              {savedListMode === "notes" && <strong>{item.annotation.note}</strong>}
              <small>{item.verseText}</small>
            </button>)}
        </div>
      </DialogContent></Dialog>

      <Dialog open={adminOpen} onOpenChange={setAdminOpen}><DialogContent className={`admin-dialog theme-${theme}`}><DialogHeader><DialogTitle><ShieldCheck /> Painel administrador</DialogTitle></DialogHeader>
        <div className="admin-content">
          <section><div className="admin-section-heading"><div><span>Visão geral</span><h3>Acessos ao projeto</h3></div><div className="stats-filters">{(["day", "month", "year", "all"] as StatsRange[]).map((range) => <button key={range} className={statsRange === range ? "active" : ""} onClick={() => setStatsRange(range)}>{{ day: "Dia", month: "Mês", year: "Ano", all: "Sempre" }[range]}</button>)}</div></div>
            <div className="stats-grid"><StatCard icon={<UserRound />} label="Sem cadastro" value={statsLoading ? "—" : stats.guest} /><StatCard icon={<ShieldCheck />} label="Com cadastro" value={statsLoading ? "—" : stats.registered} /><StatCard icon={<BarChart3 />} label="Total de acessos" value={statsLoading ? "—" : stats.total} /><StatCard icon={<UserRound />} label="Contas criadas" value={statsLoading ? "—" : stats.users} /></div>
            <small className="stats-note">Acessos são contados uma vez por aparelho, por dia e por tipo. Notas privadas dos usuários não ficam visíveis ao administrador.</small>
          </section>
          <section><div className="admin-section-heading"><div><span>Área pública</span><h3>Configurar informações</h3></div></div>
            <form className="settings-form" onSubmit={saveSettings}>
              <label>Nome do botão personalizado<input value={settingsDraft.external_button_label} onChange={(event) => setSettingsDraft((old) => ({ ...old, external_button_label: event.target.value }))} placeholder="Ex.: Conheça nosso ministério" /></label>
              <label>Link externo<input type="url" value={settingsDraft.external_button_url} onChange={(event) => setSettingsDraft((old) => ({ ...old, external_button_url: event.target.value }))} placeholder="https://..." /></label>
              <label>Informação adicional<Textarea rows={4} value={settingsDraft.information_content} onChange={(event) => setSettingsDraft((old) => ({ ...old, information_content: event.target.value }))} placeholder="Escreva o texto que aparecerá na página de informações." /></label>
              <div className="admin-help-divider"><strong>Página “Saiba mais”</strong><small>Configure o texto e os links públicos. Você pode adicionar até quatro redes sociais.</small></div>
              <label>Título<input value={settingsDraft.about_more_title} onChange={(e)=>setSettingsDraft(o=>({...o,about_more_title:e.target.value}))}/></label>
              <label>Texto da página<Textarea rows={7} value={settingsDraft.about_more_content} onChange={(e)=>setSettingsDraft(o=>({...o,about_more_content:e.target.value}))}/></label>
              <label>Rede social 1 — nome<input value={settingsDraft.social_1_label} onChange={(e)=>setSettingsDraft(o=>({...o,social_1_label:e.target.value}))}/></label><label>Rede social 1 — link<input type="url" value={settingsDraft.social_1_url} onChange={(e)=>setSettingsDraft(o=>({...o,social_1_url:e.target.value}))}/></label>
              <label>Rede social 2 — nome<input value={settingsDraft.social_2_label} onChange={(e)=>setSettingsDraft(o=>({...o,social_2_label:e.target.value}))}/></label><label>Rede social 2 — link<input type="url" value={settingsDraft.social_2_url} onChange={(e)=>setSettingsDraft(o=>({...o,social_2_url:e.target.value}))}/></label>
              <label>Rede social 3 — nome<input value={settingsDraft.social_3_label} onChange={(e)=>setSettingsDraft(o=>({...o,social_3_label:e.target.value}))}/></label><label>Rede social 3 — link<input type="url" value={settingsDraft.social_3_url} onChange={(e)=>setSettingsDraft(o=>({...o,social_3_url:e.target.value}))}/></label>
              <label>Rede social 4 — nome<input value={settingsDraft.social_4_label} onChange={(e)=>setSettingsDraft(o=>({...o,social_4_label:e.target.value}))}/></label><label>Rede social 4 — link<input type="url" value={settingsDraft.social_4_url} onChange={(e)=>setSettingsDraft(o=>({...o,social_4_url:e.target.value}))}/></label>
              <label>Link do site<input type="url" value={settingsDraft.personal_site_url} onChange={(e)=>setSettingsDraft(o=>({...o,personal_site_url:e.target.value}))}/></label>
              <label>Link “Conheça livros e projetos”<input type="url" value={settingsDraft.books_projects_url} onChange={(e)=>setSettingsDraft(o=>({...o,books_projects_url:e.target.value}))}/></label>
              <label>Link do canal do WhatsApp<input type="url" value={settingsDraft.whatsapp_channel_url} onChange={(e)=>setSettingsDraft(o=>({...o,whatsapp_channel_url:e.target.value}))}/></label>
              <div className="admin-help-divider"><strong>Página “Como ajudar”</strong><small>Estes textos podem ser alterados quando quiser. O recebimento continua na InfinitePay da conta luanmacielxx.</small></div>
              <label>Título da página<input value={settingsDraft.help_title} onChange={(event) => setSettingsDraft((old) => ({ ...old, help_title: event.target.value }))} /></label>
              <label>Texto principal<Textarea rows={6} value={settingsDraft.help_content} onChange={(event) => setSettingsDraft((old) => ({ ...old, help_content: event.target.value }))} /></label>
              <label>Texto do botão<input value={settingsDraft.donation_button_label} onChange={(event) => setSettingsDraft((old) => ({ ...old, donation_button_label: event.target.value }))} /></label>
              <label>Observação sobre a contribuição<Textarea rows={3} value={settingsDraft.donation_note} onChange={(event) => setSettingsDraft((old) => ({ ...old, donation_note: event.target.value }))} /></label>
              <Button type="submit" disabled={settingsBusy}><Save /> {settingsBusy ? "Salvando..." : "Salvar informações"}</Button>{status && <span className="saved-status">{status}</span>}
            </form>
          </section>
        </div>
      </DialogContent></Dialog>
    </div>
  );
}

const RESOURCE_DATA: Record<string, {title:string; text:string; refs?: ScriptureRef[]}[]> = {
  "Strong": [
    ["G26 · ἀγάπη · agápē","amor, afeição; amor que busca o bem do outro."],["G32 · ἄγγελος · ángelos","mensageiro; anjo."],["G40 · ἅγιος · hágios","santo, separado, consagrado."],["G4102 · πίστις · pístis","fé, confiança, fidelidade."],["G5485 · χάρις · cháris","graça, favor, bondade concedida."],["G4991 · σωτηρία · sōtēría","salvação, livramento."],["G3341 · μετάνοια · metánoia","arrependimento, mudança de mente."],["G1680 · ἐλπίς · elpís","esperança, expectativa."],["G1515 · εἰρήνη · eirēnē","paz, bem-estar."],["G3056 · λόγος · lógos","palavra, mensagem, razão."],["G4151 · πνεῦμα · pneûma","espírito, sopro, vento."],["G2222 · ζωή · zōḗ","vida."],["G2288 · θάνατος · thánatos","morte."],["G2316 · θεός · theós","Deus, divindade."],["G2962 · κύριος · kýrios","senhor, mestre."],
    ["H1 · אָב · av","pai, ancestral."],["H430 · אֱלֹהִים · elohím","Deus; seres divinos conforme o contexto."],["H3068 · יהוה · YHWH","nome divino representado pelo tetragrama."],["H2617 · חֶסֶד · chésed","bondade, misericórdia, amor leal."],["H7965 · שָׁלוֹם · shalóm","paz, integridade, bem-estar."],["H5315 · נֶפֶשׁ · néfesh","vida, pessoa, ser vivente; tradicionalmente alma."],["H7307 · רוּחַ · rúach","vento, sopro, espírito."],["H8451 · תּוֹרָה · toráh","instrução, lei."],["H1697 · דָּבָר · davár","palavra, assunto, coisa."],["H6666 · צְדָקָה · tsedaqáh","justiça, retidão."],["H539 · אָמַן · amán","ser firme, confiar, crer."],["H1285 · בְּרִית · berít","aliança, pacto."],["H4428 · מֶלֶךְ · mélekh","rei."],["H5030 · נָבִיא · naví","profeta."],["H6944 · קֹדֶשׁ · qódesh","santidade, coisa santa."]
  ].map(([title,text])=>({title,text})),
  "Estudos STEP Bible": [
    ["Texto hebraico etiquetado","O TAHOT reúne o texto hebraico do Antigo Testamento com etiquetas lexicais, semânticas e morfológicas."],["Texto grego etiquetado","O TAGNT reúne palavras de importantes edições gregas do Novo Testamento e marca variantes, lema, Strong e morfologia."],["TBESH","Léxico breve de Extended Strong's para hebraico, relacionado ao BDB."],["TBESG","Léxico breve de Extended Strong's para grego, compatível com Strong tradicional."],["TFLSJ","Léxico grego LSJ formatado e ligado ao Extended Strong's."],["Morfologia hebraica","Códigos expandidos explicam pessoa, gênero, número, estado e formas verbais."],["Morfologia grega","Códigos expandidos ajudam a identificar classe, caso, número, tempo, voz, modo e pessoa."],["Nomes próprios TIPNR","Pessoas, lugares e coisas são individualizados, com formas hebraicas/gregas e referências."],["Versificação","Dados do STEP ajudam a comparar diferenças de numeração entre tradições textuais."],["Como usar","Pesquise no Strong para começar pelo lema; use os estudos STEP para aprofundar forma, morfologia e relações."]
  ].map(([title,text])=>({title,text})),
  "Mapas Bíblicos": [
    ["Jerusalém","Centro religioso e político em muitos períodos bíblicos; ligada ao templo e aos acontecimentos finais do ministério terreno de Jesus."],["Belém","Cidade de Judá ligada a Davi e ao nascimento de Jesus."],["Nazaré","Cidade da Galileia onde Jesus cresceu."],["Cafarnaum","Cidade junto ao mar da Galileia ligada a muitos episódios do ministério de Jesus."],["Mar da Galileia","Lago de água doce também chamado mar de Tiberíades e lago de Genesaré."],["Rio Jordão","Rio importante na geografia bíblica; associado à entrada em Canaã e ao batismo de Jesus."],["Mar Morto","Grande lago salgado ao leste de Judá."],["Monte das Oliveiras","Elevação a leste de Jerusalém, frequente nos relatos dos Evangelhos."],["Sinai","Região montanhosa associada à aliança e entrega da Lei no Êxodo."],["Roma","Capital do Império Romano e destino final da narrativa de Atos."],["Corinto","Cidade da Acaia ligada ao ministério de Paulo."],["Éfeso","Cidade da Ásia Menor e importante centro do ministério de Paulo."],["Antioquia da Síria","Importante centro da igreja primitiva e ponto de partida de viagens missionárias."],["Damasco","Cidade ligada à conversão/chamado de Paulo."],["Cesareia Marítima","Centro administrativo romano na Judeia, presente em Atos."],["Samaria","Região entre Judeia e Galileia."],["Galileia","Região setentrional onde ocorreu grande parte do ministério de Jesus."],["Judeia","Região meridional em torno de Jerusalém."],["Egito","País central na história de José, do Êxodo e em outros períodos bíblicos."],["Babilônia","Cidade e império associados ao exílio de Judá."]
  ].map(([title,text])=>({title,text})),
  "Pessoas": [
    {title:"Adão",text:"Primeiro homem na narrativa de Gênesis.",refs:[{label:"Gênesis 2:7",book:0,chapter:2,verse:7}]},{title:"Eva",text:"Primeira mulher na narrativa de Gênesis.",refs:[{label:"Gênesis 3:20",book:0,chapter:3,verse:20}]},{title:"Noé",text:"Construtor da arca na narrativa do dilúvio.",refs:[{label:"Gênesis 6:9",book:0,chapter:6,verse:9}]},{title:"Abraão",text:"Patriarca chamado por Deus; pai de Isaque.",refs:[{label:"Gênesis 12:1",book:0,chapter:12,verse:1}]},{title:"Sara",text:"Esposa de Abraão e mãe de Isaque.",refs:[{label:"Gênesis 21:2",book:0,chapter:21,verse:2}]},{title:"Isaque",text:"Filho de Abraão e Sara.",refs:[{label:"Gênesis 21:3",book:0,chapter:21,verse:3}]},{title:"Jacó",text:"Filho de Isaque, também chamado Israel.",refs:[{label:"Gênesis 32:28",book:0,chapter:32,verse:28}]},{title:"José",text:"Filho de Jacó levado ao Egito.",refs:[{label:"Gênesis 37:28",book:0,chapter:37,verse:28}]},{title:"Moisés",text:"Líder de Israel no Êxodo.",refs:[{label:"Êxodo 3:10",book:1,chapter:3,verse:10}]},{title:"Josué",text:"Sucessor de Moisés.",refs:[{label:"Josué 1:1",book:5,chapter:1,verse:1}]},{title:"Rute",text:"Moabita ligada à linhagem de Davi.",refs:[{label:"Rute 1:16",book:7,chapter:1,verse:16}]},{title:"Samuel",text:"Profeta e juiz de Israel.",refs:[{label:"1 Samuel 3:20",book:8,chapter:3,verse:20}]},{title:"Davi",text:"Rei de Israel, filho de Jessé.",refs:[{label:"1 Samuel 16:13",book:8,chapter:16,verse:13}]},{title:"Salomão",text:"Filho de Davi e rei de Israel.",refs:[{label:"1 Reis 2:12",book:10,chapter:2,verse:12}]},{title:"Elias",text:"Profeta do reino do Norte.",refs:[{label:"1 Reis 17:1",book:10,chapter:17,verse:1}]},{title:"Isaías",text:"Profeta de Judá.",refs:[{label:"Isaías 6:8",book:22,chapter:6,verse:8}]},{title:"Jeremias",text:"Profeta atuante antes e durante a queda de Jerusalém.",refs:[{label:"Jeremias 1:5",book:23,chapter:1,verse:5}]},{title:"Daniel",text:"Judeu exilado na Babilônia e personagem central do livro de Daniel.",refs:[{label:"Daniel 1:6",book:26,chapter:1,verse:6}]},{title:"João Batista",text:"Precursor de Jesus.",refs:[{label:"Mateus 3:1",book:39,chapter:3,verse:1}]},{title:"Maria",text:"Mãe de Jesus.",refs:[{label:"Lucas 1:30",book:41,chapter:1,verse:30}]},{title:"Pedro",text:"Apóstolo de Jesus.",refs:[{label:"Mateus 4:18",book:39,chapter:4,verse:18}]},{title:"João",text:"Apóstolo de Jesus, filho de Zebedeu.",refs:[{label:"Mateus 4:21",book:39,chapter:4,verse:21}]},{title:"Paulo",text:"Apóstolo e missionário; anteriormente chamado Saulo.",refs:[{label:"Atos 9:15",book:43,chapter:9,verse:15}]},{title:"Barnabé",text:"Cooperador da igreja primitiva e companheiro de Paulo.",refs:[{label:"Atos 11:22",book:43,chapter:11,verse:22}]}
  ],
  "Lugares": [["Jerusalém","Cidade central na história de Israel e do cristianismo primitivo."],["Belém","Cidade de Judá ligada a Davi e ao nascimento de Jesus."],["Nazaré","Cidade da Galileia onde Jesus cresceu."],["Cafarnaum","Cidade da Galileia ligada ao ministério de Jesus."],["Betânia","Aldeia próxima a Jerusalém associada a Marta, Maria e Lázaro."],["Jericó","Cidade no vale do Jordão presente em narrativas do AT e NT."],["Hebrom","Cidade antiga de Judá ligada aos patriarcas e a Davi."],["Siquém","Lugar importante nas narrativas patriarcais e de Israel."],["Samaria","Nome de cidade e região do reino do Norte."],["Damasco","Antiga cidade da Síria ligada à experiência de Paulo."],["Antioquia","Importante centro da igreja primitiva."],["Tarso","Cidade da Cilícia associada ao nascimento de Paulo."],["Éfeso","Cidade da Ásia Menor ligada ao ministério apostólico."],["Corinto","Cidade grega da Acaia ligada a Paulo."],["Filipos","Cidade macedônica visitada por Paulo."],["Tessalônica","Cidade macedônica com comunidade cristã destinatária de cartas de Paulo."],["Atenas","Cidade grega onde Paulo discursou no Areópago."],["Roma","Capital imperial e destino de Paulo em Atos."],["Babilônia","Cidade/império associado ao exílio de Judá."],["Nínive","Capital assíria ligada ao livro de Jonas."],["Ur","Cidade associada às origens de Abraão."],["Harã","Lugar onde a família de Abraão viveu antes de Canaã."],["Egito","País ligado a José, Moisés e ao Êxodo."],["Sinai","Região associada à entrega da Lei."],["Patmos","Ilha associada a João no Apocalipse."]].map(([title,text])=>({title,text})),
  "Genealogias": [["De Adão a Noé","Adão → Sete → Enos → Cainã → Maalalel → Jarede → Enoque → Matusalém → Lameque → Noé."],["Filhos de Noé","Noé → Sem, Cam e Jafé."],["Patriarcas","Abraão → Isaque → Jacó (Israel) → doze filhos, ligados às tribos de Israel."],["Judá até Davi","A tradição genealógica segue Judá e, por gerações, chega a Jessé → Davi."],["Casa de Davi","Jessé → Davi → Salomão e a linhagem real de Judá."],["Mateus 1","Genealogia organizada de Abraão a Davi, do exílio e até Jesus."],["Lucas 3","Genealogia de Jesus apresentada em ordem retrospectiva até Adão."],["Levi e sacerdócio","Levi → Coate → Anrão → Arão; a casa de Arão ocupa papel sacerdotal central."],["Família de Jacó","Jacó é pai de Rúben, Simeão, Levi, Judá, Dã, Naftali, Gade, Aser, Issacar, Zebulom, José e Benjamim."],["Família de Jessé","Jessé é pai de Davi e de outros filhos mencionados nas tradições de Samuel e Crônicas."]].map(([title,text])=>({title,text})),
  "Referências Cruzadas": [
    {title:"Criação",text:"Gênesis 1:1 ↔ João 1:1–3",refs:[{label:"Gênesis 1:1",book:0,chapter:1,verse:1},{label:"João 1:1",book:42,chapter:1,verse:1}]},{title:"Abraão e fé",text:"Gênesis 15:6 ↔ Romanos 4:3",refs:[{label:"Gênesis 15:6",book:0,chapter:15,verse:6},{label:"Romanos 4:3",book:44,chapter:4,verse:3}]},{title:"Justo pela fé",text:"Habacuque 2:4 ↔ Romanos 1:17",refs:[{label:"Habacuque 2:4",book:34,chapter:2,verse:4},{label:"Romanos 1:17",book:44,chapter:1,verse:17}]},{title:"Amor de Deus",text:"João 3:16 ↔ Romanos 5:8 ↔ 1 João 4:9",refs:[{label:"João 3:16",book:42,chapter:3,verse:16},{label:"Romanos 5:8",book:44,chapter:5,verse:8},{label:"1 João 4:9",book:61,chapter:4,verse:9}]},{title:"Salvação pela graça",text:"Efésios 2:8 ↔ Romanos 3:24 ↔ Tito 3:5",refs:[{label:"Efésios 2:8",book:48,chapter:2,verse:8},{label:"Romanos 3:24",book:44,chapter:3,verse:24},{label:"Tito 3:5",book:55,chapter:3,verse:5}]},{title:"Bom Pastor",text:"Salmo 23 ↔ João 10",refs:[{label:"Salmos 23:1",book:18,chapter:23,verse:1},{label:"João 10:11",book:42,chapter:10,verse:11}]},{title:"Novo pacto",text:"Jeremias 31:31 ↔ Hebreus 8:8",refs:[{label:"Jeremias 31:31",book:23,chapter:31,verse:31},{label:"Hebreus 8:8",book:57,chapter:8,verse:8}]},{title:"Servo sofredor",text:"Isaías 53 ↔ 1 Pedro 2",refs:[{label:"Isaías 53:5",book:22,chapter:53,verse:5},{label:"1 Pedro 2:24",book:59,chapter:2,verse:24}]},{title:"Ressurreição",text:"João 11:25 ↔ 1 Coríntios 15:20",refs:[{label:"João 11:25",book:42,chapter:11,verse:25},{label:"1 Coríntios 15:20",book:45,chapter:15,verse:20}]},{title:"Nova criação",text:"Isaías 65:17 ↔ Apocalipse 21:1",refs:[{label:"Isaías 65:17",book:22,chapter:65,verse:17},{label:"Apocalipse 21:1",book:65,chapter:21,verse:1}]}
  ],
  "Pesos e Medidas": [["Côvado","Comprimento baseado no antebraço; aproximadamente 45 cm, com variações históricas."],["Palmo","Medida aproximada da mão aberta; cerca de metade de um côvado."],["Dedo","Pequena unidade de comprimento; aproximadamente 1/24 de um côvado em alguns sistemas."],["Cana","Unidade maior de comprimento mencionada em contextos de medição."],["Estádio","Medida greco-romana de distância, frequentemente estimada em cerca de 185 m."],["Milha romana","Mil passos duplos romanos; aproximadamente 1,48 km."],["Siclo","Unidade de peso e referência monetária; o padrão variou conforme época e região."],["Beca","Meio siclo."],["Gerá","Pequena unidade de peso; tradicionalmente 1/20 de siclo."],["Mina","Unidade de peso/valor maior que o siclo; equivalências variam entre sistemas."],["Talento","Grande unidade de peso e valor; não deve ser convertido em dinheiro moderno sem explicar época e material."],["Efa","Medida de capacidade para secos."],["Bato","Medida de capacidade para líquidos."],["Ômer","Medida de capacidade, relacionada a outras unidades hebraicas."],["Him","Medida de líquidos."],["Coro","Grande medida de capacidade."],["Denário","Moeda romana; Mateus 20:2 a apresenta como pagamento combinado por um dia de trabalho."],["Dracma","Moeda grega mencionada no Novo Testamento."],["Didracma","Valor correspondente a duas dracmas."],["Estáter","Moeda de valor variável; em Mateus 17:27 aparece no episódio do tributo."],["Quadrante","Pequena moeda romana."],["Lepto","Moeda de baixíssimo valor, conhecida no episódio da oferta da viúva."]].map(([title,text])=>({title,text})),
  "Viagens Bíblicas": [["Abraão","Ur → Harã → Canaã → Egito → Canaã; depois deslocamentos entre regiões de Canaã."],["Jacó","Canaã → Padã-Arã/Harã → retorno a Canaã → Egito no fim da vida."],["José","Canaã → Egito, após ser vendido; sua família posteriormente desce ao Egito."],["Êxodo","Egito → região do mar → deserto → Sinai → jornadas no deserto → fronteiras de Canaã."],["Espias","Do deserto em direção a Canaã para reconhecimento da terra, conforme Números."],["Josué","Travessia do Jordão e campanhas em Canaã."],["Rute","Moabe → Belém com Noemi."],["Davi","Belém → corte de Saul → fugas por Judá e arredores → Hebrom → Jerusalém."],["Elias","Atuação em Israel, Sarepta, Carmelo, Horebe e outros locais."],["Jonas","Parte em direção a Társis, passa pelo mar e depois vai a Nínive."],["Jesus: infância","Belém → Egito → Nazaré, conforme Mateus; Lucas enfatiza Belém e retorno à Galileia."],["Jesus: ministério","Galileia, Judeia, Samaria e regiões vizinhas, culminando em Jerusalém."],["Paulo: 1ª viagem","Antioquia da Síria → Chipre → Perge → Antioquia da Pisídia → Icônio → Listra → Derbe → retorno."],["Paulo: 2ª viagem","Antioquia → Síria/Cilícia → Listra → Trôade → Filipos → Tessalônica → Bereia → Atenas → Corinto → retorno."],["Paulo: 3ª viagem","Antioquia → Galácia/Frígia → Éfeso → Macedônia → Grécia → Trôade → Mileto → Jerusalém."],["Paulo a Roma","Cesareia → portos do Mediterrâneo → tempestade/naufrágio → Malta → Itália → Roma."]].map(([title,text])=>({title,text})),
  "Assuntos Bíblicos": [
    ["Graça","Efésios 2:8; Romanos 3:24; Tito 2:11"],["Fé","Hebreus 11:1; Romanos 10:17; Tiago 2:17"],["Amor","1 Coríntios 13; 1 João 4:7-10; João 13:34"],["Oração","Mateus 6:6-13; Filipenses 4:6; 1 Tessalonicenses 5:17"],["Perdão","1 João 1:9; Efésios 4:32; Mateus 6:14"],["Salvação","João 3:16; Atos 4:12; Romanos 10:9"],["Arrependimento","Marcos 1:15; Atos 2:38; 2 Coríntios 7:10"],["Santidade","1 Pedro 1:15-16; Hebreus 12:14"],["Espírito Santo","João 14:26; Atos 1:8; Gálatas 5:22-23"],["Jesus Cristo","João 1:1-14; Colossenses 1:15-20; Filipenses 2:5-11"],["Ressurreição","João 11:25; 1 Coríntios 15; 1 Pedro 1:3"],["Segunda vinda","Mateus 24; Atos 1:11; 1 Tessalonicenses 4:16-17"],["Igreja","Atos 2:42-47; 1 Coríntios 12; Efésios 4:11-16"],["Batismo","Mateus 28:19; Atos 2:38; Romanos 6:3-4"],["Ceia do Senhor","Lucas 22:19-20; 1 Coríntios 11:23-26"],["Casamento","Gênesis 2:24; Mateus 19:4-6; Efésios 5:22-33"],["Família","Deuteronômio 6:6-7; Efésios 6:1-4"],["Sabedoria","Provérbios 1:7; Tiago 1:5; Tiago 3:17"],["Ansiedade","Mateus 6:25-34; Filipenses 4:6-7; 1 Pedro 5:7"],["Sofrimento","Romanos 8:18; Tiago 1:2-4; 1 Pedro 4:12-13"],["Esperança","Romanos 5:3-5; Romanos 15:13; 1 Pedro 1:3"],["Justificação","Romanos 3:28; Romanos 5:1; Gálatas 2:16"],["Pecado","Romanos 3:23; Romanos 6:23; 1 João 3:4"],["Tentação","Mateus 4:1-11; 1 Coríntios 10:13; Tiago 1:13-15"],["Jejum","Mateus 6:16-18; Atos 13:2-3"],["Evangelismo","Mateus 28:19-20; Marcos 16:15; Romanos 1:16"],["Generosidade","2 Coríntios 9:6-8; Atos 20:35"],["Humildade","Filipenses 2:3-8; Tiago 4:6"],["Adoração","João 4:23-24; Romanos 12:1; Salmo 95"],["Juízo","Mateus 25:31-46; Hebreus 9:27; Apocalipse 20:11-15"]
  ].map(([title,text])=>({title,text:"Referências principais: "+text}))
};

function cleanResourceText(value:string, resource:string, title:boolean) {
  let text=value.split("\\n").join(" ").replace(/\\_/g,"_").replace(/\s+/g," ").trim();
  const books:Record<string,string>={GEN:"Gn",EXO:"Êx",LEV:"Lv",NUM:"Nm",DEU:"Dt",JOS:"Js",JDG:"Jz",RUT:"Rt","1SA":"1Sm","2SA":"2Sm","1KI":"1Rs","2KI":"2Rs","1CH":"1Cr","2CH":"2Cr",EZR:"Ed",NEH:"Ne",EST:"Et",JOB:"Jó",PSA:"Sl",PRO:"Pv",ECC:"Ec",SNG:"Ct",ISA:"Is",JER:"Jr",LAM:"Lm",EZK:"Ez",DAN:"Dn",HOS:"Os",JOL:"Jl",AMO:"Am",OBA:"Ob",JON:"Jn",MIC:"Mq",NAM:"Na",HAB:"Hc",ZEP:"Sf",HAG:"Ag",ZEC:"Zc",MAL:"Ml",MAT:"Mt",MRK:"Mc",LUK:"Lc",JHN:"Jo",ACT:"At",ROM:"Rm","1CO":"1Co","2CO":"2Co",GAL:"Gl",EPH:"Ef",PHP:"Fp",COL:"Cl","1TH":"1Ts","2TH":"2Ts","1TI":"1Tm","2TI":"2Tm",TIT:"Tt",PHM:"Fm",HEB:"Hb",JAS:"Tg","1PE":"1Pe","2PE":"2Pe","1JN":"1Jo","2JN":"2Jo","3JN":"3Jo",JUD:"Jd",REV:"Ap"};
  text=text.replace(/\b(1CH|2CH|1SA|2SA|1KI|2KI|1CO|2CO|1TH|2TH|1TI|2TI|1PE|2PE|1JN|2JN|3JN|GEN|EXO|LEV|NUM|DEU|JOS|JDG|RUT|EZR|NEH|EST|JOB|PSA|PRO|ECC|SNG|ISA|JER|LAM|EZK|DAN|HOS|JOL|AMO|OBA|JON|MIC|NAM|HAB|ZEP|HAG|ZEC|MAL|MAT|MRK|LUK|JHN|ACT|ROM|GAL|EPH|PHP|COL|TIT|PHM|HEB|JAS|JUD|REV)[.]?(\d+)[.:](\d+)\b/g,(_,b,ch,v)=>`${books[b]||b} ${ch}:${v}`);
  if(resource==="Genealogias"||resource==="Pessoas"){
    text=text.replace(/\{\\?"father\\?":\s*\\?"([^"]+)\\?"/g,"Pai: $1").replace(/\\?"mother\\?":\s*\\?"([^"]+)\\?"/g," · Mãe: $1").replace(/\\?"partners\\?":\s*\[([^\]]+)\]/g," · Cônjuge: $1").replace(/\\?"siblings\\?":\s*\[([^\]]+)\]/g," · Irmãos: $1").replace(/\\?"offspring\\?":\s*\[([^\]]+)\]/g," · Filhos: $1");
    text=text.replace(/_[A-Za-z0-9_]+/g,"").replace(/[{}\[\]"\\]/g,"").replace(/,\s*,/g,", ").replace(/\s+/g," ");
    const cut=text.indexOf("Dados de nomes"); const cut2=text.indexOf("Nomes e referências"); const at=cut>=0?cut:cut2; if(at>=0) text=text.slice(0,at).trim();
    text=text.replace(/^Male living at the time of /,"Homem do período: ").replace(/^Female living at the time of /,"Mulher do período: ").replace("Egypt and Wilderness","Egito e peregrinação no deserto").replace("United monarchy","monarquia unida").replace("Exile and return","exílio e retorno");
  }
  if(resource==="Lugares"||resource==="Mapas Bíblicos"){
    text=text.replace(/Place Coordenadas:/g,"Coordenadas:").replace(/"lat":/g,"latitude:").replace(/"lon":/g,"longitude:").replace(/"precision":\s*"exact"/g,"precisão exata").replace(/"id":\s*"[^"]+",?/g,"").replace(/"name":/g,"nome atual:").replace(/\["([^"]+)"\]/g,"$1").replace(/[{}\[\]"\\]/g,"").replace(/river/g,"rio").replace(/mountain range/g,"cadeia de montanhas").replace(/settlement/g,"povoado").replace(/Nomes, Strong e referências:.*/,"").trim();
  }
  if(resource==="Viagens Bíblicas"){
    text=text.replace(/Paul's First Missionary Journey/g,"Primeira viagem missionária de Paulo").replace(/Acts/g,"Atos").replace(/c\. AD/g,"c. d.C.").replace(/\(conventional\)/g,"(datação aproximada)").replace(/One commonly proposed reconstruction following the sequence of Atos\. Alternative reconstructions and segment-level routing are not modeled; some legs \(e\.g\. sea crossings\) are drawn as direct lines between named stops\./g,"Reconstrução histórica aproximada baseada na sequência narrada em Atos; alguns trechos podem variar entre estudiosos.");
  }
  if(resource==="Strong"||resource==="Estudos STEP Bible"){
    text=text.replace(/Sentido:/g,"Significado resumido:").replace(/Idioma: greek/g,"Idioma: grego").replace(/Transliteração:/g,"Transliteração:");
    if(!title){ const parts=text.split(/(?=Sentido resumido:|Significado resumido:|Idioma:|Morfologia:|Código morfológico:)/); if(parts.length>1) text=parts.slice(-4).join(" "); }
  }
  return text.replace(/\\?"/g,"").replace(/\s+([.,;:])/g,"$1").trim();
}

const FIRST_TEN_JOURNEY_MAPS = [
  {title:"Paulo — 1ª viagem missionária",ref:"Atos 13–14",places:["Antioquia da Síria","Selêucia","Salamina","Pafos","Perge","Antioquia da Pisídia","Icônio","Listra","Derbe"]},
  {title:"Paulo — 2ª viagem missionária",ref:"Atos 15:36–18:22",places:["Antioquia","Listra","Trôade","Filipos","Tessalônica","Bereia","Atenas","Corinto","Éfeso"]},
  {title:"Paulo — 3ª viagem missionária",ref:"Atos 18:23–21:17",places:["Antioquia","Galácia","Éfeso","Macedônia","Grécia","Trôade","Mileto","Tiro","Jerusalém"]},
  {title:"Paulo — viagem a Roma",ref:"Atos 27–28",places:["Cesareia","Sidom","Mira","Cnido","Creta","Malta","Siracusa","Régio","Putéoli","Roma"]}
]

function JourneyMaps(){
  return <section className="journey-maps"><div className="journey-maps-heading"><strong>Mapas das viagens de Paulo</strong><p>Esquemas visuais do percurso, em ordem narrativa. As linhas indicam a sequência dos lugares e não uma escala geográfica exata.</p></div><div className="journey-map-grid">{FIRST_TEN_JOURNEY_MAPS.map((journey,index)=><article className="journey-map-card" key={journey.title}><div className="journey-map-title"><span>{index+1}</span><div><h2>{journey.title}</h2><small>{journey.ref}</small></div></div><div className="journey-map-canvas" role="img" aria-label={`Mapa esquemático da viagem de ${journey.title}`}><svg viewBox="0 0 600 230" preserveAspectRatio="none" aria-hidden="true"><path d="M45 175 C115 70 180 185 250 105 S390 55 455 125 S525 180 565 70" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray="9 10"/></svg>{journey.places.map((place,i)=>{const total=Math.max(journey.places.length-1,1);const left=8+(i/total)*84;const top=72+Math.sin(i*1.65)*23;return <div className="journey-stop" key={place+i} style={{left:`${left}%`,top:`${top}%`}}><b>{i+1}</b><span>{place}</span></div>})}</div></article>)}</div></section>;
}

function ResourceContent({ resource, goToReference, search, setSearch, letter, setLetter, externalItems }: { resource: Exclude<MoreResource, null>; goToReference: (ref: ScriptureRef) => void; search:string; setSearch:(v:string)=>void; letter:string; setLetter:(v:string)=>void; externalItems:{title:string;text:string;refs?:ScriptureRef[]}[] }) {
  const q=normalize(search.trim());
  const baseItems=externalItems.length ? externalItems : (RESOURCE_DATA[resource]||[]);
  const cleaned=baseItems.map(item=>({ ...item, title: cleanResourceText(item.title, resource, true), text: cleanResourceText(item.text, resource, false) }));
  const alphaLabel=(item:{title:string;text:string})=>{
    let label=item.title.replace(/^(?:G|H)\d+\s*[·—-]?\s*/i,"").replace(/^Estudo lexical\s+\d+\s*[—-]\s*/i,"").replace(/^Relações familiares\s*[—-]\s*/i,"").trim();
    if(resource==="Strong") {
      const meaning=item.text.match(/Significado(?: resumido)?:\s*([^.;]+)/i)?.[1]?.trim();
      if(meaning) label=meaning;
    }
    if(resource==="Estudos STEP Bible") {
      const meaning=item.text.match(/Significado resumido:\s*([^.;]+)/i)?.[1]?.trim();
      if(meaning) label=meaning;
    }
    return normalize(label);
  };
  const items=cleaned.filter(item=>{ const searchOk=!q||normalize(item.title+" "+item.text).includes(q); const letterOk=letter==="TODAS"||alphaLabel(item).startsWith(normalize(letter)); return searchOk&&letterOk; }).sort((a,b)=>alphaLabel(a).localeCompare(alphaLabel(b),"pt-BR"));
  return <div className="resource-content">\n    {resource === "Viagens Bíblicas" ? <JourneyMaps /> : null}\n    <label className="dictionary-search"><Search size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={"Pesquisar em "+resource+"..."} /></label>
    <div className="dictionary-letters resource-letters" aria-label="Filtrar por letra"><button className={letter==="TODAS"?"active":""} onClick={()=>setLetter("TODAS")}>Todas</button>{"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l=><button key={l} className={letter===l?"active":""} onClick={()=>setLetter(l)}>{l}</button>)}</div>
    <div className="resource-note"><strong>{items.length} itens nesta seção</strong><p>{externalItems.length>=200 ? "Base aberta carregada: "+externalItems.length+" registros disponíveis nesta seleção." : resource==="Strong" ? "Conteúdo lexical selecionado para estudo." : "Conteúdo ampliado para estudo e consulta."}</p></div>
    <div className="resource-list">{items.length?items.map(item=><article key={item.title} className="resource-item"><h2>{item.title}</h2><p>{item.text}</p>{item.refs?.length?<div className="reference-list">{item.refs.map(ref=><button key={ref.label} onClick={()=>goToReference(ref)}>{ref.label}<ChevronRight size={14}/></button>)}</div>:null}</article>):<p className="empty-message">Nenhum item encontrado.</p>}</div>
    <div className="resource-credits"><strong>Fontes e atribuição</strong><p>Dados linguísticos e de nomes: STEP Bible Data, CC BY 4.0. Geografia: OpenBible.info Bible Geocoding Data, CC BY 4.0. Conteúdo temático pode ser ampliado com Nave's Topical Bible (obra em domínio público), respeitando a licença da compilação utilizada.</p></div>
  </div>;
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) { return <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{label}</span></button>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function EntrySection({ title, text }: { title: string; text?: string }) { if (!text) return null; return <section><h3>{title}</h3><p>{text}</p></section>; }
function ReaderSkeleton() { return <div className="reader-skeleton"><span/><span/><span/><span/><span/></div>; }
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) { return <div className="stat-card"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>; }
