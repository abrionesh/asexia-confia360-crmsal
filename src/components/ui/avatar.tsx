import { cn, initials } from "@/lib/utils";

const TONES = [
  "bg-accent-soft text-accent",
  "bg-channel-voice/12 text-channel-voice",
  "bg-success/12 text-success",
  "bg-warning/12 text-warning",
] as const;

function toneFor(name: string) {
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TONES[sum % TONES.length];
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
        size === "sm" && "size-8 text-2xs",
        size === "md" && "size-10 text-xs",
        size === "lg" && "size-14 text-base",
        toneFor(name),
      )}
    >
      {initials(name)}
    </span>
  );
}
