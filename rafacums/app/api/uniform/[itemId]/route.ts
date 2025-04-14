// app/api/uniform/[itemId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Ensure these paths are correct for YOUR project structure
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client'; // Make sure ItemType/Condition are not needed here unless checking them

// DELETE handler for deleting a specific uniform item by ID
export async function DELETE(
    req: NextRequest,
    context: any // Using 'any' workaround for potential Next.js 15 build issue
) {
    // --- Logging Start ---
    console.log("--- ENTERED DELETE /api/uniform/[itemId] ---");
    console.log("Received Context:", JSON.stringify(context, null, 2)); // Log context object
    const itemId = context?.params?.itemId as string | undefined; // Safe access needed due to 'any'
    console.log("Extracted itemId:", itemId); // Log the extracted ID
    // --- Logging End ---

    let session;
    try {
        console.log("Attempting getServerSession...");
        session = await getServerSession(authOptions);
        console.log("getServerSession call completed. Session found:", !!session); // Log session status
    } catch (error) {
        console.error("CRITICAL ERROR during getServerSession:", error);
        return NextResponse.json({ message: 'Failed to check session' }, { status: 500 });
    }

    // --- Authorization Check ---
    // Allows any logged-in user (USER or ADMIN) - based on previous changes
    if (!session || !session.user) {
        console.log("Authorization failed (No session or user).");
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // --- End Authorization Check ---

    // Check if itemId was actually extracted correctly
    if (!itemId) {
        console.error("itemId check failed! Value was:", itemId); // Log before returning 400
        return NextResponse.json({ message: 'Item ID not provided or invalid' }, { status: 400 }); // Corrected message
    }

    try {
        console.log(`Attempting prisma.uniformItem.delete for ID: ${itemId}`); // Log before DB call
        // Ensure model name 'uniformItem' matches your prisma schema
        await prisma.uniformItem.delete({
            where: { id: itemId },
        });
        console.log(`Successfully deleted uniform item ${itemId}`); // Log success
        return new Response(null, { status: 204 }); // OK - No Content

    } catch (error: any) {
        console.error(`Failed to delete uniform item ${itemId}:`, error); // Log specific error
        // Handle specific Prisma error code for record not found
        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'Uniform item not found' }, { status: 404 });
        }
        // Generic error for other database issues
        return NextResponse.json({ message: 'Failed to delete uniform item' }, { status: 500 });
    }
}

// No other handlers (GET, PUT etc.) defined in this file currently