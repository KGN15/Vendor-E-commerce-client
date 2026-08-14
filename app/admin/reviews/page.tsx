"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  MessageSquare,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { api } from "@/lib/axios";

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  isApproved?: boolean;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  product?: {
    _id: string;
    name: string;
    thumbnail?: string;
  };
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/admin/reviews");

      const data = response.data?.data;

      setReviews(Array.isArray(data) ? data : data?.reviews || []);
    } catch (err: any) {
      console.error("Failed to fetch reviews:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load reviews. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reviews;

    return reviews.filter((review) => {
      return (
        review.product?.name?.toLowerCase().includes(query) ||
        review.user?.name?.toLowerCase().includes(query) ||
        review.user?.email?.toLowerCase().includes(query) ||
        review.comment?.toLowerCase().includes(query)
      );
    });
  }, [reviews, search]);

  const handleApprove = async (id: string) => {
    try {
      setActionId(id);
      setError(null);

      await api.patch(`/admin/reviews/${id}`, {
        isApproved: true,
      });

      setReviews((current) =>
        current.map((review) =>
          review._id === id
            ? {
                ...review,
                isApproved: true,
              }
            : review,
        ),
      );
    } catch (err: any) {
      console.error("Failed to approve review:", err);

      setError(
        err?.response?.data?.message || "Failed to approve this review.",
      );
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionId(id);
      setError(null);

      await api.patch(`/admin/reviews/${id}`, {
        isApproved: false,
      });

      setReviews((current) =>
        current.map((review) =>
          review._id === id
            ? {
                ...review,
                isApproved: false,
              }
            : review,
        ),
      );
    } catch (err: any) {
      console.error("Failed to reject review:", err);

      setError(err?.response?.data?.message || "Failed to reject this review.");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this review?",
    );

    if (!confirmed) return;

    try {
      setActionId(id);
      setError(null);

      await api.delete(`/admin/reviews/${id}`);

      setReviews((current) => current.filter((review) => review._id !== id));
    } catch (err: any) {
      console.error("Failed to delete review:", err);

      setError(err?.response?.data?.message || "Failed to delete this review.");
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(date));
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#f85606]" />

            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Reviews
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer reviews and ratings.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm">
          <span className="text-gray-500">Total Reviews</span>{" "}
          <span className="font-bold text-gray-900">{reviews.length}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-red-700">
              Something went wrong
            </p>

            <p className="mt-1 text-xs text-red-600">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 transition hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews, customers or products..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />

              <p className="text-sm text-gray-500">Loading reviews...</p>
            </div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
              <MessageSquare className="h-6 w-6 text-[#f85606]" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No reviews found
            </h2>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              {search
                ? "Try changing your search terms."
                : "Customer reviews will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((review) => {
              const busy = actionId === review._id;

              return (
                <div
                  key={review._id}
                  className="p-5 transition-colors hover:bg-gray-50/70"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    {/* Review */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Rating */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                index < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Status */}
                        {review.isApproved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                            <Check className="h-3 w-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-[11px] font-bold text-yellow-700">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Comment */}
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
                        {review.comment || "No comment provided."}
                      </p>

                      {/* Meta */}
                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                        <div>
                          <span className="font-semibold text-gray-800">
                            {review.user?.name || "Unknown Customer"}
                          </span>

                          {review.user?.email && (
                            <span className="ml-1">({review.user.email})</span>
                          )}
                        </div>

                        <div>
                          Product:{" "}
                          <span className="font-semibold text-gray-700">
                            {review.product?.name || "Unknown Product"}
                          </span>
                        </div>

                        <div>{formatDate(review.createdAt)}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      {!review.isApproved && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleApprove(review._id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-green-600 px-3 text-xs font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </button>
                      )}

                      {review.isApproved && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleReject(review._id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(review._id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
