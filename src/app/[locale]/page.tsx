import { getTranslations } from "next-intl/server";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import ProjectCard from "@/src/components/ProjectCard";
import { ArrowRight, Layers, FolderTree, Sparkles } from "lucide-react";

async function getFeaturedProjects() {
  return prisma.project.findMany({
    where: { active: true, featured: true },
    include: {
      categories: true,
      tags: true,
      media: { select: { type: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

async function getRecentProjects() {
  return prisma.project.findMany({
    where: { active: true },
    include: {
      categories: true,
      tags: true,
      media: { select: { type: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { active: true, parentId: null },
    include: {
      children: { where: { active: true } },
      _count: { select: { projects: true } },
    },
    orderBy: { order: "asc" },
    take: 8,
  });
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "home" });
  
  const [featuredProjects, recentProjects, categories] = await Promise.all([
    getFeaturedProjects(),
    getRecentProjects(),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              Student Showcase
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              {t("subtitle")}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href={`/${locale}/projects`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {t("viewAll")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/${locale}/projects?featured=true`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {t("featured")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">{t("featured")}</h2>
                <p className="mt-1 text-muted-foreground">
                  Highlighted student projects
                </p>
              </div>
              <Link href={`/${locale}/projects?featured=true`}>
                <Button variant="ghost">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project as any}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-muted/50 py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold">{t("categories")}</h2>
              <p className="mt-1 text-muted-foreground">
                {t("exploreCategories")}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${locale}/projects?category=${category.id}`}
                >
                  <Card className="group transition-all hover:shadow-md hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <FolderTree className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {category._count.projects} projects
                      </p>
                      {category.children.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {category.children.slice(0, 3).map((child) => (
                            <Badge key={child.id} variant="secondary" className="text-xs">
                              {child.name}
                            </Badge>
                          ))}
                          {category.children.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{category.children.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">{t("recentProjects")}</h2>
                <p className="mt-1 text-muted-foreground">
                  Latest student work
                </p>
              </div>
              <Link href={`/${locale}/projects`}>
                <Button variant="ghost">
                  {t("viewAll")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project as any}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
