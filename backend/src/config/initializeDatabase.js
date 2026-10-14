import dbConnection from "./database.js";

const CREATE_CONVERSATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    token_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4
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
    content.DATA_TYPE.toLowerCase() !== "text" ||
    !isNotNull(content) ||
    content.CHARACTER_SET_NAME?.toLowerCase() !== "utf8mb4"
  ) {
    issues.push("content must be a NOT NULL utf8mb4 TEXT column");
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
    !table.TABLE_COLLATION?.toLowerCase().startsWith("utf8mb4_")
  ) {
    issues.push("the table must use the InnoDB engine and a utf8mb4 collation");
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
    await connection.query(CREATE_CONVERSATIONS_TABLE);

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
