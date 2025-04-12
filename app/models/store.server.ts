import { prisma } from "~/models/prisma.server";
import type { Store, Address, BusinessHour } from "@prisma/client";

// 店舗情報の型定義
export type StoreInfo = {
  id: string;
  name: string;
  description: string | null;
  phone: string;
  email: string;
  address: {
    zipCode: string;
    prefecture: string;
    city: string;
    street: string;
    building: string | null;
  };
  businessHours: Array<{
    day: string;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
  }>;
  accessInfo: string | null;
  reservationUrl: string | null;
};

// 店舗情報の取得
export async function getStoreInfo(): Promise<StoreInfo> {
  // デフォルトの営業日
  const defaultBusinessHours = [
    { day: "月", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { day: "火", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { day: "水", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { day: "木", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { day: "金", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { day: "土", isOpen: true, openTime: "11:00", closeTime: "23:00" },
    { day: "日", isOpen: true, openTime: "11:00", closeTime: "22:00" },
  ];

  // 店舗情報の取得（関連テーブルも含む）
  const store = await prisma.store.findFirst({
    include: {
      address: true,
      businessHours: true,
    },
  });

  // 店舗情報がない場合はデフォルト値を返す
  if (!store) {
    return {
      id: "",
      name: "",
      description: "",
      phone: "",
      email: "",
      address: {
        zipCode: "",
        prefecture: "",
        city: "",
        street: "",
        building: "",
      },
      businessHours: defaultBusinessHours,
      accessInfo: "",
      reservationUrl: "",
    };
  }

  // 店舗情報を整形して返す
  return {
    id: store.id,
    name: store.name,
    description: store.description,
    phone: store.phone,
    email: store.email,
    address: {
      zipCode: store.address?.zipCode || "",
      prefecture: store.address?.prefecture || "",
      city: store.address?.city || "",
      street: store.address?.street || "",
      building: store.address?.building || "",
    },
    businessHours: store.businessHours.length > 0
      ? store.businessHours.map(hour => ({
          day: hour.day,
          isOpen: hour.isOpen,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        }))
      : defaultBusinessHours,
    accessInfo: store.accessInfo,
    reservationUrl: store.reservationUrl,
  };
}

// 店舗情報の更新
export async function updateStoreInfo(data: Omit<StoreInfo, "id">): Promise<Store> {
  // 既存の店舗情報を取得
  const existingStore = await prisma.store.findFirst();

  if (existingStore) {
    // 既存店舗の更新
    const updatedStore = await prisma.store.update({
      where: { id: existingStore.id },
      data: {
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email,
        accessInfo: data.accessInfo,
        reservationUrl: data.reservationUrl,
        // 住所情報の更新（upsert）
        address: {
          upsert: {
            create: {
              zipCode: data.address.zipCode,
              prefecture: data.address.prefecture,
              city: data.address.city,
              street: data.address.street,
              building: data.address.building,
            },
            update: {
              zipCode: data.address.zipCode,
              prefecture: data.address.prefecture,
              city: data.address.city,
              street: data.address.street,
              building: data.address.building,
            },
          },
        },
      },
    });

    // 営業時間情報の更新
    // 一度すべて削除してから再作成
    await prisma.businessHour.deleteMany({
      where: { storeId: existingStore.id },
    });

    for (const hour of data.businessHours) {
      await prisma.businessHour.create({
        data: {
          storeId: existingStore.id,
          day: hour.day,
          isOpen: hour.isOpen,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        },
      });
    }

    return updatedStore;
  } else {
    // 新規店舗の作成
    const newStore = await prisma.store.create({
      data: {
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email,
        accessInfo: data.accessInfo,
        reservationUrl: data.reservationUrl,
        address: {
          create: {
            zipCode: data.address.zipCode,
            prefecture: data.address.prefecture,
            city: data.address.city,
            street: data.address.street,
            building: data.address.building,
          },
        },
      },
    });

    // 営業時間情報の作成
    for (const hour of data.businessHours) {
      await prisma.businessHour.create({
        data: {
          storeId: newStore.id,
          day: hour.day,
          isOpen: hour.isOpen,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        },
      });
    }

    return newStore;
  }
}