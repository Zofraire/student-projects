import { getTranslations } from "next-intl/server";
import { prisma } from "@/src/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Layers, FolderTree, Tag, Users } from "lucide-react";

async function getStats() {
  const [projectCount, categoryCount, tagCount, userCount] = await Promise.all([
    prisma.project.count({ where: { active: true } }),
    prisma.category.count({ where: { active: true } }),
    prisma.tag.count(),
    prisma.user.count(),
  ]);

  return { projectCount, categoryCount, tagCount, userCount };
}

export default async function AdminDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "admin" });
  const stats = await getStats();

  const statCards = [
    {
      title: t("projects"),
      value: stats.projectCount,
      icon: Layers,
      description: "Active projects",
      color: "bg-blue-500",
    },
    {
      title: t("categories"),
      value: stats.categoryCount,
      icon: FolderTree,
      description: "Active categories",
      color: "bg-green-500",
    },
    {
      title: t("tags"),
      value: stats.tagCount,
      icon: Tag,
      description: "Total tags",
      color: "bg-purple-500",
    },
    {
      title: t("users"),
      value: stats.userCount,
      icon: Users,
      description: "Registered users",
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground">{t("dashboardDesc")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-md p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
