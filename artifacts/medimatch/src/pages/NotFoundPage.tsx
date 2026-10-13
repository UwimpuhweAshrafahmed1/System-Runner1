import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { SiteShell, Tag } from "@/components/site/SiteShell";

export default function NotFoundPage() {
  return (
    <SiteShell product="hub">
      <section className="not-found page-pad">
        <Tag tone="accent">404</Tag>
        <h1>
          That page wandered
          <br />
          <em>off the path.</em>
        </h1>
        <p>Return to MediMATCH home to choose a care next step.</p>
        <Link href="/" className="btn btn--dark">
          Back to MediMATCH <ArrowRight size={16} />
        </Link>
      </section>
    </SiteShell>
  );
}
