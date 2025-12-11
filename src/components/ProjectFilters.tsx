"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Search, Filter, X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface ProjectFiltersProps {
  categories: Category[];
  tags: Tag[];
  locale: string;
}

export default function ProjectFilters({ categories, tags, locale }: ProjectFiltersProps) {
  const t = useTranslations("projects");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category")?.split(",").filter(Boolean) || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Build category tree
  const buildCategoryTree = (cats: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    cats.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    cats.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parentId) {
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children!.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const categoryTree = buildCategoryTree(categories);

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (selectedCategories.length > 0) params.set("category", selectedCategories.join(","));
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (sortBy !== "newest") params.set("sort", sortBy);

    router.push(`/${locale}/projects?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedTags([]);
    setSortBy("newest");
    router.push(`/${locale}/projects`);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const renderCategory = (category: Category, level: number = 0) => (
    <div key={category.id} style={{ paddingLeft: `${level * 12}px` }}>
      <div className="flex items-center gap-2 py-1">
        {category.children && category.children.length > 0 && (
          <button
            type="button"
            onClick={() => toggleExpanded(category.id)}
            className="p-0.5 hover:bg-muted rounded"
          >
            {expandedCategories.includes(category.id) ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        <div className="flex items-center gap-2">
          <Checkbox
            id={`cat-${category.id}`}
            checked={selectedCategories.includes(category.id)}
            onCheckedChange={() => toggleCategory(category.id)}
          />
          <Label
            htmlFor={`cat-${category.id}`}
            className="text-sm font-normal cursor-pointer"
          >
            {category.name}
          </Label>
        </div>
      </div>
      {category.children &&
        category.children.length > 0 &&
        expandedCategories.includes(category.id) && (
          <div className="ml-2">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
    </div>
  );

  const hasActiveFilters =
    search ||
    selectedCategories.length > 0 ||
    selectedTags.length > 0 ||
    sortBy !== "newest";

  return (
    <div className="space-y-6 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Filter className="h-4 w-4" />
          {t("filter")}
        </h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            {t("clearFilters")}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label>{t("searchPlaceholder")}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label>{t("sortBy")}</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("newest")}</SelectItem>
            <SelectItem value="oldest">{t("oldest")}</SelectItem>
            <SelectItem value="alphabetical">{t("alphabetical")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <Label>{t("category")}</Label>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {categoryTree.map((category) => renderCategory(category))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <Label>{t("tags")}</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedTags.includes(tag.id) && tag.color
                    ? ""
                    : ""
                )}
                style={
                  selectedTags.includes(tag.id) && tag.color
                    ? { backgroundColor: tag.color, borderColor: tag.color }
                    : tag.color
                    ? { borderColor: tag.color, color: tag.color }
                    : {}
                }
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <Button onClick={applyFilters} className="w-full">
        {t("applyFilters")}
      </Button>
    </div>
  );
}
