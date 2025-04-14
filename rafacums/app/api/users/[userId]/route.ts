// app/api/users/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Ensure these paths are correct for YOUR project structure
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

/**
 * Handles Deleting a specific user by ID (Admin only).
 * Uses 'context: any' as workaround.
 */
export async function DELETE(
    req: NextRequest,
    context: any // <-- Applying 'any' workaround
) {
    const session = await getServerSession(authOptions);
    // Safe access needed due to 'any'
    const userId = context?.params?.userId as string | undefined;

    // Authorization Check
    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    // Prevent Self-Deletion
    if (!session.user || session.user.id === userId) {
        return NextResponse.json({ message: 'Cannot delete yourself or invalid session' }, { status: 400 });
    }
    // ID Check
    if (!userId || typeof userId !== 'string') {
        console.error("Delete userId check failed! Value was:", userId);
        return NextResponse.json({ message: 'User ID not provided or invalid' }, { status: 400 });
    }

    try {
        await prisma.user.delete({ where: { id: userId } });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error(`Failed to delete user ${userId}:`, error);
        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
    }
}

/**
 * Handles Partially Updating (PATCH) a specific user by ID (Admin only).
 * Uses 'context: any' as workaround.
 */
export async function PATCH(
    req: NextRequest,
    context: any // <-- Applying 'any' workaround
) {
    const session = await getServerSession(authOptions);
     // Safe access needed due to 'any'
    const userId = context?.params?.userId as string | undefined;

    // Authorization: Only Admins can edit users
    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    // ID Check
    if (!userId || typeof userId !== 'string') {
         console.error("Patch userId check failed! Value was:", userId);
        return NextResponse.json({ message: 'User ID not provided or invalid' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { name, username, email, password, role } = body;

        // Prevent Admin self-role change
        if (session.user.id === userId && role && role !== UserRole.ADMIN) {
             return NextResponse.json({ message: 'Admins cannot change their own role.' }, { status: 400 });
        }

        const updateData: Prisma.UserUpdateInput = {};
        // Build updateData object checking if fields are defined...
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (username) { /* ... check uniqueness ... */
             const existingUser = await prisma.user.findFirst({ where: { username: username, NOT: { id: userId } }});
             if (existingUser) { return NextResponse.json({ message: 'Username already taken' }, { status: 409 }); }
             updateData.username = username;
         }
        if (password && typeof password === 'string') { /* ... check length, hash password ... */
             if (password.length < 6) { return NextResponse.json({ message: 'Password too short' }, { status: 400 }); }
             updateData.hashedPassword = await bcrypt.hash(password, 10);
         }
        if (role) { /* ... validate role ... */
             if (!Object.values(UserRole).includes(role as UserRole)) { return NextResponse.json({ message: 'Invalid role' }, { status: 400 }); }
             if (session.user.id === userId && role !== UserRole.ADMIN) { return NextResponse.json({ message: 'Cannot self-demote' }, { status: 400 }); }
             updateData.role = role as UserRole;
         }

        if (Object.keys(updateData).length === 0) {
             return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({ /* ... prisma update call ... */
            where: { id: userId }, data: updateData,
            select: { id: true, name: true, username: true, email: true, role: true, createdAt: true, updatedAt: true, image: true, emailVerified: true }
         });
        return NextResponse.json(updatedUser);

    } catch (error: any) { /* ... error handling ... */
        console.error(`Failed to update user ${userId}:`, error);
        if (error.code === 'P2025') { return NextResponse.json({ message: 'User not found' }, { status: 404 }); }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { const field = (error.meta?.target as string[])?.join(', ') || 'field'; return NextResponse.json({ message: `Update failed: ${field} must be unique.` }, { status: 409 }); }
        return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
    }
}