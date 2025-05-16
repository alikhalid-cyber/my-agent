import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// GET - Get a specific port by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the token and extract user ID
    const token = await getToken({ req });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.sub;

    // Find the port
    const port = await prisma.port.findUnique({
      where: { id }
    });

    // Check if port exists and belongs to the user
    if (!port) {
      return NextResponse.json(
        { error: "Port not found" },
        { status: 404 }
      );
    }

    if (port.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ port });
  } catch (error) {
    console.error("Error fetching port:", error);
    return NextResponse.json(
      { error: "Failed to fetch port" },
      { status: 500 }
    );
  }
}

// PUT - Update a specific port
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the token and extract user ID
    const token = await getToken({ req });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.sub;

    // Check if port exists and belongs to the user
    const existingPort = await prisma.port.findUnique({
      where: { id }
    });

    if (!existingPort) {
      return NextResponse.json(
        { error: "Port not found" },
        { status: 404 }
      );
    }

    if (existingPort.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get request body
    const { name, portNumber, protocol, host, description, isActive } = await req.json();
    
    // Validate port number if provided
    if (portNumber && (portNumber < 1 || portNumber > 65535)) {
      return NextResponse.json(
        { error: "Port number must be between 1 and 65535" },
        { status: 400 }
      );
    }

    // Update the port
    const updatedPort = await prisma.port.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        portNumber: portNumber !== undefined ? portNumber : undefined,
        protocol: protocol !== undefined ? protocol : undefined,
        host: host !== undefined ? host : undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      }
    });

    return NextResponse.json({ port: updatedPort });
  } catch (error) {
    console.error("Error updating port:", error);
    return NextResponse.json(
      { error: "Failed to update port" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific port
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the token and extract user ID
    const token = await getToken({ req });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.sub;

    // Check if port exists and belongs to the user
    const existingPort = await prisma.port.findUnique({
      where: { id }
    });

    if (!existingPort) {
      return NextResponse.json(
        { error: "Port not found" },
        { status: 404 }
      );
    }

    if (existingPort.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the port
    await prisma.port.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Port deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting port:", error);
    return NextResponse.json(
      { error: "Failed to delete port" },
      { status: 500 }
    );
  }
} 