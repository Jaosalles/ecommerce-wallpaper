import { permissionPolicy } from "./policies";
import {
  AuthzActor,
  AuthorizationResult,
  Permission,
  PermissionPolicy,
} from "./types";

class AuthorizationFacade {
  constructor(private readonly policy: PermissionPolicy) {}

  hasPermission(role: AuthzActor["role"], permission: Permission) {
    return this.policy[permission]?.includes(role) ?? false;
  }

  can(actor: AuthzActor | null, permission: Permission) {
    if (!actor) {
      return false;
    }

    return this.hasPermission(actor.role, permission);
  }

  authorize(actor: AuthzActor | null, permission: Permission): AuthorizationResult {
    if (!actor) {
      return {
        ok: false,
        status: 401,
        error: "Não autenticado",
      };
    }

    if (!this.can(actor, permission)) {
      return {
        ok: false,
        status: 403,
        error: "Acesso negado",
      };
    }

    return { ok: true };
  }
}

export const authz = new AuthorizationFacade(permissionPolicy);
