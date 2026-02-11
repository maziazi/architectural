import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type ViewStyle } from "react-native";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];
type IconMapping = Record<string, MaterialIconName>;

const MAPPING: IconMapping = {
  // Home
  "house.fill": "home",
  // Materials
  layers: "layers",
  "layers.fill": "layers",
  // History
  "clock.fill": "schedule",
  history: "history",
  // Misc
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  const materialName: MaterialIconName = MAPPING[name] ?? "help-outline";
  return (
    <MaterialIcons
      name={materialName}
      size={size}
      color={color}
      style={style as any}
    />
  );
}
