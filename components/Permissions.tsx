import { getPermissions } from "@/lib/permissions";

// Wrap a button or form in one of these and only people with that
// permission see it. (Hiding is for tidiness; the server actions enforce it.)

export async function MemberOnly({ children }: { children: React.ReactNode }) {
  const { canDelete } = await getPermissions();
  return canDelete ? <>{children}</> : null;
}

export async function CanAdd({ children }: { children: React.ReactNode }) {
  const { canAdd } = await getPermissions();
  return canAdd ? <>{children}</> : null;
}

export async function CanEdit({ children }: { children: React.ReactNode }) {
  const { canEdit } = await getPermissions();
  return canEdit ? <>{children}</> : null;
}
