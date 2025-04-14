// app/api/users/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Ensure these paths are correct for YOUR project structure
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client'; // Import Prisma namespace

/**
 * Handles Deleting a specific user by ID (Admin only).
 */
export async function DELETE(
    req: NextRequest,
    context: { params: { userId: string } } // Use standard inline type
) {
    const session = await getServerSession(authOptions);
    const { userId } = context.params;

    // --- Authorization Check ---
    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // --- Prevent Self-Deletion ---
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
        return new Response(null, { status: 204 }); // OK - No Content

    } catch (error: any) {
        console.error(`Failed to delete user ${userId}:`, error);
        if (error.code === 'P2025') { // Prisma code for Record to delete does not exist
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
    }
}

/**
 * Handles Partially Updating (PATCH) a specific user by ID (Admin only).
 */
export async function PATCH(
    req: NextRequest,
    context: { params: { userId: string } } // Use standard inline type
) {
    const session = await getServerSession(authOptions);
    const { userId } = context.params;

    // --- Authorization: Only Admins can edit users ---
    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!userId) {
        return NextResponse.json({ message: 'User ID not provided' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { name, username, email, password, role } = body;

        // --- Prevent Admin self-role change ---
        // You might add more checks here, e.g., preventing changing own password via this API
        if (session.user.id === userId && role && role !== UserRole.ADMIN) {
             return NextResponse.json({ message: 'Admins cannot change their own role.' }, { status: 400 });
        }

        // --- Validation & Data Preparation ---
        const updateData: Prisma.UserUpdateInput = {};

        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email; // Allow email update

        // Handle username change - check for uniqueness
        if (username) {
            const existingUser = await prisma.user.findFirst({
                where: { username: username, NOT: { id: userId } }
            });
            if (existingUser) {
                return NextResponse.json({ message: 'Username already taken by another user.' }, { status: 409 }); // Conflict
            }
            updateData.username = username;
        }

        // Handle password change - hash if provided and not empty
        if (password && typeof password === 'string') {
            if (password.length < 6) { // Example: basic length validation
                 return NextResponse.json({ message: 'New password must be at least 6 characters.' }, { status: 400 });
            }
            updateData.hashedPassword = await bcrypt.hash(password, 10);
        }

        // Handle role change - validate role
        if (role) {
             if (!Object.values(UserRole).includes(role as UserRole)) {
                return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
             }
             // Prevent self-demotion (double check)
             if (session.user.id === userId && role !== UserRole.ADMIN) {
                return NextResponse.json({ message: 'Admins cannot change their own role.' }, { status: 400 });
             }
            updateData.role = role as UserRole;
        }
        // --- End Validation ---

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
             return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
        }

        // Perform the update
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { // Select fields to return (exclude password)
                id: true, name: true, username: true, email: true, role: true, createdAt: true, updatedAt: true, image: true, emailVerified: true
            }
        });

        return NextResponse.json(updatedUser); // Return updated user data (200 OK)

    } catch (error: any) {
        console.error(`Failed to update user ${userId}:`, error);
        if (error.code === 'P2025') { // Record to update not found
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
         // Handle potential unique constraint errors if not caught above
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // Extract the field name if possible from error.meta.target
            const field = (error.meta?.target as string[])?.join(', ') || 'field';
            return NextResponse.json({ message: `Update failed: ${field} must be unique.` }, { status: 409 });
        }
        return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
    }
}