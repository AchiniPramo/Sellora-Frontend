"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save, Loader2, Camera, User as UserIcon, Shield, Phone, Mail, MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSession, updateSessionUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { userApi } from "@/lib/api";

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  admin:   { bg: "#f5f3ff", color: "#7c3aed" },
  manager: { bg: "#eef2ff", color: "#4f46e5" },
  cashier: { bg: "#f0fdf4", color: "#16a34a" },
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [form, setForm] = useState({ name: "", mobile: "", email: "", address: "" });
  const [picture, setPicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace("/login"); return; }
    setUser(session);
    setForm({ name: session.name, mobile: session.mobile, email: session.email ?? "", address: session.address ?? "" });
  }, [router]);

  const handlePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicture(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.name || !form.mobile) { toast.error("Name and mobile are required"); return; }
    setSaving(true);
    try {
      if (user.id.startsWith("usr_")) {
        updateSessionUser({ ...form, email: form.email || undefined });
      } else {
        await userApi.update(user.id, {
          id: user.id, name: form.name, mobile: form.mobile,
          email: form.email || undefined, address: form.address, picture: picture ?? undefined,
        });
        updateSessionUser({ ...form, email: form.email || undefined });
      }
      setUser((prev) => prev ? { ...prev, ...form } : prev);
      toast.success("Profile updated successfully!");
      setEditing(false);
      setPicture(null);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const avatarSrc = preview ?? (user.id.startsWith("usr_") ? undefined : userApi.getPictureUrl(user.id));
  const roleStyle = ROLE_STYLE[user.role] ?? { bg: "#f4f4f5", color: "#71717a" };

  return (
    <div
      className="max-w-2xl mx-auto space-y-5"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Profile hero card */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f4f4f5" }}
      >
        {/* Banner */}
        <div
          className="h-24 w-full relative"
          style={{ background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #4f46e5 100%)" }}
        >
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        <div className="px-6 pb-6 -mt-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback
                  className="text-2xl font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                >
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <label
                  htmlFor="picture-upload"
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors hover:opacity-90"
                  style={{ background: "#7c3aed" }}
                  title="Change photo"
                >
                  <Camera className="h-3.5 w-3.5 text-white" />
                  <input id="picture-upload" type="file" accept="image/*" className="hidden" onChange={handlePicture} />
                </label>
              )}
            </div>

            {/* Name + role */}
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{user.name}</h2>
              <p className="text-sm text-zinc-400 font-mono">@{user.username}</p>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-bold mt-1.5 inline-block"
                style={{ background: roleStyle.bg, color: roleStyle.color }}
              >
                {user.role}
              </span>
            </div>

            <button
              onClick={() => { setEditing((v) => !v); if (editing) { setPicture(null); setPreview(null); } }}
              className="h-9 px-5 rounded-xl text-sm font-semibold border transition-colors"
              style={editing
                ? { border: "1px solid #e4e4e7", background: "white", color: "#52525b" }
                : { background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", color: "white", border: "none" }
              }
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Details / Edit card */}
      <div
        className="bg-white rounded-2xl"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f4f4f5" }}
      >
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-zinc-50">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "#f5f3ff" }}>
            <UserIcon className="h-3.5 w-3.5" style={{ color: "#7c3aed" }} />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">{editing ? "Edit Details" : "Profile Details"}</h3>
        </div>

        <div className="p-6">
          {editing ? (
            /* Edit mode */
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: "name",    label: "Full Name", required: true, type: "text",  placeholder: "John Doe" },
                  { field: "mobile",  label: "Mobile",    required: true, type: "text",  placeholder: "07X XXX XXXX" },
                  { field: "email",   label: "Email",     required: false, type: "email", placeholder: "john@email.com" },
                  { field: "address", label: "Address",   required: false, type: "text",  placeholder: "123 Main St" },
                ].map(({ field, label, required, type, placeholder }) => (
                  <div key={field} className="space-y-1.5">
                    <Label className="text-zinc-700 text-sm font-semibold">
                      {label} {required && <span className="text-red-400">*</span>}
                    </Label>
                    <Input
                      type={type}
                      placeholder={placeholder}
                      value={form[field as keyof typeof form]}
                      onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                      className="h-10 rounded-xl border-zinc-200 text-sm focus-visible:ring-violet-400 focus-visible:border-violet-400"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-10 px-6 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          ) : (
            /* View mode */
            <div className="space-y-2.5">
              {[
                { icon: Phone,   label: "Mobile",  value: user.mobile },
                { icon: Mail,    label: "Email",   value: user.email ?? "Not provided" },
                { icon: MapPin,  label: "Address", value: user.address || "Not provided" },
                { icon: Shield,  label: "Role",    value: user.role },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-zinc-50"
                  style={{ border: "1px solid #f4f4f5" }}
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#f5f3ff" }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: "#7c3aed" }} />
                  </div>
                  <span className="text-zinc-400 text-sm w-20 shrink-0">{label}</span>
                  <span className="font-semibold text-zinc-800 text-sm capitalize">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}