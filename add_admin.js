import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  try {
    // パスワードをハッシュ化
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 管理者ユーザーを作成
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        passwordHash: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        email: 'admin@example.com',
        name: '管理者',
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('管理者ユーザーを作成しました:');
    console.log(`メールアドレス: admin@example.com`);
    console.log(`パスワード: admin123`);
    console.log(admin);
    
    // 基本設定を追加
    await prisma.setting.upsert({
      where: { key: 'site_name' },
      update: {},
      create: {
        key: 'site_name',
        value: '飲食店舗 Web メディアサイト',
      },
    });

    await prisma.setting.upsert({
      where: { key: 'site_description' },
      update: {},
      create: {
        key: 'site_description',
        value: '飲食店舗の広報活動と情報発信のためのWebメディア',
      },
    });
    
    console.log('基本設定を追加しました');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
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
EOF < /dev/null