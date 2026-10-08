import { z } from "zod";

/** Client-generated ids for chats, notebooks and messages. */
export const idSchema = z.string().min(1).max(64);
