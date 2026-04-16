type BadgeProps = {
  text: string;
  strong?: boolean;
};

export default function Badge({ text, strong = false }: BadgeProps) {
  return <span className={`badge${strong ? " badge-strong" : ""}`}>{text}</span>;
}
