/** Payload emitted by the backend on `private_message`. */
export interface IncomingMessage {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  status: "sent" | "delivered" | "read";
}

export interface ChatMessage {
  id: string;
  peerId: string;
  content: string;
  outgoing: boolean;
  createdAt: number;
}

/**
 * Someone we have a thread with. Contacts are one-directional on the backend,
 * so a person can message us before we've added them — those arrive as peers
 * with `isContact: false`, and the server will reject replies until we add them.
 */
export interface Peer {
  _id: string;
  username: string;
  isContact: boolean;
  /** True when the username couldn't be resolved from the public directory. */
  unresolved?: boolean;
}

/** Messages are dropped by a MongoDB TTL index 5 minutes after creation. */
export const MESSAGE_TTL_MS = 5 * 60 * 1000;
