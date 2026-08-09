import { apiClient } from "./client";
import type { AIMessage } from "../types";

export const getChatHistory = () =>
  apiClient.get<AIMessage[]>("/user/ai/history").then((r) => r.data);

export const sendChatMessage = (message: string) =>
  apiClient.post<{ reply: string }>("/user/ai/chat", { message }).then((r) => r.data);

export const clearChatHistory = () => apiClient.delete("/user/ai/history");