// app/api/users/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Ensure these paths are correct for YOUR project structure
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt'; // Import bcrypt if needed for other methods later
import { Prisma } from '@prisma/client'; // Import Prisma namespace

// Define the expected structure for params *inside* the context
interface RouteParams {
    userId: string;
}

// Define the expected structure of the context object itself
interface RouteContext {
    params: RouteParams;
}

// DELETE handler using 'unknown' for context and type assertion inside
export async function DELETE(
    req: NextRequest,
    context: unknown // <-- Type as unknown initially
) {
    // --- Type Assertion ---
    // Assert that context matches the expected structure
    // Add checks to ensure properties exist before accessing
    const params = (context as RouteContext)?.params;
    const userId = params?.userId;
    console.log("--- DELETE /api/users/[userId] ---");
    console.log("Received Context (as unknown then asserted):", JSON.stringify(context, null, 2));
    console.log("Extracted userId via assertion:", userId);
    // --- End Type Assertion ---


    let session;
    try {
        console.log("Attempting getServerSession...");
        session = await getServerSession(authOptions);
        console.log("getServerSession call completed. Session found:", !!session);
    } catch (error) {
        console.error("CRITICAL ERROR during getServerSession:", error);
        return NextResponse.json({ message: 'Failed to check session' }, { status: 500 });
    }

    // --- Authorization Check ---
    if (!session || !session.user || session.user.role !== UserRole.ADMIN) { // Safe access needed for session.user
        console.log("Authorization failed.");
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // --- Prevent Self-Deletion ---
    if (session.user.id === userId) { // userId could be undefined here from assertion
        console.log("Self-deletion attempt blocked or userId missing after assertion.");
        return NextResponse.json({ message: 'Cannot delete yourself or invalid User ID' }, { status: 400 });
    }

    // Check if userId is valid *after* assertion
    if (!userId || typeof userId !== 'string') {
        console.error("userId check failed after assertion! Value was:", userId);
        return NextResponse.json({ message: 'User ID not provided or invalid' }, { status: 400 });
    }

    try {
        console.log(`Attempting prisma.user.delete for ID: ${userId}`);
        await prisma.user.delete({
            where: { id: userId }, // Now userId is confirmed string
        });
        console.log(`Successfully deleted user ${userId}`);
        return new Response(null, { status: 204 });

    } catch (error: any) {
        console.error(`Failed to delete user ${userId}:`, error);
        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
    }
}

// Add other handlers (PATCH, GET etc.) using the same pattern if needed:
// export async function PATCH(req: NextRequest, context: unknown) { ... assert context as RouteContext ... }