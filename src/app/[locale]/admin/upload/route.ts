import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${originalName}`;
    const filepath = join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    let mediaType = "IMAGE";
    
    if (["pdf"].includes(ext)) mediaType = "PDF";
    else if (["fbx", "obj", "glb", "gltf", "stl", "3ds"].includes(ext)) mediaType = "MODEL_3D";
    else if (["mp4", "webm", "mov", "avi"].includes(ext)) mediaType = "VIDEO";

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename: file.name,
      type: mediaType,
      modelFormat: ["fbx", "obj", "glb", "gltf", "stl", "3ds"].includes(ext) ? ext : null,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}