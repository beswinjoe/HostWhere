"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActivityEvent } from "@/lib/featured/types";
import {
  Sparkles,
  TrendingUp,
  MousePointerClick,
  Trophy,
  Loader2,
} from "lucide-react";

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function eventIcon(type: string) {
  switch (type) {
    case "featured":
      return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    case "bid_increased":
      return <TrendingUp className="w-3.5 h-3.5 text-blue-500" />;
    case "click":
      return <MousePointerClick className="w-3.5 h-3.5 text-neutral-500" />;
    case "rank_changed":
      return <Trophy className="w-3.5 h-3.5 text-orange-500" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-neutral-400" />;
  }
}

function eventDotColor(type: string) {
  switch (type) {
    case "featured":
      return "bg-amber-100 border-amber-200";
    case "bid_increased":
      return "bg-blue-100 border-blue-200";
    case "click":
      return "bg-neutral-100 border-neutral-200";
    case "rank_changed":
      return "bg-orange-100 border-orange-200";
    default:
      return "bg-neutral-100 border-neutral-200";
  }
}

export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      try {
        const res = await fetch("/api/featured/activity?limit=15");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch {
        // Silently fail — activity feed is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEvents();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchEvents, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="glass rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
        <h3 className="font-semibold text-sm uppercase tracking-wider text-neutral-500">
          Live Activity
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">No activity yet.</p>
          <p className="text-xs text-neutral-400 mt-1">
            Be the first to feature a project!
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="flex items-start gap-3 py-2.5 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
            >
              <div
                className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${eventDotColor(event.type)}`}
              >
                {eventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 leading-snug truncate">
                  {event.description}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {relativeTime(event.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
