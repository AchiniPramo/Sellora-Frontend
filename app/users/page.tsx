"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, Eye, Trash2, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userApi } from "@/lib/api";
import type { User } from "@/types";
import { getRegisteredUsers, saveRegisteredUsers } from "@/lib/auth";

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  admin:   { bg: "#f5f3ff", color: "#7c3aed" },
  user:    { bg: "#eef2ff", color: "#4f46e5" },
  manager: { bg: "#eef2ff", color: "#4f46e5" },
  cashier: { bg: "#f0fdf4", color: "#16a34a" },
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewTarget, setViewTarget] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const apiUsers = await userApi.getAll();
      const localUsers = getRegisteredUsers();
      const enriched = apiUsers.map((u) => {
        const local = localUsers.find((l) => l.id === u.id);
        return local ? { ...u, username: local.username, role: local.role } : u;
      });
      const apiIds = new Set(apiUsers.map((u) => u.id));
      const localOnly = localUsers
        .filter((l) => !apiIds.has(l.id))
        .map((l) => ({
          id: l.id, username: l.username, name: l.name,
          mobile: l.mobile, email: l.email, address: l.address,
          role: l.role, createdAt: l.createdAt,
        }) as User);
      setUsers([...enriched, ...localOnly]);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search)
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await userApi.delete(deleteTarget.id); } catch {
      console.warn("API delete failed or user not in backend.");
    }
    try {
      const localUsers = getRegisteredUsers();
      saveRegisteredUsers(localUsers.filter((u) => u.id !== deleteTarget.id));
      toast.success("User deleted");
      setDeleteOpen(false);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user locally");
    }
  };

  return (
    <div
      className="space-y-5"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Users</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? "Loading…" : `${filtered.length} user${filtered.length !== 1 ? "s" : ""} registered`}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            className="pl-9 h-10 rounded-xl border-zinc-200 bg-white text-sm focus-visible:ring-violet-400 focus-visible:border-violet-400"
            placeholder="Name, username or mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table card */}
      <div
        className="bg-white rounded-2xl border border-zinc-100 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ background: "#faf9ff" }}>
              <TableHead className="w-12 pl-5" />
              <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400">Name</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400">Username</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400">Role</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400">Mobile</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400 text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-zinc-50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full rounded-lg" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-zinc-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-zinc-300" />
                    </div>
                    <p className="text-sm font-medium">
                      {search ? "No matching users" : "No users yet. Register one!"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => {
                const roleStyle = ROLE_STYLE[user.role ?? "cashier"] ?? { bg: "#f4f4f5", color: "#71717a" };
                return (
                  <TableRow key={user.id} className="border-zinc-50 hover:bg-zinc-50/60 transition-colors">
                    {/* Avatar */}
                    <TableCell className="pl-5">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={userApi.getPictureUrl(user.id)} alt={user.name} />
                        <AvatarFallback
                          className="text-xs font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                        >
                          {initials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    {/* Name */}
                    <TableCell>
                      <p className="font-semibold text-zinc-900 text-sm">{user.name}</p>
                      <p className="text-xs text-zinc-400 truncate max-w-[140px] mt-0.5">{user.address || "—"}</p>
                    </TableCell>
                    {/* Username */}
                    <TableCell>
                      <span className="text-sm font-mono text-zinc-500">@{user.username ?? "—"}</span>
                    </TableCell>
                    {/* Role */}
                    <TableCell>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: roleStyle.bg, color: roleStyle.color }}
                      >
                        {user.role ?? "cashier"}
                      </span>
                    </TableCell>
                    {/* Mobile */}
                    <TableCell className="text-sm text-zinc-600">{user.mobile}</TableCell>
                    {/* Email */}
                    <TableCell className="text-sm text-zinc-500">{user.email ?? "—"}</TableCell>
                    {/* Actions */}
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          onClick={() => setViewTarget(user)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => { setDeleteTarget(user); setDeleteOpen(true); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">User Details</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 pt-1">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-md">
                  <AvatarImage src={userApi.getPictureUrl(viewTarget.id)} />
                  <AvatarFallback
                    className="text-2xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                  >
                    {initials(viewTarget.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-base font-bold text-zinc-900">{viewTarget.name}</h3>
                  <p className="text-sm text-zinc-400 font-mono">@{viewTarget.username ?? "—"}</p>
                  {(() => {
                    const rs = ROLE_STYLE[viewTarget.role ?? "cashier"] ?? { bg: "#f4f4f5", color: "#71717a" };
                    return (
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full mt-1.5 inline-block"
                        style={{ background: rs.bg, color: rs.color }}
                      >
                        {viewTarget.role ?? "cashier"}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Mobile", value: viewTarget.mobile },
                  { label: "Email", value: viewTarget.email ?? "—" },
                  { label: "Address", value: viewTarget.address || "—" },
                  { label: "Member Since", value: viewTarget.createdAt ? new Date(viewTarget.createdAt).toLocaleDateString() : "—" }
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: "#faf9ff", border: "1px solid #f4f4f5" }}
                  >
                    <span className="text-zinc-400 font-medium">{label}</span>
                    <span className="font-semibold text-zinc-800 text-right max-w-[180px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={(o) => !o && setDeleteOpen(false)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-zinc-900">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Are you sure you want to delete{" "}
              <strong className="text-zinc-800">{deleteTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}