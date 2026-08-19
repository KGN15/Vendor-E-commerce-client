// app/profile/edit/page.tsx
"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/axios";
import { useStore } from "@/lib/store";
import {
  ArrowLeft,
  User,
  Mail,
  Camera,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ImagePlus,
  Trash2,
} from "lucide-react";

interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string | null;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const getInitials = (name: string) => {
  if (!name?.trim()) return "U";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function EditProfilePage() {
  const router = useRouter();

  const setStoreUser = useStore((state) => state.setUser);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState<IUser | null>(null);
  const [name, setName] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [removeImage, setRemoveImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* =======================================================
     FETCH PROFILE
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/auth/me");

        const userData =
          response.data?.data?.user ||
          response.data?.user ||
          response.data?.data ||
          response.data;

        if (!userData) {
          throw new Error("User profile was not returned.");
        }

        const currentUser: IUser = {
          _id: userData._id,
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar ?? null,
        };

        if (!mounted) return;

        setUser(currentUser);
        setName(currentUser.name || "");

        setStoreUser(userData);
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);

        if (!mounted) return;

        const status = err?.response?.status;

        if (status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (status === 403) {
          setError("You do not have permission to access this profile.");
        } else if (!err?.response) {
          setError(
            "Unable to connect to the server. Please check your internet connection.",
          );
        } else {
          setError(
            err?.response?.data?.message || "Unable to load your profile.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [setStoreUser]);

  /* =======================================================
     PREVIEW CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* =======================================================
     SELECT IMAGE
  ======================================================= */

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);
    setSuccess(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Invalid image format. Please use JPG, PNG, WEBP, or GIF.");

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image is too large. Maximum allowed size is 5 MB.");

      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setPreviewUrl(newPreviewUrl);
    setRemoveImage(false);
  };

  /* =======================================================
     REMOVE IMAGE
  ======================================================= */

  const handleRemoveImage = () => {
    setError(null);
    setSuccess(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setSelectedImage(null);

    if (user?.avatar) {
      setRemoveImage(true);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     FILE PICKER
  ======================================================= */

  const openFilePicker = () => {
    if (saving) return;

    fileInputRef.current?.click();
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    setError(null);
    setSuccess(null);

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    if (trimmedName.length > 120) {
      setError("Name cannot be longer than 120 characters.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", trimmedName);

      /*
       * IMPORTANT:
       * Backend route uses upload.single("image")
       */
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      /*
       * Only send removeImage when
       * user is removing existing avatar.
       */
      if (removeImage && !selectedImage) {
        formData.append("removeImage", "true");
      }

      const response = await api.patch("/auth/me", formData);

      const updatedUser = response.data?.data?.user || response.data?.user;

      if (!updatedUser) {
        throw new Error("Updated user was not returned.");
      }

      const nextUser: IUser = {
        _id: updatedUser._id,
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar ?? null,
      };

      setUser(nextUser);
      setName(nextUser.name);

      setStoreUser(updatedUser);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedImage(null);
      setPreviewUrl(null);
      setRemoveImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 700);
    } catch (err: any) {
      console.error("Failed to update profile:", err);

      const status = err?.response?.status;

      if (status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else if (status === 400) {
        setError(
          err?.response?.data?.message ||
            "Please check the information you entered.",
        );
      } else if (status === 413) {
        setError("Image is too large. Maximum allowed size is 5 MB.");
      } else if (status >= 500) {
        setError("Server error. Please try again later.");
      } else if (!err?.response) {
        setError(
          "Unable to connect to the server. Please check your internet connection.",
        );
      } else {
        setError(
          err?.response?.data?.message || "Unable to update your profile.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 h-5 w-32 animate-pulse rounded bg-gray-200" />

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />

            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />

            <div className="mt-8 flex items-center gap-5">
              <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200" />

              <div className="space-y-3">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-20 animate-pulse rounded-xl bg-gray-100" />

              <div className="flex justify-end gap-3">
                <div className="h-11 w-24 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-11 w-32 animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     NO USER
  ======================================================= */

  if (!user) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f7f7f7] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>

          <h1 className="mt-5 text-xl font-black text-gray-900">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error || "We couldn't find your account information."}
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/profile"
              className="flex h-11 flex-1 items-center justify-center rounded-lg border border-gray-200 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </Link>

            <Link
              href="/login"
              className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#f85606] px-5 text-sm font-bold text-white transition hover:bg-[#df4d03]"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  /* =======================================================
     AVATAR
  ======================================================= */

  const initials = getInitials(name || user.name || "");

  const displayedAvatar = previewUrl || (!removeImage ? user.avatar : null);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* TOP */}

        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/profile"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#f85606]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to profile
          </Link>

          <span className="hidden text-xs font-bold uppercase tracking-wider text-gray-400 sm:block">
            Edit Profile
          </span>
        </div>

        {/* CARD */}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* HEADER */}

          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-950">
              Edit profile
            </h1>

            <p className="mt-1.5 text-sm text-gray-500">
              Update your name and profile photo.
            </p>
          </div>

          {/* AVATAR */}

          <div className="mt-8 flex flex-col items-center sm:flex-row">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-2xl font-black text-[#f85606] ring-1 ring-orange-100">
                {displayedAvatar ? (
                  <img
                    src={displayedAvatar}
                    alt={`${user.name}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              {/* CAMERA */}

              <button
                type="button"
                onClick={openFilePicker}
                disabled={saving}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#f85606] text-white shadow-sm transition hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Change profile photo"
              >
                <Camera className="h-4 w-4" />
              </button>

              {/* REMOVE */}

              {(displayedAvatar || selectedImage) && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={saving}
                  className="absolute -right-2 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-sm transition hover:bg-red-600 disabled:opacity-60"
                  aria-label="Remove profile photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="mt-4 text-center sm:ml-5 sm:mt-0 sm:text-left">
              <p className="text-sm font-bold text-gray-800">Profile photo</p>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                JPG, PNG, WEBP or GIF.
                <br />
                Maximum file size: 5 MB.
              </p>

              <div className="mt-3 flex justify-center gap-2 sm:justify-start">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606] disabled:opacity-50"
                >
                  <ImagePlus className="h-3.5 w-3.5" />

                  {displayedAvatar ? "Change photo" : "Upload photo"}
                </button>

                {displayedAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="space-y-5">
              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500"
                >
                  Full name
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError(null);
                      setSuccess(null);
                    }}
                    placeholder="Enter your full name"
                    maxLength={120}
                    autoComplete="name"
                    disabled={saving}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:ring-4 focus:ring-orange-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                <div className="mt-1.5 flex justify-end">
                  <span className="text-[10px] text-gray-400">
                    {name.length}/120
                  </span>
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                    className="h-12 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm font-medium text-gray-500 outline-none"
                  />
                </div>

                <p className="mt-2 text-[11px] text-gray-400">
                  Email address cannot be changed from this page.
                </p>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                <p className="text-xs font-semibold leading-5 text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-auto shrink-0 text-red-400 hover:text-red-600"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {/* SUCCESS */}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />

                <p className="text-xs font-semibold text-green-700">
                  {success}
                </p>
              </motion.div>
            )}

            {/* BUTTONS */}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/profile"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-6 text-sm font-bold text-white transition hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.section>
      </div>
    </main>
  );
}
