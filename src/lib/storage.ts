import "server-only";

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const PRODUCT_IMAGES_BUCKET = "product-images";
const PRODUCT_ORIGINALS_BUCKET = "product-originals";

const allowedBuckets = [
  PRODUCT_IMAGES_BUCKET,
  PRODUCT_ORIGINALS_BUCKET,
] as const;

export type StorageBucket = (typeof allowedBuckets)[number];

export const allowedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

const bucketMaxBytes: Record<StorageBucket, number> = {
  [PRODUCT_IMAGES_BUCKET]: 5 * 1024 * 1024,
  [PRODUCT_ORIGINALS_BUCKET]: 30 * 1024 * 1024,
};

function sanitizeSegment(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9-_]/g, "-");
}

function getFileExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();

  if (
    extensionFromName &&
    extensionFromName.length <= 5 &&
    /^[a-z0-9]+$/.test(extensionFromName)
  ) {
    return extensionFromName;
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  if (file.type === "image/avif") {
    return "avif";
  }

  return "bin";
}

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase Storage não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return { url, serviceRoleKey };
}

function createStorageAdminClient() {
  const { url, serviceRoleKey } = getSupabaseEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getSupabaseHostname() {
  const { url } = getSupabaseEnv();
  return new URL(url).hostname;
}

export function isStorageBucket(value: string): value is StorageBucket {
  return allowedBuckets.includes(value as StorageBucket);
}

export function validateUploadFile(file: File, bucket: StorageBucket) {
  const maxBytes = bucketMaxBytes[bucket];

  if (
    !allowedImageMimeTypes.includes(
      file.type as (typeof allowedImageMimeTypes)[number],
    )
  ) {
    return {
      ok: false,
      code: "invalid_file",
      message: "Formato de imagem não permitido",
    } as const;
  }

  if (file.size > maxBytes) {
    return {
      ok: false,
      code: "file_too_large",
      message: "Arquivo excede o limite de tamanho do bucket",
    } as const;
  }

  return { ok: true } as const;
}

export type UploadProductImageParams = {
  bucket: StorageBucket;
  targetId: string;
  targetType: "product" | "draft";
  file: File;
};

export async function uploadProductImage({
  bucket,
  targetId,
  targetType,
  file,
}: UploadProductImageParams) {
  const extension = getFileExtension(file);
  const fileId = randomUUID();
  const folder = targetType === "product" ? "products" : "drafts";
  const path = `${folder}/${sanitizeSegment(targetId)}/${fileId}.${extension}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const cacheControl = bucket === PRODUCT_IMAGES_BUCKET ? "31536000" : "3600";

  const supabaseAdmin = createStorageAdminClient();

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, bytes, {
      contentType: file.type,
      cacheControl,
      upsert: false,
    });

  if (error) {
    throw new Error(
      `Falha no upload para o Supabase Storage: ${error.message}`,
    );
  }

  if (bucket === PRODUCT_IMAGES_BUCKET) {
    const publicUrlData = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    return {
      bucket,
      path,
      url: publicUrlData.data.publicUrl,
    };
  }

  const signedUrl = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  if (signedUrl.error) {
    throw new Error(`Falha ao criar URL assinada: ${signedUrl.error.message}`);
  }

  return {
    bucket,
    path,
    url: signedUrl.data.signedUrl,
  };
}

type StorageObjectPointer = {
  bucket: StorageBucket;
  path: string;
};

export function getStorageObjectFromUrl(
  url: string,
): StorageObjectPointer | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== getSupabaseHostname()) {
      return null;
    }

    const publicPrefix = "/storage/v1/object/public/";
    const signPrefix = "/storage/v1/object/sign/";

    let objectRef = "";

    if (parsed.pathname.startsWith(publicPrefix)) {
      objectRef = parsed.pathname.slice(publicPrefix.length);
    } else if (parsed.pathname.startsWith(signPrefix)) {
      objectRef = parsed.pathname.slice(signPrefix.length);
    } else {
      return null;
    }

    const slashIndex = objectRef.indexOf("/");

    if (slashIndex <= 0) {
      return null;
    }

    const bucket = objectRef.slice(0, slashIndex);
    const path = decodeURIComponent(objectRef.slice(slashIndex + 1));

    if (!isStorageBucket(bucket) || !path) {
      return null;
    }

    return { bucket, path };
  } catch {
    return null;
  }
}

export async function deleteStorageObject({
  bucket,
  path,
}: StorageObjectPointer) {
  const supabaseAdmin = createStorageAdminClient();
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Falha ao remover arquivo do storage: ${error.message}`);
  }
}

export async function deleteStorageObjectFromUrl(url: string) {
  const objectPointer = getStorageObjectFromUrl(url);

  if (!objectPointer) {
    return false;
  }

  await deleteStorageObject(objectPointer);
  return true;
}
