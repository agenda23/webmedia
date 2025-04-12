import { PrismaClient } from "@prisma/client";

// PrismaClientをグローバルに保持するための型定義
declare global {
  var __db: PrismaClient | undefined;
}

// 実際のPrismaClientインスタンスを作成
const originalPrisma = global.__db || new PrismaClient({
  log: ["query", "error", "warn"],
});

// firstName/lastName 変換のための拡張したラッパークラス
class PrismaClientWithNameCompat {
  // 元のPrismaClientインスタンス
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // userモデルを直接アクセスする際のプロキシ
  get user() {
    return {
      ...this.prisma.user,
      findMany: async (args?: any) => {
        // firstName/lastNameフィールドのマッピング
        this._processUserSelectFields(args);
        const users = await this.prisma.user.findMany(args);
        return users.map(this._addNameCompat);
      },
      findUnique: async (args?: any) => {
        // firstName/lastNameフィールドのマッピング
        this._processUserSelectFields(args);
        const user = await this.prisma.user.findUnique(args);
        return user ? this._addNameCompat(user) : null;
      },
      findFirst: async (args?: any) => {
        // firstName/lastNameフィールドのマッピング
        this._processUserSelectFields(args);
        const user = await this.prisma.user.findFirst(args);
        return user ? this._addNameCompat(user) : null;
      },
      update: this.prisma.user.update.bind(this.prisma.user),
      delete: this.prisma.user.delete.bind(this.prisma.user),
      create: this.prisma.user.create.bind(this.prisma.user),
      count: this.prisma.user.count.bind(this.prisma.user),
      upsert: this.prisma.user.upsert.bind(this.prisma.user),
    };
  }

  // Postモデルのincludeでuserを参照する場合の対応
  get post() {
    return {
      ...this.prisma.post,
      findMany: async (args?: any) => {
        this._processIncludeAuthor(args);
        const posts = await this.prisma.post.findMany(args);
        return this._processUserInResults(posts);
      },
      findUnique: async (args?: any) => {
        this._processIncludeAuthor(args);
        const post = await this.prisma.post.findUnique(args);
        return post ? this._processUserInResult(post) : null;
      },
      findFirst: async (args?: any) => {
        this._processIncludeAuthor(args);
        const post = await this.prisma.post.findFirst(args);
        return post ? this._processUserInResult(post) : null;
      },
      update: async (args?: any) => {
        this._processIncludeAuthor(args);
        const post = await this.prisma.post.update(args);
        return this._processUserInResult(post);
      },
      create: async (args?: any) => {
        this._processIncludeAuthor(args);
        const post = await this.prisma.post.create(args);
        return this._processUserInResult(post);
      },
      delete: this.prisma.post.delete.bind(this.prisma.post),
      count: this.prisma.post.count.bind(this.prisma.post),
      upsert: this.prisma.post.upsert.bind(this.prisma.post),
    };
  }

  // Eventモデルのincludeでuserを参照する場合の対応
  get event() {
    return {
      ...this.prisma.event,
      findMany: async (args?: any) => {
        this._processIncludeAuthor(args);
        const events = await this.prisma.event.findMany(args);
        return this._processUserInResults(events);
      },
      findUnique: async (args?: any) => {
        this._processIncludeAuthor(args);
        const event = await this.prisma.event.findUnique(args);
        return event ? this._processUserInResult(event) : null;
      },
      findFirst: async (args?: any) => {
        this._processIncludeAuthor(args);
        const event = await this.prisma.event.findFirst(args);
        return event ? this._processUserInResult(event) : null;
      },
      update: async (args?: any) => {
        this._processIncludeAuthor(args);
        const event = await this.prisma.event.update(args);
        return this._processUserInResult(event);
      },
      create: async (args?: any) => {
        this._processIncludeAuthor(args);
        const event = await this.prisma.event.create(args);
        return this._processUserInResult(event);
      },
      delete: this.prisma.event.delete.bind(this.prisma.event),
      count: this.prisma.event.count.bind(this.prisma.event),
      upsert: this.prisma.event.upsert.bind(this.prisma.event),
    };
  }

