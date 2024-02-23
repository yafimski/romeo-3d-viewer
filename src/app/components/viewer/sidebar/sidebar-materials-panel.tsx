import { FC, useState } from "react";
import { ModifierPicker } from "./modifier-picker";
import { GetLightModifierTools, GetMaterialModifierTools } from "./modifier-tools";

export const MaterialsPanel: FC = () => {
  const [currentPopup, setCurrentPopup] = useState("");

  const lightTools = GetLightModifierTools();
  const materialTools = GetMaterialModifierTools();

  return (
    <div className="material-settings-container">
      {
        <>
          {lightTools.map((tool) => (
            <ModifierPicker
              key={tool.name}
              title={tool.name}
              icon={tool.icon}
              onOpen={() => setCurrentPopup(tool.name)}
              onClose={() => setCurrentPopup("")}
              isOpen={currentPopup === tool.name}
            />
          ))}
          {materialTools.map((tool) => (
            <ModifierPicker
              key={tool.name}
              title={tool.name}
              icon={tool.icon}
              onOpen={() => setCurrentPopup(tool.name)}
              onClose={() => setCurrentPopup("")}
              isOpen={currentPopup === tool.name}
            />
          ))}
        </>
      }
    </div>
  );
};
