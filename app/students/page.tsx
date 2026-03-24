"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Eye, Users } from "lucide-react";
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
import { studentApi } from "@/lib/api";
import type { Student } from "@/types";
import { StudentForm } from "@/components/students/student-form";

function StudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [viewTarget, setViewTarget] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentApi.getAll();
      setStudents(data);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditTarget(undefined);
      setFormOpen(true);
    }
  }, [searchParams]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nic.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search)
  );

  const openNew = () => { setEditTarget(undefined); setFormOpen(true); };
  const openEdit = (student: Student) => { setEditTarget(student); setFormOpen(true); };
  const handleFormClose = () => { setFormOpen(false); router.replace("/students"); };

  const handleFormSubmit = async (
    values: { nic: string; name: string; address: string; mobile: string; email?: string },
    picture?: File
  ) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await studentApi.update(editTarget.nic, { ...values, picture });
        toast.success("Student updated successfully");
      } else {
        await studentApi.create({ ...values, picture });
        toast.success("Student created successfully");
      }
      handleFormClose();
      fetchStudents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await studentApi.delete(deleteTarget.nic);
      toast.success("Student deleted");
      setDeleteOpen(false);
      fetchStudents();
    } catch {
      toast.error("Failed to delete student");
    }
  };

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <div
        className="space-y-5"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Students</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {loading ? "Loading…" : `${filtered.length} student${filtered.length !== 1 ? "s" : ""} enrolled`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                className="pl-9 h-10 rounded-xl border-zinc-200 bg-white text-sm focus-visible:ring-violet-400 focus-visible:border-violet-400"
                placeholder="Name, NIC or mobile…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={openNew}
              className="h-10 px-4 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
            >
              <Plus className="h-4 w-4" />
              Add Student
            </button>
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
                <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400">Student</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400">NIC</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400">Mobile</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-400 text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-zinc-50">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full rounded-lg" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-zinc-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-zinc-300" />
                      </div>
                      <p className="text-sm font-medium">
                        {search ? "No matching students" : "No students yet. Add one!"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student) => (
                  <TableRow key={student.nic} className="border-zinc-50 hover:bg-zinc-50/60 transition-colors">
                    {/* Avatar */}
                    <TableCell className="pl-5">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={studentApi.getPictureUrl(student.nic)} alt={student.name} />
                        <AvatarFallback
                          className="text-xs font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                        >
                          {initials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    {/* Name */}
                    <TableCell>
                      <p className="font-semibold text-zinc-900 text-sm">{student.name}</p>
                      <p className="text-xs text-zinc-400 truncate max-w-[160px] mt-0.5">{student.address}</p>
                    </TableCell>
                    {/* NIC */}
                    <TableCell>
                      <span
                        className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg"
                        style={{ background: "#f5f3ff", color: "#7c3aed" }}
                      >
                        {student.nic}
                      </span>
                    </TableCell>
                    {/* Mobile */}
                    <TableCell className="text-sm text-zinc-600">{student.mobile}</TableCell>
                    {/* Email */}
                    <TableCell className="text-sm text-zinc-500">{student.email ?? "—"}</TableCell>
                    {/* Actions */}
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          onClick={() => setViewTarget(student)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                          onClick={() => openEdit(student)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => { setDeleteTarget(student); setDeleteOpen(true); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && handleFormClose()}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900">
              {editTarget ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <StudentForm
            student={editTarget}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">Student Details</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 pt-1">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-md">
                  <AvatarImage src={studentApi.getPictureUrl(viewTarget.nic)} alt={viewTarget.name} />
                  <AvatarFallback
                    className="text-2xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                  >
                    {initials(viewTarget.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-base font-bold text-zinc-900">{viewTarget.name}</h3>
                  <span
                    className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg inline-block mt-1"
                    style={{ background: "#f5f3ff", color: "#7c3aed" }}
                  >
                    {viewTarget.nic}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Mobile", value: viewTarget.mobile },
                  { label: "Email", value: viewTarget.email ?? "—" },
                  { label: "Address", value: viewTarget.address }
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
              <div className="flex gap-2 pt-1">
                <button
                  className="flex-1 h-9 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 flex items-center justify-center gap-1.5 hover:bg-zinc-50 transition-colors"
                  onClick={() => { setViewTarget(null); openEdit(viewTarget); }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  className="flex-1 h-9 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                  style={{ background: "#ef4444" }}
                  onClick={() => { setDeleteTarget(viewTarget); setDeleteOpen(true); setViewTarget(null); }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={(open) => !open && setDeleteOpen(false)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-zinc-900">Delete Student</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Are you sure you want to delete{" "}
              <strong className="text-zinc-800">{deleteTarget?.name}</strong> ({deleteTarget?.nic})?
              This action cannot be undone.
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
    </>
  );
}

export default function StudentsPage() {
  return <Suspense><StudentsContent /></Suspense>;
}
