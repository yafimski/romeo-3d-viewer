import { Tool } from "@/app/types/generic-types";

export function GetMaterialModifierTools(): Tool[] {
  return [
    {
      name: "Color",
      icon: "/icons/materials.webp",
    },
  ];
}

export function GetLightModifierTools(): Tool[] {
  return [
    {
      name: "Light Direction",
      icon: "/icons/sun_direction.webp",
    },
    {
      name: "Light Intensity",
      icon: "/icons/sun.webp",
    },
  ];
}
