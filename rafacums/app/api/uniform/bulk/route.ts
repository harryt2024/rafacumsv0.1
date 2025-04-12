// app/api/uniform/bulk/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route'; // Adjust path
import { prisma } from '@/lib/prisma'; // Adjust path
import { UserRole, ItemType, Condition } from '@prisma/client';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // --- Authorization Check ---
  // Ensure user is logged in and has appropriate role (e.g., ADMIN)
  if (!session || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  // --- End Authorization Check ---

  try {
    const body = await req.json();
    // Destructure expected fields, including quantity
    const { type, size, condition, location, notes, quantity } = body;

    // --- Validation ---
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
       return NextResponse.json({ message: 'Invalid or missing quantity (must be a positive number)' }, { status: 400 });
    }
    if (!type || !condition) {
      return NextResponse.json({ message: 'Missing required fields (type, condition)' }, { status: 400 });
    }
     if (!Object.values(ItemType).includes(type as ItemType) || !Object.values(Condition).includes(condition as Condition) ) {
         return NextResponse.json({ message: 'Invalid type or condition specified' }, { status: 400 });
    }
    // NOTE: We are NOT handling serialNumber here as createMany cannot easily generate unique ones.
    // If serial numbers are needed, a different approach (looping prisma.create) might be required.
    // --- End Validation ---

    // Prepare the data object for a single item
    const itemData: Omit<Prisma.UniformItemCreateInput, 'id' | 'createdAt' | 'updatedAt'> = {
      type: type as ItemType,
      size: size || null,
      // serialNumber: null, // Explicitly null if needed, otherwise omit
      condition: condition as Condition,
      location: location || null,
      notes: notes || null,
      // Link to the user who added the batch
    };

    // Create an array of data objects for createMany
    const itemsToCreate = Array(parsedQuantity).fill(itemData);

    // Use Prisma's createMany for efficiency
    const result = await prisma.uniformItem.createMany({
      data: itemsToCreate,
      skipDuplicates: false, // Set to true only if you have unique constraints you want to ignore errors for (like serialNumber - but not recommended here)
    });

    // createMany returns an object like { count: number }
    return NextResponse.json({ message: `Successfully added ${result.count} items.`, count: result.count, addedType: type }, { status: 201 });

  } catch (error: any) {
     console.error('Failed to bulk create uniform items:', error);
     // Handle potential Prisma errors if needed
     return NextResponse.json({ message: 'Failed to bulk create uniform items' }, { status: 500 });
  }
}