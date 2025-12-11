import { getTranslations } from "next-intl/server";
import { prisma } from "@/src/lib/prisma";
import ProjectGrid from "@/src/components/ProjectGrid";
import ProjectFilters from "@/src/components/ProjectFilters";

async function getProjects(searchParams: any) {
  const where: any = { active: true };

  // Search filter
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
      { summary: { contains: searchParams.search, mode: "insensitive" } },
      { authorName: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  // Category filter
  if (searchParams.category) {
    const categoryIds = String(searchParams.category).split(",").filter(Boolean);
    if (categoryIds.length === 1) {
      where.categories = { some: { id: categoryIds[0] } };
    } else if (categoryIds.length > 1) {
      where.categories = { some: { id: { in: categoryIds } } };
    }
  }

  // Tags filter
  if (searchParams.tags) {
    const tagIds = String(searchParams.tags).split(",").filter(Boolean);
    if (tagIds.length > 0) {
      where.tags = { some: { id: { in: tagIds } } };
    }
  }

  // Featured filter
  if (searchParams.featured === "true") {
    where.featured = true;
  }

  // Sort order
  let orderBy: any = { createdAt: "desc" };
  if (searchParams.sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (searchParams.sort === "alphabetical") {
    orderBy = { title: "asc" };
  }

  return prisma.project.findMany({
    where,
    include: {
      categories: true,
      tags: true,
      media: { select: { type: true } },
    },
    orderBy,
  });
}

async function getFilterData() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ where: { active: true } }),
    prisma.tag.findMany(),
  ]);

  return { categories, tags };
}

export default async function ProjectsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: any;
}) {
  const t = await getTranslations({ locale, namespace: "projects" });
  
  const [projects, filterData] = await Promise.all([
    getProjects(searchParams),
    getFilterData(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-72 flex-shrink-0">
          <ProjectFilters
            categories={filterData.categories}
            tags={filterData.tags}
            locale={locale}
          />
        </aside>

        {/* Projects Grid */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? "project" : "projects"} found
          </div>
          <ProjectGrid projects={projects as any} locale={locale} />
        </div>
      </div>
    </div>
  );
}
