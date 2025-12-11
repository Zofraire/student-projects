"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

interface Tag { id: string; name: string; slug: string; color: string | null; }

export default function AdminTagsPage() {
  const { data: session, status } = useSession();
  const t = useTranslations("adminTags");
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", color: "#3b82f6" });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") fetchData();
  }, [session, status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tags");
      if (res.ok) setTags(await res.json());
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setForm({ name: tag.name, slug: tag.slug, color: tag.color || "#3b82f6" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = "/api/admin/tags";
      const method = editingTag ? "PUT" : "POST";
      const body = editingTag ? { ...form, id: editingTag.id } : form;
      
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setShowModal(false); setEditingTag(null); resetForm(); fetchData(); }
      else { const error = await res.json(); alert(error.message || "Failed"); }
    } catch (error) { console.error("Error:", error); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) { console.error("Error:", error); }
  };

  const resetForm = () => setForm({ name: "", slug: "", color: "#3b82f6" });
  const generateSlug = (name: string) => name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");

  const filteredTags = tags.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (status === "loading" || loading) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingTag(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />{t("addTag")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tags ({filteredTags.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                  <TableCell>
                    <Badge style={tag.color ? { backgroundColor: tag.color, borderColor: tag.color } : {}}>
                      {tag.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? t("editTag") : t("addTag")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("tagName")}</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || generateSlug(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t("tagSlug")}</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">{t("tagColor")}</Label>
              <div className="flex gap-2">
                <Input id="color" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-16 h-10 p-1" />
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#3b82f6" />
              </div>
            </div>
            <div className="pt-2">
              <Label>Preview</Label>
              <div className="mt-2">
                <Badge style={{ backgroundColor: form.color, borderColor: form.color }}>{form.name || "Tag Name"}</Badge>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
