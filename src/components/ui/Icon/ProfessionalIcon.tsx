// Deprecated legacy icon module. Do not import.
export {};

// Size mapping
const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  color = "current",
  className = "",
  strokeWidth = 2,
  ...props
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    // console.warn(`Icon "${name}" not found`);
    return null;
  }

  const sizeValue = sizeMap[size] || size;
  const colorValue = getComponentColor("icon", color);

  return (
    <IconComponent
      size={sizeValue}
      strokeWidth={strokeWidth}
      className={className}
      style={{ color: colorValue }}
      {...props}
    />
  );
};

// Convenience exports for common patterns
export const PlayIcon = () => <Icon name="play" color="primary" />;
export const PauseIcon = () => <Icon name="pause" color="secondary" />;
export const EditIcon = () => <Icon name="edit" size="sm" color="secondary" />;
export const DeleteIcon = () => <Icon name="delete" size="sm" color="error" />;
export const AddIcon = () => <Icon name="plus" color="primary" />;
export const CalendarIcon = () => <Icon name="calendar" color="navy" />;
export const ClockIcon = () => <Icon name="clock" color="secondary" />;
export const TeamIcon = () => <Icon name="users" color="navy" />;
export const SettingsIcon = () => <Icon name="settings" color="secondary" />;

export default Icon;
