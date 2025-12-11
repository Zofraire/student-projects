import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(tags);
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

    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        slug: data.slug,
        color: data.color || null,
      },
    });

    return NextResponse.json(tag, { status: 201 });
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
      return NextResponse.json({ message: "Missing tag ID" }, { status: 400 });
    }

    const tag = await prisma.tag.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        color: data.color || null,
      },
    });

    return NextResponse.json(tag);
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

    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing tag ID" }, { status: 400 });
    }

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tag deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
