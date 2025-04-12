// app/api/users/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";
import { prisma } from '@/lib/prisma'; // Adjust path
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client'; // Import Prisma namespace

// GET handler to fetch users (ADMIN only) - NOW WITH FILTERING
export async function GET(req: NextRequest) { // Use NextRequest to get searchParams easily
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // --- Filtering Logic ---
  const { searchParams } = new URL(req.url);
  const filters: Prisma.UserWhereInput = {};

  if (searchParams.get('username')) {
      // Assuming case-insensitive collation in DB, otherwise add mode if needed/supported
      filters.username = { contains: searchParams.get('username')! };
  }
  if (searchParams.get('email')) {
      filters.email = { contains: searchParams.get('email')! };
  }
  const roleFilter = searchParams.get('role');
  if (roleFilter && Object.values(UserRole).includes(roleFilter as UserRole)) {
      filters.role = roleFilter as UserRole;
  }
  // --- End Filtering Logic ---

  try {
    const users = await prisma.user.findMany({
      where: filters, // Apply filters here
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST handler (create user) - remains the same as before
export async function POST(req: Request) {
    // ... (keep existing POST logic) ...
     const session = await getServerSession(authOptions);
     if (!session || session.user.role !== UserRole.ADMIN) { /* ... */ }
     try {
         const body = await req.json();
         const { username, password, name, email, role } = body;
         if (!username || !password || !role) { /* ... */ }
         if (!Object.values(UserRole).includes(role as UserRole)) { /* ... */ }
         const existingUser = await prisma.user.findFirst({ where: { OR: [{ username: username }, { email: email }] }});
         if (existingUser) { /* ... */ }
         const hashedPassword = await bcrypt.hash(password, 10);
         const newUser = await prisma.user.create({
             data: { username, hashedPassword, name, email, role: role as UserRole },
         });
         const { hashedPassword: _, ...userWithoutPassword } = newUser;
         return NextResponse.json(userWithoutPassword, { status: 201 });
     } catch (error) { /* ... */ }
}