  // commentモデルも同様に拡張
  get comment() {
    return {
      ...this.prisma.comment,
      findMany: async (args?: any) => {
        this._processIncludeAuthor(args);
        const comments = await this.prisma.comment.findMany(args);
        return this._processUserInResults(comments);
      },
      findUnique: async (args?: any) => {
        this._processIncludeAuthor(args);
        const comment = await this.prisma.comment.findUnique(args);
        return comment ? this._processUserInResult(comment) : null;
      },
      findFirst: async (args?: any) => {
        this._processIncludeAuthor(args);
        const comment = await this.prisma.comment.findFirst(args);
        return comment ? this._processUserInResult(comment) : null;
      },
      update: async (args?: any) => {
        this._processIncludeAuthor(args);
        const comment = await this.prisma.comment.update(args);
        return this._processUserInResult(comment);
      },
      create: async (args?: any) => {
        this._processIncludeAuthor(args);
        const comment = await this.prisma.comment.create(args);
        return this._processUserInResult(comment);
      },
      delete: this.prisma.comment.delete.bind(this.prisma.comment),
      count: this.prisma.comment.count.bind(this.prisma.comment),
      upsert: this.prisma.comment.upsert.bind(this.prisma.comment),
    };
  }

  // その他のモデルはそのまま元のPrismaClientから取得
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }

  get $connect() {
    return this.prisma.$connect.bind(this.prisma);
  }

  get $disconnect() {
    return this.prisma.$disconnect.bind(this.prisma);
  }

  // その他のPrismaClientのプロパティをプロキシ
  get address() { return this.prisma.address; }
  get businessHour() { return this.prisma.businessHour; }
  get category() { return this.prisma.category; }
  get eventToTag() { return this.prisma.eventToTag; }
  get media() { return this.prisma.media; }
  get menuItem() { return this.prisma.menuItem; }
  get postToTag() { return this.prisma.postToTag; }
  get setting() { return this.prisma.setting; }
  get siteSettings() { return this.prisma.siteSettings; }
  get store() { return this.prisma.store; }
  get tag() { return this.prisma.tag; }
  get $queryRaw() { return this.prisma.$queryRaw.bind(this.prisma); }
  get $executeRaw() { return this.prisma.$executeRaw.bind(this.prisma); }

  // firstName, lastNameを追加するユーティリティ
  private _addNameCompat(user: any) {
    if (!user) return user;
    return {
      ...user,
      firstName: user.name || '',
      lastName: '',
    };
  }

  // Userモデルのselectフィールドをマッピングするユーティリティ
  private _processUserSelectFields(args?: any) {
    if (!args) return;
    if (args.select) {
      // firstNameフィールドがあれば、nameフィールドも追加
      if (args.select.firstName !== undefined) {
        args.select.name = true;
      }
      // lastNameフィールドは無視（手動で追加）
      if (args.select.lastName !== undefined) {
        delete args.select.lastName;
      }
    }
  }

  // includeでauthorを指定している場合の処理
  private _processIncludeAuthor(args?: any) {
    if (!args || !args.include) return;

    // authorを含む場合の処理
    if (args.include.author) {
      // selectフィールドがある場合
      if (args.include.author.select) {
        if (args.include.author.select.firstName !== undefined) {
          args.include.author.select.name = true;
        }
        if (args.include.author.select.lastName !== undefined) {
          delete args.include.author.select.lastName;
        }
      }
    }

    // commentsを含む場合の処理
    if (args.include.comments) {
      // Commentがauthorを含む場合
      if (args.include.comments.include && args.include.comments.include.author) {
        if (args.include.comments.include.author.select) {
          if (args.include.comments.include.author.select.firstName !== undefined) {
            args.include.comments.include.author.select.name = true;
          }
          if (args.include.comments.include.author.select.lastName !== undefined) {
            delete args.include.comments.include.author.select.lastName;
          }
        }
      }
    }
  }

  // 結果がユーザーを含む配列の場合の処理
  private _processUserInResults(results: any[]) {
    if (!results || !Array.isArray(results)) return results;
    
    return results.map(item => this._processUserInResult(item));
  }

  // 結果がユーザーを含むオブジェクトの場合の処理
  private _processUserInResult(result: any) {
    if (!result) return result;

    // Userオブジェクトの場合
    if (result.passwordHash !== undefined) {
      return this._addNameCompat(result);
    }

    // authorを含むオブジェクトの場合
    if (result.author) {
      result.author = this._addNameCompat(result.author);
    }

    // commentsを含むオブジェクトの場合
    if (result.comments && Array.isArray(result.comments)) {
      result.comments = result.comments.map((comment: any) => {
        if (comment.author) {
          comment.author = this._addNameCompat(comment.author);
        }
        return comment;
      });
    }

    return result;
  }
}

// 拡張版PrismaClientをエクスポート
export const prisma = new PrismaClientWithNameCompat(originalPrisma);

// 開発環境でのみグローバル変数にPrismaClientを保存
if (process.env.NODE_ENV !== "production") {
  global.__db = originalPrisma;
}

