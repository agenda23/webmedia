import bcrypt from "bcryptjs";
import { prisma } from "./prisma.server";

// ユーザー作成関数
export async function createUser({ 
  email, 
  password, 
  name = "", 
  role = "AUTHOR" 
}: { 
  email: string; 
  password: string; 
  name?: string; 
  role?: "ADMIN" | "EDITOR" | "AUTHOR" | "CONTRIBUTOR"; 
}) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name,
      role: role as any, // Prismaの型に合わせる
    },
  });
}

// ユーザー認証関数
export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValid) {
    return null;
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// ユーザー取得関数
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return null;
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// ユーザー一覧取得関数
export async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    }
  });
  
  // nameが空の場合はemailから生成する
  return users.map(user => ({
    ...user,
    name: user.name || user.email.split('@')[0]
  }));
}

// 互換性のために残しておく
export async function getAllUsers() {
  return getUsers();
}

// ユーザー更新関数
export async function updateUser(id: string, data: { name?: string; email?: string; role?: string }) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

// ユーザー権限更新関数
export async function updateUserRole(id: string, role: string) {
  return prisma.user.update({
    where: { id },
    data: { role },
  });
}

// パスワード変更関数
export async function changePassword(id: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  return prisma.user.update({
    where: { id },
    data: {
      passwordHash: hashedPassword,
    },
  });
}

// ユーザー削除関数
export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}
