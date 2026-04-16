import Link from "next/link";

export default function LaunchDemoButton() {
  return (
    <Link className="button" href="/builder">
      Launch prototype demo
    </Link>
  );
}
