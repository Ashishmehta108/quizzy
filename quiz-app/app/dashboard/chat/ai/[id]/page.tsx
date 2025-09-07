"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/app/context/socket.context";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/quiz-render/MarkdownRender";
import EmptyState from "@/components/Empty";
import { Skeleton } from "@/components/ui/skeleton";
import aira from "@/public/aira.jpg";
import { MessageSquare, Send2 } from "iconsax-reactjs";
import { AutoResizeTextarea } from "@/components/followups/AutoResize";

type Role = "user" | "assistant";

interface Message {
  id?: string;
  role: Role;
  content: string;
  status?: "sent" | "received" | "error";
  createdAt?: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  number?: number;
}

function FollowUpMessage({ content, role, createdAt }: Message) {
  const { user } = useUser();
  const isUser = role === "user";
  const timestamp = createdAt
    ? new Date(createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn(
        "flex items-end gap-2 w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
          <AvatarFallback className="bg-zinc-300 text-zinc-700 text-xs">
            AI
          </AvatarFallback>
          <AvatarImage
            src={aira.src}
            alt="AI Avatar"
            className="h-full w-full object-cover object-[center_30%]"
          />
        </Avatar>
      )}

      <div className="flex flex-col">
        <Card
          className={cn(
            "rounded-2xl shadow-sm px-4 py-2 text-sm transition-colors",
            isUser
              ? "bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 text-zinc-900 border-zinc-300 dark:border-zinc-700 max-w-[250px]"
              : "bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-100 text-zinc-900 border-zinc-200 dark:border-zinc-600 max-w-2xl"
          )}
        >
          <MarkdownRenderer>{content}</MarkdownRenderer>
        </Card>
        {timestamp && (
          <span className="text-[10px] text-zinc-500 mt-1 self-end">
            {timestamp}
          </span>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-zinc-700 text-zinc-100 text-xs">
            U
          </AvatarFallback>
          <AvatarImage src={user?.imageUrl} />
        </Avatar>
      )}
    </motion.div>
  );
}

