import { Tool } from "@/app/types/generic-types";

export function GetContextMenuTools(): Tool[] {
  return [
    {
      name: "Zoom selected",
      icon: "/icons/fit.webp",
    },
    {
      name: "Isolate selected",
      icon: "/icons/isolate.webp",
    },
    {
      name: "Hide selected",
      icon: "/icons/hidden.webp",
    },
    {
      name: "Show selected",
      icon: "/icons/visible.webp",
    },
    {
      name: "Show All",
      icon: "/icons/visible.webp",
    },
  ];
}
