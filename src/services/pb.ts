import PocketBase from "pocketbase";

export function getPocketBase() {
  const url = process.env.POCKETBASE_URL;
  const token = process.env.POCKETBASE_ADMIN_TOKEN;
  if (!url || !token) throw new Error("PocketBase env missing");
  const pb = new PocketBase(url);
  pb.authStore.save(token, null);
  return pb;
}

export function fileUrl(collection: string, recordId: string, filename: string) {
  const url = process.env.POCKETBASE_URL;
  if (!url) return "";
  return `${url}/api/files/${collection}/${recordId}/${filename}`;
}