export default function QuizChatPage() {
  const { id: quizId } = useParams();
  const search = useSearchParams();
  const questionFollowupParam = search?.get("followup") ?? null;
  console.log(questionFollowupParam);

  const { socket } = useSocket();
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!socket || !isLoaded || !userId || !quizId) return;

    socket.emit("join_session", { quizId, userId });
    socket.on("session_ready", async ({ sessionId }) => {
      setSessionId(sessionId);
      try {
        const res = await fetch(
          `${BACKEND_URL}/chat/${quizId}?userId=${userId}`
        );
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setHistoryLoading(false);
      }
    });

    return () => {
      socket.off("session_ready");
    };
  }, [socket, isLoaded, userId, quizId]);

  useEffect(() => {
    if (!quizId) return;
    setQuestionsLoading(true);
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/chat/${quizId}/questions`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        const q: QuizQuestion[] = (data.questions || data || []).map(
          (item: any, idx: number) => ({
            id: item.id ?? String(idx + 1),
            text: item.text ?? item.question ?? item.title ?? String(item),
            number: item.number ?? idx + 1,
          })
        );
        setQuestions(q);
        if (questionFollowupParam) {
          const foundById = q.find((qq) => qq.id === questionFollowupParam);
          const num = Number(questionFollowupParam);
          const foundByNum =
            !Number.isNaN(num) && q.find((qq) => qq.number === num);
          const found = foundById || foundByNum;
          if (found) {
            setInput(`Explain question ${found.number ?? ""}: ${found.text}`);

            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setQuestionsLoading(false);
      }
    })();
  }, [quizId, questionFollowupParam]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: { content: string }) => {
      const assistant: Message = {
        role: "assistant",
        content: msg.content,
        status: "received",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistant]);
      setLoading(false);
      setIsTyping(false);
    };

    socket.on("ai_response", handler);
    return () => {
      socket.off("ai_response", handler);
    };
  }, [socket]);

  const sendMessage = async () => {
    if (!input.trim() || !socket || !userId || !sessionId) return;

    const msgText = input.trim();
    const userMsg: Message = {
      role: "user",
      content: msgText,
      status: "sent",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    fetch(`${BACKEND_URL}/chat/${quizId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userMsg, sessionId, userId }),
    }).catch(console.error);

    socket.emit("quiz_chat", {
      quizId,
      sessionId,
      userId,
      query: msgText,
    });

    setInput("");
    setLoading(true);
    setIsTyping(true);
    setShowQuestions(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // when user picks a question
  const handlePickQuestion = (q: QuizQuestion) => {
    setInput(`Explain question ${q.number ?? ""}: ${q.text}`);
    setShowQuestions(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="relative flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-y-auto max-w-3xl container mx-auto px-4 py-6 space-y-6">
        {historyLoading ? (
          <div className="space-y-6">
            <div className="flex items-end gap-2 justify-end">
              <div className="flex flex-col gap-2 max-w-[250px]">
                <Skeleton className="h-4 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>
            <div className="flex items-end gap-2 justify-start">
              <Skeleton className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex flex-col gap-2 max-w-2xl">
                <Skeleton className="h-4 w-52 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                <Skeleton className="h-4 w-72 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>

            <div className="flex items-end gap-2 justify-end">
              <div className="flex flex-col gap-2 max-w-[250px]">
                <Skeleton className="h-4 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>

            <div className="flex items-end gap-2 justify-start">
              <Skeleton className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex flex-col gap-2 max-w-2xl">
                <Skeleton className="h-4 w-60 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                <Skeleton className="h-4 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Start the conversation by asking a question about this quiz."
            action={
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Type your first question below or pick one from the quiz 👇
              </p>
            }
          />
        ) : (
          <>
            {messages.map((msg, idx) => {
              const prev = messages[idx - 1];
              const showDivider =
                !prev ||
                (msg.createdAt &&
                  prev?.createdAt &&
                  formatDate(msg.createdAt) !== formatDate(prev.createdAt));

              return (
                <div key={msg.id ?? idx}>
                  {showDivider && (
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                        {formatDate(msg.createdAt!)}
                      </span>
                    </div>
                  )}
                  <FollowUpMessage
                    content={msg.content}
                    role={msg.role}
                    createdAt={msg.createdAt}
                  />
                </div>
              );
            })}

            {isTyping && (
              <FollowUpMessage
                content="Typing..."
                role="assistant"
                createdAt={new Date().toISOString()}
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </main>
      <footer className="sticky bottom-0 z-10 bg-card px-4 pt-6 pb-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3 relative">
          {/* Questions picker */}
          <div className="relative">
            <Button
              onClick={() => setShowQuestions((s) => !s)}
              variant="ghost"
              className="h-9 w-9 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition"
              aria-expanded={showQuestions}
              title="Pick a quiz question"
            >
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Q
              </span>
            </Button>

            {showQuestions && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.14 }}
                className="absolute left-0 bottom-12 z-50 w-[320px] max-h-[320px] overflow-auto rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Quiz questions
                  </h4>
                  <button
                    className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                    onClick={() => setShowQuestions(false)}
                  >
                    Close
                  </button>
                </div>

                {questionsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-10 rounded-md bg-zinc-50 dark:bg-zinc-800 animate-pulse"
                      />
                    ))}
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    No questions found for this quiz.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {questions.map((q) => (
                      <li key={q.id}>
                        <button
                          onClick={() => handlePickQuestion(q)}
                          className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                        >
                          <div className="flex-shrink-0 h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-200">
                            {q.number ?? "Q"}
                          </div>
                          <div className="text-left text-sm text-zinc-800 dark:text-zinc-100 line-clamp-2">
                            {q.text}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </div>

          {/* Auto-resize textarea */}
          <div className="flex-1 flex items-center border-t border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1 shadow-sm">
            <AutoResizeTextarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this quiz..."
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              disabled={loading}
              rows={1}
              className="w-full text-sm text-foreground placeholder:text-zinc-400 resize-none bg-transparent outline-none"
              style={{ minHeight: "40px", maxHeight: "200px" }}
            />
          </div>

          {/* Send button */}
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
            className="rounded-full h-9 w-9 shadow-md"
            aria-label="Send"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
