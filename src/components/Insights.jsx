import { useEffect, useRef, useState } from "react";
import { AlertCircle, BarChart3, CalendarDays, CheckCheck, Clock, RefreshCw, Sparkles, Target } from "lucide-react";
import {
  generateSuggestion, getMonthlyAnalytics, getSuggestions, getWeeklyAnalytics,
  markSuggestionRead, syncTaskAnalytics,
} from "../api/insightsService";
import { getApiError } from "../utils/apiError";

const DAY_MS = 86400000;
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50";
const cardClass = "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

// Start with the local calendar date; use UTC arithmetic to avoid DST offsets.
function isoWeekForDate(date) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  const year = day.getUTCFullYear();
  const january = new Date(Date.UTC(year, 0, 1));
  return { year, week: Math.ceil(((day - january) / DAY_MS + 1) / 7) };
}

function weeksInYear(year) {
  return isoWeekForDate(new Date(year, 11, 28)).week;
}

function number(value) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

function minutes(value) {
  return `${number(value).toLocaleString()} min`;
}

function dateLabel(value) {
  if (!value) return "Not available";
  // LocalDate values must not shift to the previous day in western time zones.
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
}

function createdLabel(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function useInsightsAnalytics(selection, revision) {
  const { period, year, week, month } = selection;
  const [refresh, setRefresh] = useState(0);
  const [syncRevision, setSyncRevision] = useState(0);
  const [state, setState] = useState({ data: null, pending: true, error: "" });
  const [sync, setSync] = useState({ pending: false, error: "", notice: "" });
  const syncController = useRef(null);
  const previous = useRef({ revision, syncRevision });

  useEffect(() => {
    let active = true;
    let controller;
    let request = 0;
    const timers = [];
    const catchUp = previous.current.revision !== revision || previous.current.syncRevision !== syncRevision;
    previous.current = { revision, syncRevision };

    async function load(clearData = false) {
      if (!active) return;
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      const current = ++request;
      setState((old) => ({ data: clearData ? null : old.data, pending: true, error: "" }));
      setSync((old) => ({ ...old, pending: false }));
      try {
        const data = period === "week"
          ? await getWeeklyAnalytics(year, week, signal)
          : await getMonthlyAnalytics(year, month, signal);
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("Invalid analytics response.");
        }
        if (active && !signal.aborted && current === request) {
          setState({ data, pending: false, error: "" });
        }
      } catch (error) {
        if (active && !signal.aborted && current === request) {
          setState((old) => ({ ...old, pending: false, error: getApiError(error, "Unable to load analytics.") }));
        }
      }
    }

    // Defer the initial state transition; cleanup also cancels StrictMode replays.
    Promise.resolve().then(() => load(true));
    if (catchUp) {
      // Only two follow-ups, measured from the change/202 acceptance. Never poll indefinitely.
      timers.push(setTimeout(() => load(), 1000), setTimeout(() => load(), 3000));
    }
    return () => {
      active = false;
      controller?.abort();
      syncController.current?.abort();
      syncController.current = null;
      timers.forEach(clearTimeout);
    };
  }, [period, year, week, month, revision, refresh, syncRevision]);

  async function queueSync() {
    if (syncController.current) return;
    const controller = new AbortController();
    syncController.current = controller;
    setSync({ pending: true, error: "", notice: "" });
    try {
      await syncTaskAnalytics(controller.signal);
      if (!controller.signal.aborted) {
        setSync({ pending: false, error: "", notice: "Sync queued; analytics may take a moment. Refresh again if changes are not visible yet." });
        setSyncRevision((value) => value + 1);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setSync({ pending: false, error: getApiError(error, "Unable to queue analytics sync."), notice: "" });
      }
    } finally {
      if (syncController.current === controller) syncController.current = null;
    }
  }

  return { ...state, sync, queueSync, refresh: () => setRefresh((value) => value + 1) };
}

