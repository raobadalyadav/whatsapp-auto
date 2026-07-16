import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, content } = body;

    const template = await db.template.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name,
        content,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("[TEMPLATE_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const template = await db.template.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("[TEMPLATE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
