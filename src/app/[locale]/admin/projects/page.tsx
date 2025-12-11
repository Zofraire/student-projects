"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { 
  Plus, Search, Edit, Trash2, Star, FileImage, FileText, Video, Box, 
  Upload, X, File, Loader2, ExternalLink 
} from "lucide-react";

interface MediaItem {
  id?: string;
  type: string;
  url: string;
  filename: string;
  title?: string;
  modelFormat?: string;
  videoPlatform?: string;
  videoId?: string;
  isNew?: boolean;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string | null;
  thumbnail: string | null;
  authorName: string | null;
  authorEmail: string | null;
  active: boolean;
  featured: boolean;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  media: MediaItem[];
  createdAt: string;
}

interface Category { id: string; name: string; parentId: string | null; }
interface Tag { id: string; name: string; }

export default function AdminProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("adminProjects");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    summary: "",
    thumbnail: "",
    authorName: "",
    authorEmail: "",
    categoryIds: [] as string[],
    tagIds: [] as string[],
    featured: false,
    active: true,
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") fetchData();
  }, [session, status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch("/api/admin/projects"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/tags"),
      ]);
      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (tagsRes.ok) setTags(await tagsRes.json());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      slug: project.slug,
      description: project.description || "",
      summary: project.summary || "",
      thumbnail: project.thumbnail || "",
      authorName: project.authorName || "",
      authorEmail: project.authorEmail || "",
      categoryIds: project.categories.map((c) => c.id),
      tagIds: project.tags.map((t) => t.id),
      featured: project.featured,
      active: project.active,
    });
    setMediaItems(project.media || []);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setMediaItems((prev) => [
            ...prev,
            {
              type: data.type,
              url: data.url,
              filename: data.filename,
              title: "",
              modelFormat: data.modelFormat,
              isNew: true,
            },
          ]);
        } else {
          alert(`Failed to upload ${file.name}`);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddVideoUrl = () => {
    if (!videoUrl.trim()) return;

    let videoPlatform = "local";
    let videoId = "";

    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      videoPlatform = "youtube";
      const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      videoId = match ? match[1] : "";
    } else if (videoUrl.includes("vimeo.com")) {
      videoPlatform = "vimeo";
      const match = videoUrl.match(/vimeo\.com\/(\d+)/);
      videoId = match ? match[1] : "";
    }

    setMediaItems((prev) => [
      ...prev,
      {
        type: "VIDEO",
        url: videoUrl,
        filename: videoUrl,
        title: "",
        videoPlatform,
        videoId,
        isNew: true,
      },
    ]);
    setVideoUrl("");
  };

  const handleRemoveMedia = async (index: number) => {
    const item = mediaItems[index];
    
    if (item.id && !item.isNew) {
      try {
        await fetch(`/api/admin/media?id=${item.id}`, { method: "DELETE" });
      } catch (error) {
        console.error("Error deleting media:", error);
      }
    }
    
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMediaTitle = (index: number, title: string) => {
    setMediaItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, title } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingProject
        ? `/api/admin/projects?id=${editingProject.id}`
        : "/api/admin/projects";
      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const project = await res.json();
        
        const newMedia = mediaItems.filter((m) => m.isNew);
        if (newMedia.length > 0) {
          await fetch("/api/admin/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: project.id,
              media: newMedia.map((m) => ({
                type: m.type,
                url: m.url,
                filename: m.filename,
                title: m.title,
                modelFormat: m.modelFormat,
                videoPlatform: m.videoPlatform,
                videoId: m.videoId,
              })),
            }),
          });
        }

        setShowModal(false);
        setEditingProject(null);
        resetForm();
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to save project");
      }
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch("/api/admin/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) fetchData();
      else {
        const error = await res.json();
        alert(error.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      description: "",
      summary: "",
      thumbnail: "",
      authorName: "",
      authorEmail: "",
      categoryIds: [],
      tagIds: [],
      featured: false,
      active: true,
    });
    setMediaItems([]);
    setVideoUrl("");
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "IMAGE": return <FileImage className="h-4 w-4" />;
      case "PDF": return <FileText className="h-4 w-4" />;
      case "VIDEO": return <Video className="h-4 w-4" />;
      case "MODEL_3D": return <Box className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  if (status === "loading" || loading) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingProject(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />{t("addProject")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Projects ({filteredProjects.length})</CardTitle>
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
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {project.featured && <Star className="h-4 w-4 text-yellow-500" />}
                      <span className="font-medium">{project.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{project.authorName || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.categories.slice(0, 2).map((cat) => (
                        <Badge key={cat.id} variant="secondary" className="text-xs">{cat.name}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {project.media?.some((m) => m.type === "IMAGE") && <FileImage className="h-4 w-4 text-muted-foreground" />}
                      {project.media?.some((m) => m.type === "PDF") && <FileText className="h-4 w-4 text-muted-foreground" />}
                      {project.media?.some((m) => m.type === "VIDEO") && <Video className="h-4 w-4 text-muted-foreground" />}
                      {project.media?.some((m) => m.type === "MODEL_3D") && <Box className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-xs text-muted-foreground ml-1">({project.media?.length || 0})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.active ? "default" : "secondary"}>{project.active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Project Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? t("editProject") : t("addProject")}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="media">Media Files ({mediaItems.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("projectTitle")}</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || generateSlug(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">{t("projectSlug")}</Label>
                    <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">{t("projectSummary")}</Label>
                  <Textarea id="summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("projectDescription")}</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">{t("projectThumbnail")}</Label>
                  <Input id="thumbnail" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authorName">{t("projectAuthor")}</Label>
                    <Input id="authorName" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authorEmail">{t("projectAuthorEmail")}</Label>
                    <Input id="authorEmail" type="email" value={form.authorEmail} onChange={(e) => setForm({ ...form, authorEmail: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("projectCategories")}</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={form.categoryIds.includes(cat.id)}
                          onCheckedChange={(checked) => setForm({
                            ...form,
                            categoryIds: checked ? [...form.categoryIds, cat.id] : form.categoryIds.filter((id) => id !== cat.id),
                          })}
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("projectTags")}</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                    {tags.map((tag) => (
                      <label key={tag.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={form.tagIds.includes(tag.id)}
                          onCheckedChange={(checked) => setForm({
                            ...form,
                            tagIds: checked ? [...form.tagIds, tag.id] : form.tagIds.filter((id) => id !== tag.id),
                          })}
                        />
                        <span className="text-sm">{tag.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <Checkbox checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: !!checked })} />
                    <span className="text-sm">{t("projectFeatured")}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: !!checked })} />
                    <span className="text-sm">{t("projectActive")}</span>
                  </label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{t("cancel")}</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? t("saving") : t("save")}</Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              {/* File Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.fbx,.obj,.glb,.gltf,.stl,.mp4,.webm,.mov"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Images (JPG, PNG, GIF) • PDFs • 3D Models (FBX, OBJ, GLB, GLTF) • Videos (MP4, WebM)
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Video URL Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add video URL (YouTube, Vimeo, or direct link)"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddVideoUrl} disabled={!videoUrl.trim()}>
                      <Plus className="h-4 w-4 mr-1" /> Add Video
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Media List */}
              {mediaItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Media Files ({mediaItems.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mediaItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex items-center justify-center w-10 h-10 rounded bg-muted">
                            {getMediaIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{item.type}</Badge>
                              {item.isNew && <Badge className="text-xs bg-green-500">New</Badge>}
                            </div>
                            <p className="text-sm truncate mt-1">{item.filename}</p>
                            <Input
                              placeholder="Add title (optional)"
                              value={item.title || ""}
                              onChange={(e) => handleUpdateMediaTitle(index, e.target.value)}
                              className="mt-2 h-8 text-sm"
                            />
                          </div>
                          <div className="flex gap-1">
                            {item.url && (
                              <Button variant="ghost" size="icon" asChild>
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveMedia(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Project"}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