function useInsightsSuggestions(revision) {
  const [refresh, setRefresh] = useState(0);
  const [state, setState] = useState({ items: [], pending: true, error: "", actionError: "", generating: false, reading: {} });
  const actions = useRef(new Map());
  const listController = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    listController.current = controller;
    async function load() {
      if (controller.signal.aborted) return;
      setState((old) => ({ ...old, pending: true, error: "", actionError: "", generating: false, reading: {} }));
      try {
        const items = await getSuggestions(controller.signal);
        if (!controller.signal.aborted) setState((old) => ({ ...old, items, pending: false }));
      } catch (error) {
        if (!controller.signal.aborted) {
          setState((old) => ({ ...old, pending: false, error: getApiError(error, "Unable to load suggestions.") }));
        }
      }
    }
    Promise.resolve().then(load);
    const pendingActions = actions.current;
    return () => {
      controller.abort();
      pendingActions.forEach((action) => action.abort());
      pendingActions.clear();
    };
  }, [revision, refresh]);

  async function mutate(id) {
    const generating = id === undefined;
    const key = generating ? "generate" : `read:${id}`;
    if (actions.current.has(key) || state.pending) return;
    // Invalidate any list response before it can overwrite a mutation result.
    listController.current?.abort();
    const controller = new AbortController();
    actions.current.set(key, controller);
    setState((old) => ({ ...old, actionError: "", generating: generating || old.generating,
      reading: generating ? old.reading : { ...old.reading, [id]: true } }));
    try {
      const item = generating ? await generateSuggestion(controller.signal) : await markSuggestionRead(id, controller.signal);
      if (!item || item.suggestionId == null) throw new Error("Invalid suggestion response.");
      if (!controller.signal.aborted) {
        setState((old) => ({ ...old, items: generating
          ? [item, ...old.items.filter((entry) => entry.suggestionId !== item.suggestionId)].slice(0, 5)
          : old.items.map((entry) => entry.suggestionId === item.suggestionId ? item : entry) }));
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setState((old) => ({ ...old, actionError: getApiError(error, generating ? "Unable to generate a suggestion." : "Unable to mark this suggestion as read.") }));
      }
    } finally {
      if (actions.current.get(key) === controller) actions.current.delete(key);
      if (!controller.signal.aborted) {
        setState((old) => ({ ...old, generating: generating ? false : old.generating,
          reading: generating ? old.reading : { ...old.reading, [id]: false } }));
      }
    }
  }

  return { ...state, refresh: () => setRefresh((value) => value + 1),
    generate: () => mutate(), markRead: (id) => mutate(id) };
}

function InsightsError({ message, retry, pending }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 break-words">{message}</span>
      {retry && <button type="button" className={buttonClass} onClick={retry} disabled={pending}>Try again</button>}
    </div>
  );
}

function InsightsMetrics({ data }) {
  const rate = Math.min(100, number(data.completionRate));
  const metrics = [
    { label: "Total tasks", value: number(data.totalTasks).toLocaleString(), detail: `${number(data.completedTasks)} completed`, Icon: CheckCheck, color: "bg-indigo-50 text-indigo-600" },
    { label: "Completion rate", value: `${rate.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`, detail: "Of tasks in this period", Icon: Target, color: "bg-green-50 text-green-600" },
    { label: "Overdue tasks", value: number(data.overdueTasks).toLocaleString(), detail: "Unfinished and past due", Icon: AlertCircle, color: "bg-amber-50 text-amber-700" },
    { label: "Time spent", value: minutes(data.totalActualMinutes), detail: `${minutes(data.totalEstimatedMinutes)} estimated`, Icon: Clock, color: "bg-purple-50 text-purple-600" },
  ];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {metrics.map((metric) => {
      const { label, value, detail, color } = metric;
      const MetricIcon = metric.Icon;
      return <div className={cardClass} key={label}>
        <div className="mb-4 flex items-center justify-between gap-2"><p className="text-sm font-medium text-gray-500">{label}</p><span className={`rounded-xl p-2 ${color}`}><MetricIcon className="h-5 w-5" aria-hidden="true" /></span></div>
        <p className="break-words text-3xl font-bold tracking-tight text-gray-900">{value}</p>
        <p className="mt-2 text-sm text-gray-500">{detail}</p>
      </div>;
    })}
  </div>;
}

