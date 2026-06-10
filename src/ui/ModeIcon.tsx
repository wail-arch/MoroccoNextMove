import {
  Bus,
  BusFront,
  CarTaxiFront,
  Footprints,
  TrainFront,
  TramFront,
} from "lucide-react";
import type { TransportMode } from "@/core/types";

const ICONS: Record<TransportMode, typeof Bus> = {
  walk: Footprints,
  tram: TramFront,
  train: TrainFront,
  coach: BusFront,
  bus: Bus,
  "petit-taxi": CarTaxiFront,
  "grand-taxi": CarTaxiFront,
};

export function ModeIcon({
  mode,
  className,
}: {
  mode: TransportMode;
  className?: string;
}) {
  const Icon = ICONS[mode];
  return <Icon className={className} aria-hidden />;
}
