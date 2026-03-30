import Link from "next/link";

type Props = { href?: string; className?: string; small?: boolean };

export function SynloLogo({ href = "/", className = "", small }: Props) {
  return (
    <Link
      href={href}
      className={`nav-logo ${small ? "nav-logo-sm" : ""} ${className}`.trim()}
    >
      Synlo<span aria-hidden />
    </Link>
  );
}
