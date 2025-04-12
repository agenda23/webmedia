/**
 * お問い合わせメール送信のためのモデル
 */

import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma.server";

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
};

/**
 * お問い合わせフォームからのメール送信処理
 * 実際のメール送信処理は環境によって異なるため、ここではログ出力とデータベース保存のみ行う
 * @param contactData お問い合わせフォームのデータ
 */
export async function sendContactEmail(contactData: ContactFormData) {
  try {
    // お問い合わせ内容をデータベースに保存（実装例）
    // この例では、prismaに適切なモデルがあることを想定しています
    // 実際のプロジェクトでは環境に合わせて実装してください
    try {
      // お問い合わせをデータベースに保存（将来的な機能）
      // 現時点ではコメントアウトしておく
      /*
      await prisma.contactInquiry.create({
        data: {
          name: contactData.name,
          email: contactData.email,
          subject: contactData.subject,
          message: contactData.message,
          inquiryType: contactData.inquiryType,
          createdAt: new Date(),
        },
      });
      */
    } catch (dbError) {
      console.error("Failed to save contact inquiry to database:", dbError);
      // データベース保存エラーだけで全体の処理を止めない
    }

    // メール送信処理をここに実装（実際のプロジェクトでは環境に合わせてください）
    // 例: SendGridやNodemailerなどのライブラリを使用
    
    console.log("Contact email would be sent with the following data:", {
      to: "info@example.com", // 送信先メールアドレス
      from: contactData.email,
      subject: `[お問い合わせ] ${contactData.subject}`,
      inquiryType: contactData.inquiryType,
      message: contactData.message,
    });

    // 送信成功として返す
    return { success: true };
  } catch (error) {
    console.error("Failed to send contact email:", error);
    throw new Error("お問い合わせメールの送信に失敗しました。");
  }
}
