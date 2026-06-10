"use client";

import { useEffect } from "react";
import type { NextMove } from "@/core/types";
import { removeMove, saveMove, useSavedMoves } from "@/lib/saved";
import { track } from "@/lib/track";
import { NextMoveCard } from "@/ui/NextMoveCard";

export function MoveResults({
  moves,
  fromLabel,
  toLabel,
  trackEvent,
}: {
  moves: NextMove[];
  fromLabel: string;
  toLabel: string;
  trackEvent: "move_result_shown" | "plan_search";
}) {
  const saved = useSavedMoves();
  const savedIds = new Set(saved.map((s) => s.id));

  useEffect(() => {
    track(trackEvent, { count: moves.length, from: fromLabel, to: toLabel });
    // Results identity is captured by the route URL; re-firing per identical
    // render would inflate the KPI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSave(move: NextMove) {
    const id = `${fromLabel}→${toLabel}:${move.id}`;
    if (savedIds.has(id)) {
      removeMove(id);
    } else {
      saveMove({ id, fromLabel, toLabel, move });
      track("move_saved", { move: move.id });
    }
  }

  return (
    <div className="grid gap-4">
      {moves.map((move, i) => (
        <NextMoveCard
          key={move.id}
          move={move}
          isBest={i === 0}
          saved={savedIds.has(`${fromLabel}→${toLabel}:${move.id}`)}
          onToggleSave={toggleSave}
        />
      ))}
    </div>
  );
}
