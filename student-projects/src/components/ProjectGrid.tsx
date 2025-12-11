"use client";

import ProjectCard from "./ProjectCard";
import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";

interface Project {
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
}

interface ProjectGridProps {
  projects: Project[];
  locale: string;
}

export default function ProjectGrid({ projects, locale }: ProjectGridProps) {
  const t = useTranslations("projects");

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Layers className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{t("noProjects")}</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="animate-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <ProjectCard project={project} locale={locale} />
        </div>
      ))}
    </div>
  );
}
