import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// GET - List all ports for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Get the token and extract user ID
    const token = await getToken({ req });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.sub;

    // Get all ports for the user
    const ports = await prisma.port.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ ports });
  } catch (error) {
    console.error("Error fetching ports:", error);
    return NextResponse.json(
      { error: "Failed to fetch ports" },
      { status: 500 }
    );
  }
}

// POST - Create a new port for the authenticated user
export async function POST(req: NextRequest) {
  try {
    // Get the token and extract user ID
    const token = await getToken({ req });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.sub;
    
    // Get request body
    const { name, portNumber, protocol, host, description } = await req.json();
    
    // Validate input
    if (!name || !portNumber) {
      return NextResponse.json(
        { error: "Name and port number are required" },
        { status: 400 }
      );
    }

    // Check if port number is valid
    if (portNumber < 1 || portNumber > 65535) {
      return NextResponse.json(
        { error: "Port number must be between 1 and 65535" },
        { status: 400 }
      );
    }

    // Create the port
    const port = await prisma.port.create({
      data: {
        name,
        portNumber,
        protocol: protocol || "http",
        host: host || "localhost",
        description,
        userId
      }
    });

    return NextResponse.json({ port }, { status: 201 });
  } catch (error) {
    console.error("Error creating port:", error);
    return NextResponse.json(
      { error: "Failed to create port" },
      { status: 500 }
    );
  }
} 