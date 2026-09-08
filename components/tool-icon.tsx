import { Code2 } from "lucide-react";
import icons from "@/lib/tool-icons.json";

// Brand paths from Simple Icons (CC0). Original SVG URLs are retained in tool-icons.json.
const aliases: Record<string, keyof typeof icons> = {
  react: "react", reactjs: "react",
  next: "nextjs", nextjs: "nextjs",
  typescript: "typescript", ts: "typescript",
  node: "nodejs", nodejs: "nodejs",
  postgres: "postgresql", postgresql: "postgresql",
  docker: "docker", figma: "figma", git: "git",
};

export function ToolIcon({ name, size = 22 }: { name: string; size?: number }) {
  const key = aliases[name.trim().toLowerCase().replace(/[^a-z0-9]/g, "")];
  if (!key) return <Code2 size={size} aria-hidden="true" />;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="tool-icon"
    >
      {icons[key].paths.map((d, index) => <path key={index} d={d} />)}
    </svg>
  );
}
