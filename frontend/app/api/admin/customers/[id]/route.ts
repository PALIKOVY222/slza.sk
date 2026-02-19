import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: { orders: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'Používateľ neexistuje' }, { status: 404 });
    }

    // Prevent deleting admin
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Nemožno odstrániť administrátora' }, { status: 403 });
    }

    // Delete in correct order to avoid foreign key violations
    // 1. Delete sessions
    await prisma.session.deleteMany({ where: { userId: id } });

    // 2. Delete audit logs
    await prisma.auditLog.deleteMany({ where: { userId: id } });

    // 3. Delete addresses
    await prisma.address.deleteMany({ where: { userId: id } });

    // 4. For orders - disconnect user but keep orders for records
    await prisma.order.updateMany({
      where: { userId: id },
      data: { userId: null as unknown as string },
    });

    // 5. Delete the user
    await prisma.user.delete({ where: { id } });

    // 6. Delete company if it was only for this user
    if (user.companyId) {
      const otherUsers = await prisma.user.findMany({
        where: { companyId: user.companyId },
      });
      if (otherUsers.length === 0) {
        await prisma.address.deleteMany({ where: { companyId: user.companyId } });
        await prisma.company.delete({ where: { id: user.companyId } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Chyba pri odstraňovaní používateľa' },
      { status: 500 }
    );
  }
}
