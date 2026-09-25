"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setFetching(true);
        const data = await apiFetch<any>("/users/me").catch(() => null);
        if (!data) {
          console.log("No data found in the user");
        }
        const u = data?.user || user;

        if (u) {
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setLocation(
            u.location
              ? typeof u.location === "object"
                ? `${u.location.city || ""}, ${u.location.state || ""}`.replace(/^, |, $/g, "")
                : u.location
              : ""
          );
          setAvatar(u.avatar || "");
          setCreatedAt(u.createdAt || "");
        }
      } catch (err) {
        toastError("Unable to fetch user profile.");
      } finally {
        setFetching(false);
      }
    }

    loadProfile();
  }, [user, toastError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toastError("Name must be at least 2 characters.");
      return;
    }

    try {
      setLoading(true);
      await apiFetch("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          location: location.trim(),
          avatar: avatar.trim(),
        }),
      });

      await refreshUser();
      success("Profile updated successfully!");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-neutral-500 hover:text-black"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-black">
              Account Settings
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Manage your personal details and seller profile.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 border-b border-neutral-100 pb-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black text-xl font-bold text-white overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase() || "U"
              )}
            </div>

            <div>
              <p className="font-bold text-base text-black">{name || "Your Name"}</p>
              <p className="text-xs text-neutral-500">{email}</p>
              {createdAt && (
                <p className="text-[11px] text-neutral-400 mt-1">
                  Member since {formatDate(createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3.5 text-sm text-neutral-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Email address cannot be changed directly.
              </span>
            </div>

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="Location"
              placeholder="e.g. Bangalore, Karnataka"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Input
              label="Avatar Image URL"
              placeholder="https://..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              hint="Direct link to your profile photo"
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" loading={loading} className="px-7">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
