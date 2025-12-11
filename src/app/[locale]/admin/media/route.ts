import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId, media } = await request.json();

    const createdMedia = await prisma.projectMedia.createMany({
      data: media.map((m: any, index: number) => ({
        projectId,
        type: m.type,
        url: m.url,
        filename: m.filename,
        title: m.title || null,
        order: index,
        modelFormat: m.modelFormat || null,
        videoPlatform: m.videoPlatform || null,
        videoId: m.videoId || null,
      })),
    });

    return NextResponse.json({ count: createdMedia.count }, { status: 201 });
  } catch (error) {
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
    if (!id) return NextResponse.json({ message: "Media ID required" }, { status: 400 });

    await prisma.projectMedia.delete({ where: { id } });
    return NextResponse.json({ message: "Media deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}