"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  Tag,
  Users,
  Settings,
  Home,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function AdminNavbar({ locale }: { locale: string }) {
  const t = useTranslations("admin");
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}/admin`, label: t("dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/admin/projects`, label: t("projects"), icon: Layers },
    { href: `/${locale}/admin/categories`, label: t("categories"), icon: FolderTree },
    { href: `/${locale}/admin/tags`, label: t("tags"), icon: Tag },
    { href: `/${locale}/admin/users`, label: t("users"), icon: Users },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              <span>Back to Site</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
