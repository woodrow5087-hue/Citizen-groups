import type { CSSProperties } from "react";
export type IconName =
  | "home"
  | "group"
  | "prayer"
  | "lead"
  | "connect"
  | "share"
  | "calendar"
  | "arrow"
  | "check"
  | "guide"
  | "note"
  | "plus";
// Original line drawings. No brand or third-party icon assets.
const paths: Record<IconName, string> = {
  home: "M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10",
  group:
    "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-3c0-4 12-4 12 0v3M16 5c5 0 5 7 0 7m2 3c3 0 4 2 4 6",
  prayer: "M12 21S3 16 3 9c0-6 7-6 9-2 2-4 9-4 9 2 0 7-9 12-9 12Z",
  lead: "m12 3 9 4v6c0 5-9 9-9 9s-9-4-9-9V7l9-4Zm-4 9 3 3 5-6",
  connect: "M4 4h12v10H9l-5 4V4Zm14 4h3v13l-5-3h-4",
  share: "M4 17 17 4l3 3L7 20H4v-3Zm10-10 3 3M12 21h9",
  calendar:
    "M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2ZM7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  guide: "M12 6C8 3 3 4 3 4v15s5-1 9 2c4-3 9-2 9-2V4s-5-1-9 2Zm0 0v15",
  note: "M5 3h14v18H5V3Zm4 5h6m-6 4h6m-6 4h4",
  plus: "M12 4v16M4 12h16",
};
export function Icon({
  name,
  size = 22,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
