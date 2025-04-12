// app/api/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route'; // Adjust path
import { prisma } from '@/lib/prisma'; // Adjust path
import { UserRole } from '@prisma/client';

interface Params {
  params: { userId: string };
}

// DELETE handler (ADMIN only)
export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const { userId } = params;

  if (!session || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

   // Prevent admin from deleting themselves? (Optional safety check)
   if (session.user.id === userId) {
        return NextResponse.json({ message: 'Cannot delete yourself' }, { status: 400 });
   }

  if (!userId) {
    return NextResponse.json({ message: 'User ID not provided' }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    // Use status 204 (No Content) if you don't want to send a body
    // return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error('Failed to delete user:', error);
     // Handle case where user doesn't exist (Prisma throws P2025)
    if (error.code === 'P2025') {
         return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}