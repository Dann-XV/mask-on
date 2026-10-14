import { get, post } from "@/lib/api/client";
import type { Contact } from "@/types/api";

export function fetchContacts() {
  return get<Contact[]>("/users/me/contacts");
}

export function addContact(usernameToAdd: string) {
  return post<{ message: string }>("/users/add", { usernameToAdd });
}

/**
 * Public list of every account. The socket payload carries only a userId, and
 * there's no `GET /users/:id`, so this is the only way to put a name to someone
 * who messaged us before we added them.
 */
export function fetchDirectory() {
  return get<Contact[]>("/users/users");
}
