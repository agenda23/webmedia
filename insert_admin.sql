-- 管理者ユーザーの挿入
INSERT INTO User (id, email, passwordHash, name, role, createdAt, updatedAt)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  '$2a$10$JYvv8Qx0XVVPYy5Q4K7Zr.D/93LgkYgSYT9ZLQVJwYwvZaqK.bxeC',
  '管理者',
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 基本設定の挿入
INSERT OR IGNORE INTO Setting (id, key, value, createdAt, updatedAt)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'site_name',
  '飲食店舗 Web メディアサイト',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO Setting (id, key, value, createdAt, updatedAt)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'site_description',
  '飲食店舗の広報活動と情報発信のためのWebメディア',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
EOF < /dev/null