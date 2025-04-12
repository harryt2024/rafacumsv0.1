// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust path if needed
import { prisma } from '@/lib/prisma'; // Adjust path if needed
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

// GET handler to fetch users (ADMIN only)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      // Select specific fields to avoid sending sensitive data like password
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

// POST handler to create a user (ADMIN only)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { username, password, name, email, role } = body;

    // Basic validation
    if (!username || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields (username, password, role)' }, { status: 400 });
    }
    if (!Object.values(UserRole).includes(role as UserRole)) {
         return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username: username }, { email: email }] }
    });
    if (existingUser) {
        return NextResponse.json({ message: 'Username or email already exists' }, { status: 409 }); // Conflict
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    const newUser = await prisma.user.create({
      data: {
        username,
        hashedPassword,
        name,
        email,
        role: role as UserRole, // Cast role string to UserRole enum
      },
    });

    // Return the created user (excluding password)
    const { hashedPassword: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error('Failed to create user:', error);
    // Handle potential Prisma unique constraint errors specifically if needed
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
  }
}