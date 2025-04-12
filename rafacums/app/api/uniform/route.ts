// app/api/uniform/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";
import { prisma } from '@/lib/prisma'; // Adjust path
import { UserRole, ItemType, Condition } from '@prisma/client';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for types

// GET handler to fetch uniform items with filtering
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // TODO: Decide who can view items - maybe any logged-in user?
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // --- Filtering Logic ---
  const { searchParams } = new URL(req.url);
  const filters: Prisma.UniformItemWhereInput = {}; // Use Prisma type for where clause

  // Example filters (add one for each column you want to filter)
  if (searchParams.get('type') && Object.values(ItemType).includes(searchParams.get('type') as ItemType)) {
      filters.type = searchParams.get('type') as ItemType;
  }
   if (searchParams.get('size')) {
      filters.size = { contains: searchParams.get('size')!};
  }
  if (searchParams.get('condition') && Object.values(Condition).includes(searchParams.get('condition') as Condition)) {
      filters.condition = searchParams.get('condition') as Condition;
  }
   if (searchParams.get('location')) {
      filters.location = { contains: searchParams.get('location')!};
  }
  // Add more filters for serialNumber, etc. as needed
  // --- End Filtering Logic ---


  try {
    const uniformItems = await prisma.uniformItem.findMany({
      where: filters, // Apply constructed filters
      orderBy: { // Optional default sorting
        createdAt: 'desc',
      },
      // include: { addedBy: { select: { name: true } } } // Optional: include user who added it
    });
    return NextResponse.json(uniformItems);
  } catch (error) {
    console.error('Failed to fetch uniform items:', error);
    return NextResponse.json({ message: 'Failed to fetch uniform items' }, { status: 500 });
  }
}

// POST handler to create a uniform item (ADMIN or specific role only)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // --- Authorization Check ---
  // TODO: Adjust role check if needed (maybe a 'STORE_MANAGER' role?)
  if (!session || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  // --- End Authorization Check ---

  try {
    const body = await req.json();
    const {type, size, serialNumber, condition, location, notes } = body;

    // Basic Validation
    if (!type || !condition) {
      return NextResponse.json({ message: 'Missing required fields (name, type, condition)' }, { status: 400 });
    }
    if (!Object.values(ItemType).includes(type as ItemType) || !Object.values(Condition).includes(condition as Condition) ) {
         return NextResponse.json({ message: 'Invalid type or condition specified' }, { status: 400 });
    }
    // Add more validation as needed

    const newItem = await prisma.uniformItem.create({
      data: {
        type: type as ItemType,
        size: size || null, // Handle optional fields
        serialNumber: serialNumber || null,
        condition: condition as Condition,
        location: location || null,
        notes: notes || null,
        addedById: session.user.id, // Track who added it
      },
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
     console.error('Failed to create uniform item:', error);
     // Handle potential Prisma errors (e.g., unique constraint on serialNumber if added)
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
         if (error.code === 'P2002') { // Unique constraint violation
             return NextResponse.json({ message: `Failed to create item: ${error.meta?.target} must be unique.` }, { status: 409 }); // Conflict
         }
     }
    return NextResponse.json({ message: 'Failed to create uniform item' }, { status: 500 });
  }
}