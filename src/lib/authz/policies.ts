import { PermissionPolicy } from "./types";

export const permissionPolicy: PermissionPolicy = {
  "product:create": ["ADMIN"],
  "product:update": ["ADMIN"],
  "product:delete": ["ADMIN"],
  "collection:create": ["ADMIN"],
  "collection:update": ["ADMIN"],
  "collection:delete": ["ADMIN"],
};
