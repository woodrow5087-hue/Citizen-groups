import type { CSSProperties } from "react";
export const ICON_SIZES = {
  tiny: 16,
  small: 18,
  standard: 21,
  large: 29,
  xl: 64,
} as const;
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
  | "plus"
  | "user"
  | "message"
  | "chevron"
  | "upRight"
  | "info"
  | "reset";
// Original line drawings. No brand or third-party icon assets.
const paths: Record<IconName, string> = {
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 22v-2a8 8 0 0 1 16 0v2",
  message:
    "M21 11.5c0 5-4 8.5-9 8.5-1.5 0-3-.3-4.2-.9L3 21l1.5-4.1A8 8 0 0 1 3 11.5C3 7 7 4 12 4s9 3 9 7.5Z",
  chevron: "m9 5 7 7-7 7",
  upRight: "M6 18 18 6M8 6h10v10",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 8v6m0-10v1",
  reset: "M20 8V3l-3 3a9 9 0 1 0 3 7M20 3v6h-6",
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
  check: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-4 9 2.8 2.8L16.5 9",
  guide: "M12 6C8 3 3 4 3 4v15s5-1 9 2c4-3 9-2 9-2V4s-5-1-9 2Zm0 0v15",
  note: "M5 3h14v18H5V3Zm4 5h6m-6 4h6m-6 4h4",
  plus: "M12 4v16M4 12h16",
};
export function Icon({
  name,
  size = "standard",
  style,
}: {
  name: IconName;
  size?: keyof typeof ICON_SIZES;
  style?: CSSProperties;
}) {
  return (
    <svg
      className="icon"
      width={ICON_SIZES[size]}
      height={ICON_SIZES[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: ICON_SIZES[size], height: ICON_SIZES[size], ...style }}
    >
      <path d={paths[name]} />
    </svg>
  );
}
