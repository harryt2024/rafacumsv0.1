// app/api/users/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Ensure these paths are correct for YOUR project structure
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// DELETE handler using 'any' for context as a workaround for potential v15 build issue
export async function DELETE(
    req: NextRequest,
    context: any // <-- Using 'any' as requested workaround (loses type safety here)
) {
    const session = await getServerSession(authOptions);

    // IMPORTANT: Need to safely access params now context is 'any'
    // Use optional chaining (?.) and type assertion/check
    const userId = context?.params?.userId as string | undefined;

    // --- Authorization Check ---
    // Only Admins can delete users
    if (!session || session.user?.role !== UserRole.ADMIN) { // Added safe access session.user?.role
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    // --- End Authorization Check ---

    // --- Prevent Self-Deletion ---
    // Added safe access session.user?.id
    if (!session.user || session.user.id === userId) {
        return NextResponse.json({ message: 'Cannot delete yourself or invalid session' }, { status: 400 });
    }
    // --- End Self-Deletion Check ---

    // Check if userId was actually extracted
    if (!userId) {
        return NextResponse.json({ message: 'User ID not provided or invalid' }, { status: 400 });
    }

    try {
        // Delete the user from the database
        await prisma.user.delete({
            where: { id: userId },
        });
        // Return 204 No Content for successful DELETE
        return new Response(null, { status: 204 });

    } catch (error: any) {
        console.error('Failed to delete user:', error);
        // Handle specific Prisma error code for record not found
        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        // Generic error for other database issues
        return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
    }
}

// If you add GET/PUT handlers later, apply the 'context: any' signature there too
// export async function GET(req: NextRequest, context: any) { ... }
// export async function PUT(req: NextRequest, context: any) { ... }