export interface FlagProps {
  isoCode: string;
  size?: number;
  className?: string;
}

export function Flag({ isoCode, size = 24, className }: FlagProps) {
  return (
    <img
      src={`https://flagcdn.com/${isoCode.toLowerCase()}.svg`}
      width={size}
      height={size}
      alt={isoCode.toUpperCase()}
      className={`rounded-sm object-cover${className ? ` ${className}` : ''}`}
      loading="lazy"
    />
  );
}
