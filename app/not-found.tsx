import Link from "next/link";

export default function NotFound() {
  return <main id="main" className="wrap section-space not-found"><p className="eyebrow">THIS PAGE TOOK A WRONG TURN</p><h1>Let’s find your<br />next <em>conversation.</em></h1><p>The page you’re looking for isn’t here.</p><Link className="button button-blue" href="/#episodes">Explore the episodes</Link></main>;
}
