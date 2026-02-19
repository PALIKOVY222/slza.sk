import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { firstName, lastName, email, phone, company } = body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      company?: { name?: string; vatId?: string; taxId?: string };
    };

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Používateľ neexistuje' }, { status: 404 });
    }

    // If email changed, check for duplicates
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Tento email už používa iný účet' }, { status: 409 });
      }
    }

    // Update user fields
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
      },
    });

    // Update or create company
    if (company) {
      if (user.companyId && user.company) {
        // Update existing company
        await prisma.company.update({
          where: { id: user.companyId },
          data: {
            ...(company.name !== undefined && { name: company.name }),
            ...(company.vatId !== undefined && { vatId: company.vatId }),
            ...(company.taxId !== undefined && { taxId: company.taxId }),
          },
        });
      } else if (company.name) {
        // Create new company and link to user
        const newCompany = await prisma.company.create({
          data: {
            name: company.name,
            vatId: company.vatId || null,
            taxId: company.taxId || null,
          },
        });
        await prisma.user.update({
          where: { id },
          data: { companyId: newCompany.id },
        });
      }
    }

    // Fetch updated user with company
    const result = await prisma.user.findUnique({
      where: { id },
      include: {
        company: { select: { name: true, vatId: true, taxId: true } },
        orders: { select: { total: true } },
      },
    });

    if (!result) {
      return NextResponse.json({ error: 'Chyba pri načítaní' }, { status: 500 });
    }

    const ordersTotal = result.orders.reduce((sum, order) => sum + (order.total || 0), 0);

    return NextResponse.json({
      success: true,
      customer: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        phone: result.phone,
        role: result.role,
        createdAt: result.createdAt,
        company: result.company,
        ordersCount: result.orders.length,
        ordersTotal,
      },
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Chyba pri aktualizácii používateľa' },
      { status: 500 }
    );
  }
}

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
