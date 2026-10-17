import { readFileSync } from "node:fs";
import { X509Certificate } from "node:crypto";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const defaultCaCertificatePath = fileURLToPath(
  new URL("../../certs/ca.pem", import.meta.url),
);
const databaseHost = process.env.DB_HOST?.trim().toLowerCase();
const isLocalHost = localHosts.has(databaseHost);
const sslSetting = process.env.DB_SSL?.trim().toLowerCase() || undefined;
const caCertificate = process.env.DB_SSL_CA?.trim();
const caCertificatePath = process.env.DB_SSL_CA_PATH?.trim();

if (sslSetting && sslSetting !== "true" && sslSetting !== "false") {
  throw new Error("DB_SSL must be set to true or false.");
}

const useSsl =
  sslSetting === undefined ? !isLocalHost : sslSetting === "true";

if (!isLocalHost && !useSsl) {
  throw new Error(
    "SSL cannot be disabled for a remote MySQL host. Set DB_SSL=true and configure its CA certificate.",
  );
}

if (caCertificate && caCertificatePath) {
  throw new Error(
    "Set only one of DB_SSL_CA (PEM contents) or DB_SSL_CA_PATH (path to a PEM file).",
  );
}

if ((caCertificate || caCertificatePath) && !useSsl) {
  throw new Error("A DB SSL CA was supplied, but DB_SSL is disabled.");
}

const readCaCertificate = () => {
  // An environment variable is the preferred option for Render. Only fall
  // back to a file when PEM contents were not supplied.
  if (caCertificate) {
    return caCertificate;
  }

  const certificatePath =
    caCertificatePath || (!isLocalHost ? defaultCaCertificatePath : undefined);

  if (certificatePath) {
    try {
      return readFileSync(certificatePath, "utf8");
    } catch {
      throw new Error(
        "Could not read the database CA certificate. Place the Aiven PEM certificate at backend/certs/ca.pem or set DB_SSL_CA_PATH to a file available in the backend runtime.",
      );
    }
  }

  return caCertificate;
};

let sslOptions;
if (useSsl) {
  const ca = readCaCertificate()?.replace(/\\n/g, "\n").trim();

  if (!isLocalHost && !ca) {
    throw new Error(
      "DB_SSL_CA or DB_SSL_CA_PATH is required for remote MySQL connections. Provide the CA certificate from Aiven; certificate verification will not be disabled.",
    );
  }

  if (ca) {
    try {
      const certificate = new X509Certificate(ca);
      if (!certificate.ca) {
        throw new Error("The supplied certificate is not a CA certificate.");
      }
    } catch {
      throw new Error(
        "The DB SSL CA is not a valid PEM-encoded CA certificate. Check DB_SSL_CA or DB_SSL_CA_PATH.",
      );
    }
  }

  sslOptions = {
    ...(ca && { ca }),
    rejectUnauthorized: true,
    verifyIdentity: true,
  };
}

const dbConnection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Remote databases use verified TLS; localhost stays plaintext by default.
  ...(sslOptions && { ssl: sslOptions }),
});

export default dbConnection;
