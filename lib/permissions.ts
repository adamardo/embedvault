import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────────────────
// WHO CAN DO WHAT
//
//   Anyone (no login):   read everything. Nothing else.
//   Logged in:           read, add, edit and delete.
//
// The two switches below let you loosen the rules for guests later, for
// example set GUEST_CAN_ADD to true to let visitors add new things while
// editing and deleting stay login-only. Deleting is ALWAYS login-only.
//
// "Delete" covers everything that removes something: deleting entries,
// snippets, guides, projects and notes, unlinking parts and related
// entries, and removing a favorite.
// ─────────────────────────────────────────────────────────────────────────
export const GUEST_CAN_ADD: boolean = false;
export const GUEST_CAN_EDIT: boolean = false;

export async function isLoggedIn(): Promise<boolean> {
  return verifySessionToken(cookies().get(COOKIE_NAME)?.value, process.env.SESSION_SECRET);
}

// What the current visitor may do; used to decide which buttons to show.
export async function getPermissions() {
  const member = await isLoggedIn();
  return {
    member,
    canAdd: member || GUEST_CAN_ADD,
    canEdit: member || GUEST_CAN_EDIT,
    canDelete: member,
  };
}

function sendToLogin(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

// The REAL protection. Every write action calls one of these first, so a
// guest who sends a request by hand (skipping the buttons) is still refused.
export async function requireMember(): Promise<void> {
  if (!(await isLoggedIn())) sendToLogin("Please log in to delete things.");
}

export async function requireCanAdd(): Promise<void> {
  if (!GUEST_CAN_ADD && !(await isLoggedIn())) sendToLogin("Please log in to add things.");
}

export async function requireCanEdit(): Promise<void> {
  if (!GUEST_CAN_EDIT && !(await isLoggedIn())) sendToLogin("Please log in to edit things.");
}
