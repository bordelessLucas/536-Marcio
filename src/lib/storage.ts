import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { isFirebaseAdminConfigured, getAdminStorage } from "@/lib/firebase/admin";

export type StoredFile = {
  fileName: string;
  storagePath: string;
  contentType: string;
  sizeBytes: number;
};

const MAX_BYTES = 10 * 1024 * 1024;

export async function storeQuotationAttachment(input: {
  organizationId: string;
  quotationId: string;
  file: File;
}): Promise<StoredFile> {
  if (input.file.size > MAX_BYTES) {
    throw new Error("Arquivo excede 10MB.");
  }

  const bytes = Buffer.from(await input.file.arrayBuffer());
  const safeName = input.file.name.replace(/[^\w.\-()\s]/g, "_");
  const objectPath = `organizations/${input.organizationId}/quotations/${input.quotationId}/${randomUUID()}-${safeName}`;

  if (isFirebaseAdminConfigured()) {
    const bucket = getAdminStorage().bucket();
    const file = bucket.file(objectPath);
    await file.save(bytes, {
      contentType: input.file.type || "application/octet-stream",
      metadata: { cacheControl: "private, max-age=0" },
    });

    return {
      fileName: input.file.name,
      storagePath: `gs://${bucket.name}/${objectPath}`,
      contentType: input.file.type || "application/octet-stream",
      sizeBytes: input.file.size,
    };
  }

  const localDir = path.join(process.cwd(), "uploads", input.organizationId, input.quotationId);
  await mkdir(localDir, { recursive: true });
  const localName = `${randomUUID()}-${safeName}`;
  const localPath = path.join(localDir, localName);
  await writeFile(localPath, bytes);

  return {
    fileName: input.file.name,
    storagePath: `local://${path.relative(process.cwd(), localPath)}`,
    contentType: input.file.type || "application/octet-stream",
    sizeBytes: input.file.size,
  };
}
