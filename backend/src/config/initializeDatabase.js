import dbConnection from "./database.js";

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const CREATE_SESSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'New chat',
    model VARCHAR(64) NOT NULL DEFAULT 'gemini-3.5-flash-lite',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const CREATE_CONVERSATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    session_id VARCHAR(64) NOT NULL DEFAULT 'default',
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    token_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_session (session_id)
  ) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const isNotNull = (column) => column.IS_NULLABLE === "NO";

const isUnsigned = (column) =>
  column.COLUMN_TYPE.toLowerCase().includes("unsigned");

const usesCurrentTimestamp = (defaultValue) =>
  String(defaultValue ?? "")
    .toLowerCase()
    .replace(/\(\)/g, "") === "current_timestamp";

const validateConversationsTable = ({ columns, table, primaryKeyColumns }) => {
  const byName = new Map(columns.map((column) => [column.COLUMN_NAME, column]));
  const issues = [];

  const id = byName.get("id");
  if (
    !id ||
    id.DATA_TYPE.toLowerCase() !== "bigint" ||
    !isUnsigned(id) ||
    !isNotNull(id) ||
    !id.EXTRA.toLowerCase().includes("auto_increment") ||
    id.COLUMN_KEY !== "PRI" ||
    primaryKeyColumns.length !== 1 ||
    primaryKeyColumns[0] !== "id"
  ) {
    issues.push(
      "id must be a NOT NULL BIGINT UNSIGNED auto-incrementing primary key",
    );
  }

  const role = byName.get("role");
  if (
    !role ||
    role.DATA_TYPE.toLowerCase() !== "enum" ||
    role.COLUMN_TYPE.toLowerCase() !== "enum('user','assistant')" ||
    !isNotNull(role)
  ) {
    issues.push("role must be NOT NULL ENUM('user', 'assistant')");
  }

  const content = byName.get("content");
  if (
    !content ||
    !["text", "mediumtext", "longtext"].includes(content.DATA_TYPE.toLowerCase()) ||
    !isNotNull(content) ||
    !content.CHARACTER_SET_NAME?.toLowerCase().startsWith("utf8")
  ) {
    issues.push("content must be a NOT NULL utf8/utf8mb4 TEXT column");
  }

  const tokenCount = byName.get("token_count");
  if (
    !tokenCount ||
    tokenCount.DATA_TYPE.toLowerCase() !== "int" ||
    !isUnsigned(tokenCount) ||
    !isNotNull(tokenCount) ||
    String(tokenCount.COLUMN_DEFAULT) !== "0"
  ) {
    issues.push("token_count must be NOT NULL INT UNSIGNED DEFAULT 0");
  }

  const createdAt = byName.get("created_at");
  if (
    !createdAt ||
    createdAt.DATA_TYPE.toLowerCase() !== "timestamp" ||
    !isNotNull(createdAt) ||
    !usesCurrentTimestamp(createdAt.COLUMN_DEFAULT) ||
    createdAt.EXTRA.toLowerCase().includes("on update")
  ) {
    issues.push(
      "created_at must be a NOT NULL TIMESTAMP DEFAULT CURRENT_TIMESTAMP column",
    );
  }

  if (
    !table ||
    table.ENGINE?.toLowerCase() !== "innodb" ||
    !table.TABLE_COLLATION?.toLowerCase().startsWith("utf8")
  ) {
    issues.push("the table must use the InnoDB engine and a utf8/utf8mb4 collation");
  }

  if (issues.length > 0) {
    throw new Error(
      `Existing "conversations" table is incompatible with the application: ${issues.join(
        "; ",
      )}. No existing tables or data were changed.`,
    );
  }
};

let initializationPromise;

const initializeDatabaseOnce = async () => {
  const connection = await dbConnection.getConnection();

  try {
    // 1. Initialize users table
    await connection.query(CREATE_USERS_TABLE);

    // 2. Initialize sessions table
    await connection.query(CREATE_SESSIONS_TABLE);

    // Ensure user_id column exists on sessions table
    const [sessionCols] = await connection.query(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'sessions'
         AND COLUMN_NAME = 'user_id'`,
    );
    if (sessionCols.length === 0) {
      await connection.query(
        `ALTER TABLE sessions
         ADD COLUMN user_id INT UNSIGNED NULL AFTER id,
         ADD INDEX idx_user (user_id)`,
      );
    }

    // 3. Initialize conversations table
    await connection.query(CREATE_CONVERSATIONS_TABLE);

    // Ensure session_id column exists on conversations table
    const [convCols] = await connection.query(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'conversations'
         AND COLUMN_NAME = 'session_id'`,
    );
    if (convCols.length === 0) {
      await connection.query(
        `ALTER TABLE conversations
         ADD COLUMN session_id VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default' AFTER id,
         ADD INDEX idx_session (session_id)`,
      );
    }

    // 4. Ensure all tables and columns use the exact same collation (utf8mb4_unicode_ci)
    // to prevent "Illegal mix of collations" during JOINs
    const tablesToNormalize = ["users", "sessions", "conversations"];
    for (const tableName of tablesToNormalize) {
      try {
        await connection.query(
          `ALTER TABLE \`${tableName}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        );
      } catch (collateError) {
        console.warn(
          `Collation normalization note for table "${tableName}":`,
          collateError.message,
        );
      }
    }

    const [columns] = await connection.query(
      `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, CHARACTER_SET_NAME,
              IS_NULLABLE, COLUMN_DEFAULT, EXTRA, COLUMN_KEY
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'conversations'`,
    );

    const [[table]] = await connection.query(
      `SELECT ENGINE, TABLE_COLLATION
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'conversations'`,
    );

    const [primaryKey] = await connection.query(
      `SELECT COLUMN_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'conversations'
         AND CONSTRAINT_NAME = 'PRIMARY'
       ORDER BY ORDINAL_POSITION`,
    );

    validateConversationsTable({
      columns,
      table,
      primaryKeyColumns: primaryKey.map((column) => column.COLUMN_NAME),
    });
  } finally {
    connection.release();
  }
};

export const initializeDatabase = () => {
  if (!initializationPromise) {
    initializationPromise = initializeDatabaseOnce();
  }

  return initializationPromise;
};
