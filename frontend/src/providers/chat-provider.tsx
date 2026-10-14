"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";

import { fetchContacts, fetchDirectory } from "@/lib/api/contacts";
import { clearIdentity, readIdentity, type Identity } from "@/lib/session";
import { ApiError, type Contact } from "@/types/api";
import { MESSAGE_TTL_MS, type ChatMessage, type IncomingMessage, type Peer } from "@/types/chat";

type Status = "loading" | "ready" | "unauthenticated";

interface ChatValue {
  /** Null until the session probe resolves; consumers render skeletons meanwhile. */
  identity: Identity | null;
  ready: boolean;
  contacts: Contact[];
  /** Contacts plus anyone who has messaged us but isn't a contact yet. */
  peers: Peer[];
  messages: Record<string, ChatMessage[]>;
  unread: Record<string, number>;
  connected: boolean;
  setActivePeerId: (peerId: string | null) => void;
  sendMessage: (peerId: string, content: string) => void;
  refreshContacts: () => Promise<void>;
  logOut: () => void;
}

const ChatContext = createContext<ChatValue | null>(null);

export function useChat() {
  const value = useContext(ChatContext);
  if (!value) throw new Error("useChat must be used inside <ChatProvider>");
  return value;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [connected, setConnected] = useState(false);
  const [directory, setDirectory] = useState<Record<string, string>>({});
  const lookedUp = useRef<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const activePeerRef = useRef<string | null>(null);

  const endSession = useCallback(() => {
    clearIdentity();
    socketRef.current?.disconnect();
    socketRef.current = null;
    setStatus("unauthenticated");
  }, []);

  // Verify the cookie is still good. There's no GET /me on the backend, so the
  // contacts endpoint doubles as the session probe.
  useEffect(() => {
    const stored = readIdentity();
    if (!stored) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    fetchContacts()
      .then((list) => {
        if (cancelled) return;
        setContacts(list);
        setIdentity(stored);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        // Only a genuine auth failure ends the session. A network blip or a
        // 500 used to log people out too, which threw away a perfectly valid
        // cookie because the server hiccuped.
        if (err instanceof ApiError && err.isAuthFailure) {
          clearIdentity();
          setStatus("unauthenticated");
          return;
        }

        // Still signed in, just couldn't load contacts. Come up with an empty
        // list; the socket's reconnect banner and "Refresh contacts" cover it.
        toast.error(err instanceof ApiError ? err.message : "Couldn't load your contacts.");
        setIdentity(stored);
        setStatus("ready");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  // One socket for the whole shell, so messages for background chats still land.
  useEffect(() => {
    if (status !== "ready" || !identity) return;

    const socket = io({ withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", (err: Error) => {
      setConnected(false);
      if (err.message === "unauthorized") endSession();
    });

    socket.on("private_message", (payload: IncomingMessage) => {
      const outgoing = payload.fromUserId === identity.userId;
      const peerId = outgoing ? payload.toUserId : payload.fromUserId;

      const message: ChatMessage = {
        id: payload.id,
        peerId,
        content: payload.content,
        outgoing,
        createdAt: new Date(payload.createdAt).getTime(),
      };

      setMessages((prev) => {
        const list = prev[peerId] ?? [];
        if (list.some((m) => m.id === message.id)) return prev;
        return { ...prev, [peerId]: [...list, message] };
      });

      if (!outgoing && peerId !== activePeerRef.current) {
        setUnread((prev) => ({ ...prev, [peerId]: (prev[peerId] ?? 0) + 1 }));
      }
    });

    socket.on("private_message_error", ({ error }: { error: string }) => toast.error(error));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [status, identity, endSession]);

  // Mirror the server's 5-minute TTL so bubbles disappear when the rows do.
  useEffect(() => {
    const timer = setInterval(() => {
      setMessages((prev) => {
        const now = Date.now();
        let changed = false;
        const next: Record<string, ChatMessage[]> = {};

        for (const [peerId, list] of Object.entries(prev)) {
          const kept = list.filter((m) => now - m.createdAt < MESSAGE_TTL_MS);
          if (kept.length !== list.length) changed = true;
          next[peerId] = kept;
        }

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Someone can message us before we've added them, so a thread can exist for
  // a userId that's in no contact list. Resolve those names from the public
  // directory — the socket payload carries only ids.
  const unresolved = useMemo(
    () =>
      Object.keys(messages).filter(
        (id) => !contacts.some((c) => c._id === id) && !directory[id],
      ),
    [messages, contacts, directory],
  );

  useEffect(() => {
    const pending = unresolved.filter((id) => !lookedUp.current.has(id));
    if (pending.length === 0) return;

    pending.forEach((id) => lookedUp.current.add(id));

    fetchDirectory()
      .then((users) => {
        setDirectory((prev) => {
          const next = { ...prev };
          for (const user of users) next[user._id] = user.username;
          return next;
        });
      })
      .catch(() => {
        // Non-fatal: the thread still shows, just without a resolved name.
        // Un-mark them so the next message from that peer retries the lookup.
        pending.forEach((id) => lookedUp.current.delete(id));
      });
  }, [unresolved]);

  const peers = useMemo<Peer[]>(() => {
    const list: Peer[] = contacts.map((c) => ({
      _id: c._id,
      username: c.username,
      isContact: true,
    }));

    for (const peerId of Object.keys(messages)) {
      if (list.some((p) => p._id === peerId)) continue;
      list.push({
        _id: peerId,
        username: directory[peerId] ?? "Unknown sender",
        isContact: false,
        unresolved: !directory[peerId],
      });
    }

    return list;
  }, [contacts, messages, directory]);

  const setActivePeerId = useCallback((peerId: string | null) => {
    activePeerRef.current = peerId;
    if (!peerId) return;
    setUnread((prev) => (prev[peerId] ? { ...prev, [peerId]: 0 } : prev));
  }, []);

  const sendMessage = useCallback((peerId: string, content: string) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      toast.error("Not connected. Your message wasn't sent.");
      return;
    }
    // The server echoes the saved message back to us, so we render on echo
    // rather than guessing an id locally.
    socket.emit("private_message", { toUserId: peerId, content });
  }, []);

  const refreshContacts = useCallback(async () => {
    try {
      setContacts(await fetchContacts());
    } catch (err) {
      if (err instanceof ApiError && err.isAuthFailure) endSession();
      else toast.error(err instanceof ApiError ? err.message : "Couldn't refresh contacts.");
    }
  }, [endSession]);

  const logOut = useCallback(() => {
    clearIdentity();
    socketRef.current?.disconnect();
    socketRef.current = null;

    // Deliberate full document load, not router.replace. A soft navigation
    // left Next's cached /chat segment alive, so the auth screen and the chat
    // shell traded places until a manual reload. It also guarantees the
    // in-memory message store is gone rather than lingering in a torn-down
    // tree — which matters more here than in a normal app.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  }, []);

  // Children always render, even while the probe is in flight. Gating them
  // behind a spinner would drop the route segment from Next's render pass and
  // break instant navigation into /chat/[userId].
  return (
    <ChatContext.Provider
      value={{
        identity,
        ready: status === "ready" && identity !== null,
        contacts,
        peers,
        messages,
        unread,
        connected,
        setActivePeerId,
        sendMessage,
        refreshContacts,
        logOut,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
