import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 管理者ユーザーを作成
  const hashedPassword = await bcrypt.hash('i9i90721', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'agenda23@gmail.com' },
    update: {},
    create: {
      email: 'agenda23@gmail.com',
      firstName: '管理者',
      lastName: '',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log({ admin });

  // サイト設定を作成
  await prisma.siteSettings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      siteName: '飲食店舗 Web メディアサイト',
      siteDescription: '飲食店舗の広報活動と情報発信のためのWebメディア',
      adminEmail: 'admin@example.com',
      postsPerPage: 10,
      showAuthorInfo: true,
      enableComments: true,
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });