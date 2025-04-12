-- 新しいnameカラムを追加
ALTER TABLE "User" ADD COLUMN "name" TEXT;

-- 既存のfirstName, lastNameデータをnameカラムに移行
UPDATE "User" 
SET "name" = CASE 
    WHEN "firstName" IS NOT NULL AND "lastName" IS NOT NULL 
    THEN "firstName" || ' ' || "lastName"
    WHEN "firstName" IS NOT NULL 
    THEN "firstName"
    WHEN "lastName" IS NOT NULL 
    THEN "lastName"
    ELSE NULL
END;

-- 古いカラムを削除
ALTER TABLE "User" DROP COLUMN "firstName";
ALTER TABLE "User" DROP COLUMN "lastName";
