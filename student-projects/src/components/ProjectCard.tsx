"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ArrowRight, Calendar, User, FileImage, FileText, Video, Box } from "lucide-react";
import { formatDate, truncate } from "@/src/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    thumbnail: string | null;
    authorName: string | null;
    createdAt: Date | string;
    categories: { id: string; name: string; slug: string }[];
    tags: { id: string; name: string; slug: string; color: string | null }[];
    media: { type: string }[];
  };
  locale: string;
}

export default function ProjectCard({ project, locale }: ProjectCardProps) {
  const hasImages = project.media.some((m) => m.type === "IMAGE");
  const hasPdf = project.media.some((m) => m.type === "PDF");
  const hasVideo = project.media.some((m) => m.type === "VIDEO");
  const has3D = project.media.some((m) => m.type === "MODEL_3D");

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/${locale}/projects/${project.slug}`}>
          <div className="relative aspect-video overflow-hidden bg-muted">
            {project.thumbnail ? (
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <Box className="h-12 w-12 text-primary/30" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 flex gap-1">
              {hasImages && (
                <div className="rounded-md bg-black/60 p-1.5 backdrop-blur-sm">
                  <FileImage className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              {hasPdf && (
                <div className="rounded-md bg-black/60 p-1.5 backdrop-blur-sm">
                  <FileText className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              {hasVideo && (
                <div className="rounded-md bg-black/60 p-1.5 backdrop-blur-sm">
                  <Video className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              {has3D && (
                <div className="rounded-md bg-black/60 p-1.5 backdrop-blur-sm">
                  <Box className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </div>
          </div>
        </Link>
      </CardHeader>

      <CardContent className="p-4">
        {project.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {project.categories.slice(0, 2).map((category) => (
              <Badge key={category.id} variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            ))}
          </div>
        )}

        <Link href={`/${locale}/projects/${project.slug}`}>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight transition-colors hover:text-primary">
            {project.title}
          </h3>
        </Link>

        {project.summary && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {truncate(project.summary, 100)}
          </p>
        )}

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={tag.color ? { borderColor: tag.color, color: tag.color } : {}}
              >
                {tag.name}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t p-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {project.authorName && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{project.authorName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(project.createdAt)}</span>
          </div>
        </div>
        <Link href={`/${locale}/projects/${project.slug}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            View
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
