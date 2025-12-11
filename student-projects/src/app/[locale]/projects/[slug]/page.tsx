import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/src/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { formatDate } from "@/src/lib/utils";
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  FileImage,
  FileText,
  Video,
  Box,
  Tag,
  FolderTree,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic imports for media viewers (client-side only)
const PDFViewer = dynamic(() => import("@/src/components/viewers/PDFViewer"), {
  ssr: false,
  loading: () => <div className="h-[600px] animate-pulse bg-muted rounded-lg" />,
});

const ImageGallery = dynamic(() => import("@/src/components/viewers/ImageGallery"), {
  ssr: false,
});

const ModelViewer = dynamic(() => import("@/src/components/viewers/ModelViewer"), {
  ssr: false,
  loading: () => <div className="h-[500px] animate-pulse bg-muted rounded-lg" />,
});

const VideoPlayer = dynamic(() => import("@/src/components/viewers/VideoPlayer"), {
  ssr: false,
  loading: () => <div className="aspect-video animate-pulse bg-muted rounded-lg" />,
});

async function getProject(slug: string) {
  const project = await prisma.project.findUnique({
    where: { slug, active: true },
    include: {
      author: { select: { name: true, email: true, image: true } },
      categories: { include: { parent: true } },
      tags: true,
      media: { orderBy: { order: "asc" } },
    },
  });

  if (!project) {
    notFound();
  }

  return project;
}

async function getRelatedProjects(projectId: string, categoryIds: string[]) {
  if (categoryIds.length === 0) return [];

  return prisma.project.findMany({
    where: {
      active: true,
      id: { not: projectId },
      categories: { some: { id: { in: categoryIds } } },
    },
    include: {
      categories: true,
      tags: true,
      media: { select: { type: true } },
    },
    take: 3,
  });
}

export default async function ProjectPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations({ locale, namespace: "project" });
  const project = await getProject(slug);

  const categoryIds = project.categories.map((c) => c.id);
  const relatedProjects = await getRelatedProjects(project.id, categoryIds);

  // Group media by type
  const images = project.media.filter((m) => m.type === "IMAGE");
  const pdfs = project.media.filter((m) => m.type === "PDF");
  const models = project.media.filter((m) => m.type === "MODEL_3D");
  const videos = project.media.filter((m) => m.type === "VIDEO");

  const hasMedia = images.length > 0 || pdfs.length > 0 || models.length > 0 || videos.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link href={`/${locale}/projects`} className="mb-6 inline-block">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            {/* Categories */}
            {project.categories.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {project.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/${locale}/projects?category=${category.id}`}
                  >
                    <Badge variant="secondary" className="gap-1">
                      <FolderTree className="h-3 w-3" />
                      {category.parent && `${category.parent.name} / `}
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold lg:text-4xl">{project.title}</h1>

            {/* Meta info */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {(project.authorName || project.author?.name) && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{project.authorName || project.author?.name}</span>
                </div>
              )}
              {project.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{t("publishedOn")} {formatDate(project.publishedAt)}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Link key={tag.id} href={`/${locale}/projects?tags=${tag.id}`}>
                    <Badge
                      variant="outline"
                      className="gap-1"
                      style={tag.color ? { borderColor: tag.color, color: tag.color } : {}}
                    >
                      <Tag className="h-3 w-3" />
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail */}
          {project.thumbnail && (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>{t("description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">
                {project.description.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Media Section */}
          {hasMedia && (
            <Card>
              <CardHeader>
                <CardTitle>{t("media")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={
                  videos.length > 0 ? "videos" :
                  models.length > 0 ? "models" :
                  pdfs.length > 0 ? "documents" :
                  "gallery"
                }>
                  <TabsList className="mb-6">
                    {images.length > 0 && (
                      <TabsTrigger value="gallery" className="gap-2">
                        <FileImage className="h-4 w-4" />
                        {t("gallery")} ({images.length})
                      </TabsTrigger>
                    )}
                    {pdfs.length > 0 && (
                      <TabsTrigger value="documents" className="gap-2">
                        <FileText className="h-4 w-4" />
                        {t("documents")} ({pdfs.length})
                      </TabsTrigger>
                    )}
                    {models.length > 0 && (
                      <TabsTrigger value="models" className="gap-2">
                        <Box className="h-4 w-4" />
                        {t("models")} ({models.length})
                      </TabsTrigger>
                    )}
                    {videos.length > 0 && (
                      <TabsTrigger value="videos" className="gap-2">
                        <Video className="h-4 w-4" />
                        {t("videos")} ({videos.length})
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {images.length > 0 && (
                    <TabsContent value="gallery">
                      <ImageGallery
                        images={images.map((m) => ({
                          id: m.id,
                          url: m.url,
                          title: m.title,
                        }))}
                      />
                    </TabsContent>
                  )}

                  {pdfs.length > 0 && (
                    <TabsContent value="documents" className="space-y-6">
                      {pdfs.map((pdf) => (
                        <PDFViewer
                          key={pdf.id}
                          url={pdf.url}
                          title={pdf.title || pdf.filename}
                        />
                      ))}
                    </TabsContent>
                  )}

                  {models.length > 0 && (
                    <TabsContent value="models" className="space-y-6">
                      {models.map((model) => (
                        <ModelViewer
                          key={model.id}
                          url={model.url}
                          title={model.title || model.filename}
                        />
                      ))}
                    </TabsContent>
                  )}

                  {videos.length > 0 && (
                    <TabsContent value="videos" className="space-y-6">
                      {videos.map((video) => (
                        <VideoPlayer
                          key={video.id}
                          url={video.url}
                          title={video.title || "Video"}
                          platform={video.videoPlatform || undefined}
                        />
                      ))}
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Card */}
          {(project.authorName || project.author) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("author")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {project.author?.image ? (
                    <Image
                      src={project.author.image}
                      alt={project.author.name || ""}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {project.authorName || project.author?.name}
                    </p>
                    {(project.authorEmail || project.author?.email) && (
                      <a
                        href={`mailto:${project.authorEmail || project.author?.email}`}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                      >
                        <Mail className="h-3 w-3" />
                        {project.authorEmail || project.author?.email}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories Card */}
          {project.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("categories")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/${locale}/projects?category=${category.id}`}
                      className="flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-muted"
                    >
                      <FolderTree className="h-4 w-4 text-muted-foreground" />
                      {category.parent && (
                        <span className="text-muted-foreground">
                          {category.parent.name} /
                        </span>
                      )}
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags Card */}
          {project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("tags")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Link key={tag.id} href={`/${locale}/projects?tags=${tag.id}`}>
                      <Badge
                        variant="outline"
                        style={tag.color ? { borderColor: tag.color, color: tag.color } : {}}
                      >
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("relatedProjects")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatedProjects.map((related) => (
                    <Link
                      key={related.id}
                      href={`/${locale}/projects/${related.slug}`}
                      className="group flex gap-3"
                    >
                      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        {related.thumbnail ? (
                          <Image
                            src={related.thumbnail}
                            alt={related.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Box className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-primary">
                          {related.title}
                        </h4>
                        {related.authorName && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {related.authorName}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
