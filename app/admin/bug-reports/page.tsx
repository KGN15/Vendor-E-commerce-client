"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Bug,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  User,
  X,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/axios";

/* =========================================================
   TYPES
========================================================= */

type BugStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type BugCategory = "UI" | "FUNCTIONAL" | "PERFORMANCE" | "OTHER";
type BugPriority = "LOW" | "MEDIUM" | "HIGH";

interface BugUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  avatar?: string | null;
}

interface BugReply {
  _id?: string;
  id?: string;
  message: string;
  admin?: BugUser;
  createdAt: string;
}

interface BugReport {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: BugCategory;
  priority?: BugPriority;
  status: BugStatus;
  pageUrl?: string;
  user?: BugUser;
  replies?: BugReply[];
  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   HELPERS
========================================================= */

const getReportId = (report: BugReport) => {
  return report._id || report.id || "";
};

const getStatusLabel = (status: BugStatus) => {
  switch (status) {
    case "OPEN":
      return "Open";
    case "IN_PROGRESS":
      return "In Progress";
    case "RESOLVED":
      return "Resolved";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
};

const getStatusClass = (status: BugStatus) => {
  switch (status) {
    case "OPEN":
      return "bg-red-50 text-red-600 border-red-100";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-600 border-blue-100";
    case "RESOLVED":
      return "bg-green-50 text-green-600 border-green-100";
    case "CLOSED":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const getPriorityClass = (priority?: BugPriority) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-50 text-red-600";
    case "MEDIUM":
      return "bg-orange-50 text-orange-600";
    case "LOW":
      return "bg-green-50 text-green-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

const formatDate = (date?: string) => {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleString();
  } catch {
    return "-";
  }
};

/* =========================================================
   PAGE
========================================================= */

export default function AdminBugReportsPage() {
  const [reports, setReports] = useState<BugReport[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"ALL" | BugStatus>("ALL");

  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  /* =======================================================
     FETCH REPORTS
  ======================================================= */

  const fetchReports = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/admin/bug-reports");

      const data =
        response.data?.data?.reports ||
        response.data?.reports ||
        response.data?.data ||
        response.data;

      if (!Array.isArray(data)) {
        throw new Error("Invalid bug reports response.");
      }

      setReports(data);
    } catch (err: any) {
      console.error("Failed to fetch bug reports:", err);

      const status = err?.response?.status;

      if (status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else if (status === 403) {
        setError("You do not have permission to access bug reports.");
      } else if (status === 404) {
        setError("Bug reports route was not found.");
      } else if (status >= 500) {
        setError("Server error. Please try again later.");
      } else if (!err?.response) {
        setError(
          "Unable to connect to the server. Please check your internet connection.",
        );
      } else {
        setError(err?.response?.data?.message || "Unable to load bug reports.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "ALL" || report.status === statusFilter;

      if (!query) return matchesStatus;

      const searchableText = [
        report.title,
        report.description,
        report.category,
        report.status,
        report.priority,
        report.user?.name,
        report.user?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(query);
    });
  }, [reports, search, statusFilter]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(
    () => ({
      total: reports.length,
      open: reports.filter((r) => r.status === "OPEN").length,
      progress: reports.filter((r) => r.status === "IN_PROGRESS").length,
      resolved: reports.filter((r) => r.status === "RESOLVED").length,
    }),
    [reports],
  );

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = async (status: BugStatus) => {
    if (!selectedReport) return;

    const reportId = getReportId(selectedReport);

    if (!reportId) {
      setError("Bug report ID was not found.");
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/admin/bug-reports/${reportId}/status`,
        { status },
      );

      const updated =
        response.data?.data?.report ||
        response.data?.report ||
        response.data?.data;

      const updatedReport: BugReport =
        updated && typeof updated === "object"
          ? updated
          : {
              ...selectedReport,
              status,
            };

      setReports((previous) =>
        previous.map((report) =>
          getReportId(report) === reportId ? updatedReport : report,
        ),
      );

      setSelectedReport(updatedReport);

      setSuccess(`Bug report marked as ${getStatusLabel(status)}.`);
    } catch (err: any) {
      console.error("Failed to update bug status:", err);

      setError(
        err?.response?.data?.message || "Unable to update bug report status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =======================================================
     SEND REPLY
  ======================================================= */

  const handleReply = async () => {
    if (!selectedReport) return;

    const reportId = getReportId(selectedReport);

    if (!reportId) {
      setError("Bug report ID was not found.");
      return;
    }

    const message = reply.trim();

    if (!message) {
      setError("Please write a reply first.");
      return;
    }

    if (message.length < 2) {
      setError("Reply is too short.");
      return;
    }

    if (message.length > 3000) {
      setError("Reply cannot exceed 3000 characters.");
      return;
    }

    try {
      setSendingReply(true);
      setError("");
      setSuccess("");

      /*
       * IMPORTANT:
       * Backend route:
       * POST /admin/bug-reports/:id/replies
       */
      const response = await api.post(
        `/admin/bug-reports/${reportId}/replies`,
        {
          message,
        },
      );

      const updated =
        response.data?.data?.report ||
        response.data?.report ||
        response.data?.data;

      if (updated && typeof updated === "object" && !Array.isArray(updated)) {
        setReports((previous) =>
          previous.map((report) =>
            getReportId(report) === reportId ? updated : report,
          ),
        );

        setSelectedReport(updated);
      } else {
        /*
         * Backend may only return success/message.
         * In that case refresh the reports so the new reply appears.
         */
        await fetchReports(true);

        setReports((currentReports) => {
          const refreshed = currentReports.find(
            (report) => getReportId(report) === reportId,
          );

          if (refreshed) {
            setSelectedReport(refreshed);
          }

          return currentReports;
        });
      }

      setReply("");

      /* SUCCESS MESSAGE */
      setSuccess("Reply sent successfully.");

      /* Automatically hide success message */
      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      console.error("Failed to send bug reply:", err);

      const status = err?.response?.status;

      if (status === 401) {
        setError("Your admin session has expired.");
      } else if (status === 403) {
        setError("You do not have permission to reply.");
      } else if (status === 404) {
        setError("Bug report was not found.");
      } else {
        setError(err?.response?.data?.message || "Unable to send reply.");
      }
    } finally {
      setSendingReply(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-gray-100" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={`loading-stat-${item}`}
                className="h-28 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <Bug className="h-5 w-5 text-red-500" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-950">
                Bug Reports
              </h1>

              <p className="mt-0.5 text-sm text-gray-500">
                Manage, review and respond to customer bug reports.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchReports(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

            <p className="flex-1 text-sm font-medium text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* STATS */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Reports"
            value={stats.total}
            icon={Bug}
            className="bg-purple-50 text-purple-600"
          />

          <StatCard
            label="Open"
            value={stats.open}
            icon={AlertCircle}
            className="bg-red-50 text-red-600"
          />

          <StatCard
            label="In Progress"
            value={stats.progress}
            icon={Clock}
            className="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="Resolved"
            value={stats.resolved}
            icon={Check}
            className="bg-green-50 text-green-600"
          />
        </div>

        {/* FILTERS */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports, users, titles..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "ALL" | BugStatus)
              }
              className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 lg:w-48"
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </section>

        {/* REPORT LIST */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {filteredReports.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Bug className="h-6 w-6 text-gray-400" />
              </div>

              <h2 className="mt-4 text-base font-black text-gray-900">
                No bug reports found
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredReports.map((report, index) => {
                const reportId = getReportId(report);

                const reportKey =
                  reportId || `bug-report-${report.createdAt}-${index}`;

                return (
                  <motion.button
                    key={reportKey}
                    type="button"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.02, 0.2),
                    }}
                    onClick={() => {
                      setSelectedReport(report);
                      setReply("");
                      setError("");
                      setSuccess("");
                    }}
                    className="group flex w-full items-center gap-4 p-5 text-left transition hover:bg-gray-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <Bug className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-black text-gray-900 group-hover:text-[#f85606]">
                          {report.title}
                        </h3>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${getStatusClass(
                            report.status,
                          )}`}
                        >
                          {getStatusLabel(report.status)}
                        </span>

                        {report.priority && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${getPriorityClass(
                              report.priority,
                            )}`}
                          >
                            {report.priority}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                        {report.description}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400">
                        <span>{report.user?.name || "Unknown user"}</span>

                        <span>{report.category}</span>

                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#f85606]" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          MODAL
      ====================================================== */}

      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReport(null)}
            className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 px-4 py-6 backdrop-blur-sm sm:py-10"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              onClick={(event) => event.stopPropagation()}
              className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            >
              {/* MODAL HEADER */}

              <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <Bug className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg font-black text-gray-900">
                      {selectedReport.title}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Submitted {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL BODY */}

              <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
                {/* USER */}

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-orange-600">
                      {selectedReport.user?.avatar ? (
                        <img
                          src={selectedReport.user.avatar}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedReport.user?.name || "Unknown user"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {selectedReport.user?.email || "No email available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* META */}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Category
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-800">
                      {selectedReport.category}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Priority
                    </p>

                    <p className="mt-1">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-black ${getPriorityClass(
                          selectedReport.priority,
                        )}`}
                      >
                        {selectedReport.priority || "MEDIUM"}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Status
                    </p>

                    <p className="mt-1">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${getStatusClass(
                          selectedReport.status,
                        )}`}
                      >
                        {getStatusLabel(selectedReport.status)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div className="mt-5">
                  <h3 className="text-sm font-black text-gray-900">
                    Bug description
                  </h3>

                  <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {selectedReport.description}
                    </p>
                  </div>
                </div>

                {/* PAGE URL */}

                {selectedReport.pageUrl && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-gray-500">Page URL</p>

                    <p className="mt-1 break-all text-xs text-gray-700">
                      {selectedReport.pageUrl}
                    </p>
                  </div>
                )}

                {/* STATUS */}

                <div className="mt-6">
                  <h3 className="text-sm font-black text-gray-900">
                    Update status
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(
                      [
                        "OPEN",
                        "IN_PROGRESS",
                        "RESOLVED",
                        "CLOSED",
                      ] as BugStatus[]
                    ).map((status) => (
                      <button
                        key={`status-${status}`}
                        type="button"
                        disabled={
                          updatingStatus || selectedReport.status === status
                        }
                        onClick={() => updateStatus(status)}
                        className={`rounded-lg border px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          selectedReport.status === status
                            ? getStatusClass(status)
                            : "border-gray-200 bg-white text-gray-600 hover:border-[#f85606] hover:text-[#f85606]"
                        }`}
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CONVERSATION */}

                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />

                    <h3 className="text-sm font-black text-gray-900">
                      Conversation
                    </h3>
                  </div>

                  <div className="mt-3 space-y-3">
                    {!selectedReport.replies ||
                    selectedReport.replies.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center">
                        <p className="text-xs text-gray-400">No replies yet.</p>
                      </div>
                    ) : (
                      selectedReport.replies.map((item, index) => {
                        const replyKey =
                          item._id ||
                          item.id ||
                          `reply-${item.createdAt}-${index}`;

                        return (
                          <div
                            key={replyKey}
                            className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-black text-blue-700">
                                {item.admin?.name || "Admin"}
                              </p>

                              <p className="text-[10px] text-gray-400">
                                {formatDate(item.createdAt)}
                              </p>
                            </div>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                              {item.message}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* SUCCESS MESSAGE */}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />

                    <p className="text-sm font-semibold text-green-700">
                      {success}
                    </p>
                  </motion.div>
                )}

                {/* REPLY */}

                <div className="mt-6 border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-black text-gray-900">
                    Reply to user
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    Your reply will be visible to the user from their account.
                  </p>

                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    disabled={sendingReply}
                    rows={5}
                    maxLength={3000}
                    placeholder="Write your response..."
                    className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {reply.length}/3000
                    </span>

                    <button
                      type="button"
                      disabled={sendingReply || !reply.trim()}
                      onClick={handleReply}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-4 text-sm font-bold text-white transition hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sendingReply ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: typeof Bug;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400">{label}</p>

          <p className="mt-2 text-2xl font-black text-gray-950">{value}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