function InsightsBreakdown({ data }) {
  const categories = Object.entries(data.categoryAllocation || {}).map(([name, value]) => [name, number(value)]).sort((a, b) => b[1] - a[1]);
  const total = categories.reduce((sum, [, value]) => sum + value, 0);
  const timeline = Array.isArray(data.timeline) ? data.timeline : [];
  const max = Math.max(1, ...timeline.flatMap((day) => [number(day.allocatedMinutes), number(day.spentMinutes)]));
  return <div className="grid items-start gap-5 lg:grid-cols-3">
    <section className={cardClass} aria-label="Category allocation">
      <h3 className="font-semibold text-gray-900">Where your time is planned</h3>
      <p className="mt-1 text-sm text-gray-500">Estimated minutes by category</p>
      {!categories.length ? <p className="py-8 text-sm text-gray-500">No category allocation in this period.</p> : <ul className="mt-5 space-y-5">
        {categories.map(([name, value]) => <li key={name}>
          <div className="mb-2 flex justify-between gap-3 text-sm"><span className="min-w-0 break-words font-medium text-gray-700">{name || "GENERAL"}</span><span className="shrink-0 text-gray-500">{minutes(value)}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-indigo-50" aria-hidden="true"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${total ? value / total * 100 : 0}%` }} /></div>
          <p className="mt-1 text-xs text-gray-500">{total ? Math.round(value / total * 100) : 0}% of allocated time</p>
        </li>)}
      </ul>}
    </section>
    <section className={`${cardClass} min-w-0 lg:col-span-2`} aria-label="Daily timeline">
      <h3 className="font-semibold text-gray-900">Your daily rhythm</h3>
      <p className="mt-1 text-sm text-gray-500">Planned time, actual time, and completed tasks</p>
      {!timeline.length ? <p className="py-8 text-sm text-gray-500">No daily activity in this period.</p> : <div className="mt-4 max-h-96 overflow-auto rounded-xl border border-gray-100" tabIndex={0} aria-label="Scrollable daily activity table">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Daily activity. All time values are minutes. Indigo bars represent planned time; purple bars represent time spent.</caption>
          <thead className="sticky top-0 bg-gray-50 text-xs text-gray-500"><tr><th scope="col" className="p-3">Date</th><th scope="col" className="p-3">Planned</th><th scope="col" className="p-3">Spent</th><th scope="col" className="p-3">Completed</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{timeline.map((day, index) => <tr key={`${day.date}-${index}`}>
            <th scope="row" className="whitespace-nowrap p-3 font-medium text-gray-700">{dateLabel(day.date)}</th>
            <td className="min-w-24 p-3 text-gray-600">{minutes(day.allocatedMinutes)}<div aria-hidden="true" className="mt-1 h-1.5 rounded bg-indigo-50"><div className="h-full rounded bg-indigo-500" style={{ width: `${number(day.allocatedMinutes) / max * 100}%` }} /></div></td>
            <td className="min-w-24 p-3 text-gray-600">{minutes(day.spentMinutes)}<div aria-hidden="true" className="mt-1 h-1.5 rounded bg-purple-50"><div className="h-full rounded bg-purple-500" style={{ width: `${number(day.spentMinutes) / max * 100}%` }} /></div></td>
            <td className="p-3 text-gray-600">{number(day.completedTasks)}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </section>
  </div>;
}

export default function Insights({ revision = 0 }) {
  const [selection, setSelection] = useState(() => {
    const today = new Date();
    const iso = isoWeekForDate(today);
    return { period: "week", year: iso.year, week: iso.week, month: today.getMonth() + 1, monthlyYear: today.getFullYear() };
  });
  const analytics = useInsightsAnalytics(selection, revision);
  const suggestions = useInsightsSuggestions(revision);
  const mutationPending = suggestions.generating || Object.values(suggestions.reading).some(Boolean);
  // Unread first, read last; the sort is stable so recency order is kept within each group.
  const orderedSuggestions = [...suggestions.items].sort((a, b) => Number(Boolean(a.read)) - Number(Boolean(b.read)));

  function changePeriod(period) {
    setSelection((old) => {
      if (old.period === period) return old;
      const today = new Date();
      const iso = isoWeekForDate(today);
      return period === "month"
        ? { ...old, period, weeklyYear: old.year, year: old.monthlyYear }
        : { ...old, period, monthlyYear: old.year, year: old.weeklyYear ?? iso.year };
    });
  }

  function changeYear(value) {
    const year = Number(value);
    if (!Number.isInteger(year) || year < 1900 || year > 9999) return;
    setSelection((old) => ({ ...old, year, week: Math.min(old.week, weeksInYear(year)) }));
  }

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div><div className="flex items-center gap-2 text-indigo-600"><BarChart3 className="h-6 w-6" aria-hidden="true" /><h2 className="text-2xl font-bold">Productivity insights</h2></div><p className="mt-2 text-sm text-gray-500">Understand your progress and find your next small improvement.</p></div>
      <button type="button" className={buttonClass} onClick={analytics.queueSync} disabled={analytics.sync.pending}><RefreshCw className={`h-4 w-4 ${analytics.sync.pending ? "animate-spin" : ""}`} aria-hidden="true" />{analytics.sync.pending ? "Queuing sync…" : "Sync task analytics"}</button>
    </header>
    {analytics.sync.notice && <p role="status" className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{analytics.sync.notice}</p>}
    <InsightsError message={analytics.sync.error} />

    <section className="space-y-5" aria-label="Productivity analytics" aria-busy={analytics.pending}>
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-gray-50 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Period</p><div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
            {["week", "month"].map((period) => <button type="button" key={period} aria-pressed={selection.period === period} onClick={() => changePeriod(period)} className={`rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 ${selection.period === period ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-indigo-50"}`}>{period === "week" ? "Weekly" : "Monthly"}</button>)}
          </div></div>
          <label className="text-sm font-medium text-gray-600">{selection.period === "week" ? "ISO week-year" : "Year"}<input type="number" min="1900" max="9999" value={selection.year} onChange={(event) => changeYear(event.target.value)} className="mt-1 block w-28 rounded-xl border border-gray-200 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></label>
          {selection.period === "week" ? <label className="text-sm font-medium text-gray-600">ISO week<select value={selection.week} onChange={(event) => setSelection((old) => ({ ...old, week: Number(event.target.value) }))} className="mt-1 block rounded-xl border border-gray-200 bg-white px-3 py-2 focus:ring-2 focus:ring-indigo-200">{Array.from({ length: weeksInYear(selection.year) }, (_, index) => <option key={index + 1} value={index + 1}>Week {index + 1}</option>)}</select></label>
            : <label className="text-sm font-medium text-gray-600">Month<select value={selection.month} onChange={(event) => setSelection((old) => ({ ...old, month: Number(event.target.value) }))} className="mt-1 block rounded-xl border border-gray-200 bg-white px-3 py-2 focus:ring-2 focus:ring-indigo-200">{Array.from({ length: 12 }, (_, index) => <option key={index} value={index + 1}>{new Date(2024, index, 1).toLocaleDateString(undefined, { month: "long" })}</option>)}</select></label>}
        </div>
        <button type="button" className={buttonClass} disabled={analytics.pending || analytics.sync.pending} onClick={analytics.refresh}><RefreshCw className={`h-4 w-4 ${analytics.pending ? "animate-spin" : ""}`} aria-hidden="true" />Refresh analytics</button>
      </div>
      <InsightsError message={analytics.error} retry={analytics.refresh} pending={analytics.pending} />
      {analytics.pending && <p role="status" className="text-sm text-indigo-600">Loading analytics…</p>}
      {analytics.data && <>
        <p className="flex flex-wrap items-center gap-2 text-sm text-gray-500"><CalendarDays className="h-4 w-4" aria-hidden="true" /><span>{analytics.data.period === "MONTH" ? "Monthly" : "Weekly"} report: {dateLabel(analytics.data.startDate)} – {dateLabel(analytics.data.endDate)}</span></p>
        {analytics.error && <p className="text-sm text-amber-700">Showing the last successful report for this selection.</p>}
        <InsightsMetrics data={analytics.data} />
        {number(analytics.data.totalTasks) === 0 && <p className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">No tasks recorded for this period yet. Choose another period or sync your task analytics.</p>}
        <InsightsBreakdown data={analytics.data} />
      </>}
    </section>

    <section className={`${cardClass} space-y-4`} aria-label="Productivity suggestions" aria-busy={suggestions.pending}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Sparkles className="h-5 w-5 text-purple-600" aria-hidden="true" />A little guidance, a better day</h2><p className="mt-1 text-sm text-gray-500">Your five most recent suggestions. Generate one when you want fresh guidance based on the current week.</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass} disabled={suggestions.pending || mutationPending} onClick={suggestions.refresh}><RefreshCw className={`h-4 w-4 ${suggestions.pending ? "animate-spin" : ""}`} aria-hidden="true" />Refresh suggestions</button>
          <button type="button" className={`${buttonClass} border-transparent bg-indigo-600 text-white hover:bg-indigo-700`} disabled={suggestions.pending || mutationPending} onClick={suggestions.generate}><Sparkles className="h-4 w-4" aria-hidden="true" />{suggestions.generating ? "Generating…" : "Generate suggestion"}</button>
        </div>
      </div>
      <InsightsError message={suggestions.error} retry={suggestions.refresh} pending={suggestions.pending || mutationPending} />
      <InsightsError message={suggestions.actionError} />
      {suggestions.pending && <p role="status" className="text-sm text-indigo-600">Loading suggestions…</p>}
      {!suggestions.pending && !suggestions.error && !suggestions.items.length && <div className="rounded-xl bg-purple-50 p-6 text-center"><Sparkles className="mx-auto mb-2 h-7 w-7 text-purple-400" aria-hidden="true" /><p className="font-medium text-gray-700">Your next insight starts here</p><p className="mt-1 text-sm text-gray-500">No suggestions yet. Use Generate suggestion to request one.</p></div>}
      <ul className="grid gap-4 md:grid-cols-2">{orderedSuggestions.map((item) => <li key={item.suggestionId} className={`min-w-0 rounded-xl border p-4 ${item.read ? "border-gray-200 bg-gray-50" : "border-purple-100 bg-gradient-to-br from-purple-50 to-white"}`}>
        <div className="mb-3 flex flex-wrap gap-2 text-xs"><span className="break-words rounded-full bg-white px-2 py-1 font-medium text-purple-700">{item.type || "SUGGESTION"}</span><span className="break-words rounded-full bg-white px-2 py-1 text-gray-500">Source: {item.source || "Unknown"}</span><span className={`rounded-full px-2 py-1 ${item.read ? "bg-gray-200 text-gray-600" : "bg-indigo-100 text-indigo-700"}`}>{item.read ? "Read" : "Unread"}</span></div>
        <h3 className="break-words font-semibold text-gray-900">{item.title || "Productivity suggestion"}</h3>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-600">{item.message}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><time dateTime={item.createdAt || undefined} className="text-xs text-gray-500">{createdLabel(item.createdAt)}</time>{!item.read && <button type="button" className={buttonClass} disabled={suggestions.pending || suggestions.generating || suggestions.reading[item.suggestionId]} onClick={() => suggestions.markRead(item.suggestionId)}><CheckCheck className="h-4 w-4" aria-hidden="true" />{suggestions.reading[item.suggestionId] ? "Marking read…" : "Mark as read"}</button>}</div>
      </li>)}</ul>
    </section>
  </div>;
}