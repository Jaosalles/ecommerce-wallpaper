export type AppRole = "CUSTOMER" | "ADMIN";

export type Permission =
  | "product:create"
  | "product:update"
  | "product:delete"
  | "collection:create"
  | "collection:update"
  | "collection:delete";

export type AuthzActor = {
  id: string;
  email: string;
  role: AppRole;
};

export type AuthorizationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
    };

export type PermissionPolicy = Record<Permission, AppRole[]>;
