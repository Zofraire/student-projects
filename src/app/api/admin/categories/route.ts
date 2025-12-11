import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      include: {
        parent: true,
        children: { where: { active: true } },
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId || null,
        order: data.order || 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ message: "Missing category ID" }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId || null,
        order: data.order || 0,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("PUT error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "Missing category ID" }, { status: 400 });
    }

    // Check for projects using this category
    const projectsCount = await prisma.project.count({
      where: {
        categories: { some: { id } },
        active: true,
      },
    });

    if (projectsCount > 0) {
      return NextResponse.json(
        { message: "Cannot delete category: there are active projects in this category." },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.category.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
