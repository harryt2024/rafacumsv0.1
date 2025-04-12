// app/api/uniform/[itemId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route'; // Adjust path
import { prisma } from '@/lib/prisma'; // Adjust path
import { UserRole } from '@prisma/client';

interface Params {
  params: { itemId: string };
}

// DELETE handler (ADMIN or specific role only)
export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const { itemId } = params;

  // --- Authorization Check ---
  // TODO: Adjust role check if needed
  if (!session || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  // --- End Authorization Check ---

  if (!itemId) {
    return NextResponse.json({ message: 'Item ID not provided' }, { status: 400 });
  }

  try {
    await prisma.uniformItem.delete({
      where: { id: itemId },
    });
    // Return success, no body content needed usually
    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error('Failed to delete item:', error);
    if (error.code === 'P2025') { // Prisma code for Record to delete does not exist
         return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete item' }, { status: 500 });
  }
}