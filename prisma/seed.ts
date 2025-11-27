import 'dotenv/config';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'changeme123';

  if (!superAdminEmail) {
    throw new Error('SUPER_ADMIN_EMAIL must be set in environment variables');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // Check if a super admin already exists (by email or by role)
  const existingByEmail = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: UserRole.SUPER_ADMIN },
  });

  let superAdmin;

  if (existingByEmail) {
    // Update existing user
    superAdmin = await prisma.user.update({
      where: { email: superAdminEmail },
      data: {
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
      },
    });
    console.log('✅ Super admin updated:', superAdmin.email);
  } else if (existingSuperAdmin) {
    // Update the existing super admin to new email
    superAdmin = await prisma.user.update({
      where: { id: existingSuperAdmin.id },
      data: {
        email: superAdminEmail,
        password: hashedPassword,
      },
    });
    console.log('✅ Super admin updated to new email:', superAdmin.email);
  } else {
    // Create new super admin
    superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        username: 'Super Admin',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
      },
    });
    console.log('✅ Super admin created:', superAdmin.email);
  }

  // Assign all recipes to the super admin BEFORE deleting temp users
  // This prevents cascade deletion of recipes
  const recipesToUpdate = await prisma.recipe.findMany({
    where: {
      userId: {
        not: superAdmin.id,
      },
    },
  });

  if (recipesToUpdate.length > 0) {
    const result = await prisma.recipe.updateMany({
      where: {
        userId: {
          not: superAdmin.id,
        },
      },
      data: {
        userId: superAdmin.id,
      },
    });

    console.log(`✅ Assigned ${result.count} recipes to super admin`);
  } else {
    console.log('✅ No recipes to reassign');
  }

  // Delete any temporary admin users created during migration
  // Do this AFTER reassigning recipes to prevent cascade deletion
  await prisma.user.deleteMany({
    where: {
      email: 'temp@temp.com',
    },
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
