"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  User,
  Menu,
  LogOut,
  Settings,
  LayoutDashboard,
  FolderTree,
  Tag,
  Users,
  Home,
  Layers,
  X,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navigation({ locale }: { locale: string }) {
  const { data: session, status } = useSession();
  const tNav = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: `/${locale}`, label: tNav("home"), icon: Home },
    { href: `/${locale}/projects`, label: tNav("projects"), icon: Layers },
  ];

  const adminMenuItems = [
    { href: `/${locale}/admin`, label: tAdmin("dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/admin/projects`, label: tAdmin("projects"), icon: Layers },
    { href: `/${locale}/admin/categories`, label: tAdmin("categories"), icon: FolderTree },
    { href: `/${locale}/admin/tags`, label: tAdmin("tags"), icon: Tag },
    { href: `/${locale}/admin/banners`, label: tAdmin("banners"), icon: Layers },
    { href: `/${locale}/admin/users`, label: tAdmin("users"), icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{locale === "mn" ? "MN" : "EN"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={pathname.replace(`/${locale}`, "/en")} className="flex items-center">
                    English
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={pathname.replace(`/${locale}`, "/mn")} className="flex items-center">
                    Монгол
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {session.user?.role === "ADMIN" && (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {tCommon("administration")}
                      </DropdownMenuLabel>
                      {adminMenuItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {tNav("signout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href={`/${locale}/auth/signin`}>
                  <Button variant="ghost" size="sm">
                    {tNav("signin")}
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/signup`}>
                  <Button size="sm">{tNav("signup")}</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                    pathname === item.href ? "bg-accent" : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
