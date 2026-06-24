// ─────────────────────────────────────────────────────────────────────────────
// SessionContext — backward-compat re-export
//
// HUB-5: AuthContext is the canonical auth provider.
// This file keeps existing consumers working without changes.
// ─────────────────────────────────────────────────────────────────────────────

export {
  AuthProvider as SessionProvider,
  useAuth      as useSession,
} from "./AuthContext";

export type {
  AuthUser        as SessionUser,
  AuthContextValue as SessionContextValue,
} from "./AuthContext";
