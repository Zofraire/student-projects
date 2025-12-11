import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

// GET all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { active: true },
      include: {
        categories: true,
        tags: true,
        media: { select: { id: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// CREATE project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        summary: data.summary || null,
        thumbnail: data.thumbnail || null,
        authorName: data.authorName || null,
        authorEmail: data.authorEmail || null,
        featured: data.featured || false,
        active: data.active !== false,
        categories: {
          connect: (data.categoryIds || []).map((id: string) => ({ id })),
        },
        tags: {
          connect: (data.tagIds || []).map((id: string) => ({ id })),
        },
      },
      include: {
        categories: true,
        tags: true,
        media: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// UPDATE project
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Missing project ID" }, { status: 400 });
    }

    const data = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        summary: data.summary || null,
        thumbnail: data.thumbnail || null,
        authorName: data.authorName || null,
        authorEmail: data.authorEmail || null,
        featured: data.featured || false,
        active: data.active !== false,
        categories: {
          set: [],
          connect: (data.categoryIds || []).map((id: string) => ({ id })),
        },
        tags: {
          set: [],
          connect: (data.tagIds || []).map((id: string) => ({ id })),
        },
      },
      include: {
        categories: true,
        tags: true,
        media: true,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("PUT error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE project (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: "Missing project ID" }, { status: 400 });
    }

    await prisma.project.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
