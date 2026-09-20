import { LegalPage } from "@/components/storefront/LegalPage";

export const metadata = {
  title: "Contact Us — CherrySo",
  description: "Get in touch with CherrySo. Phone, email, address, and hours.",
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact Us"
      description="We'd love to hear from you. Here's how to reach us."
      lastUpdated="2026-09-20"
    >
      <div className="not-prose grid gap-6 md:grid-cols-2 mb-8">
        <ContactCard
          title="Customer support"
          email="hello@cherryso.com"
          phone="+880 1XXX-XXXXXX"
          hours="Sat&ndash;Thu, 10am&ndash;8pm BST"
        />
        <ContactCard
          title="Order issues"
          email="orders@cherryso.com"
          phone="+880 1XXX-XXXXXX"
          hours="Same-day response during business hours"
        />
        <ContactCard
          title="Returns &amp; refunds"
          email="returns@cherryso.com"
          phone={null}
          hours="Replies within 1 business day"
        />
        <ContactCard
          title="Wholesale &amp; press"
          email="wholesale@cherryso.com"
          phone={null}
          hours="Replies within 3 business days"
        />
      </div>

      <h2>Office address</h2>
      <address>
        CherrySo
        <br />
        [Street address line 1]
        <br />
        [Street address line 2]
        <br />
        Dhaka, [Postal code]
        <br />
        Bangladesh
      </address>

      <p className="text-sm text-muted-foreground italic">
        We don&apos;t currently accept walk-in customers at our office. For
        order pickups or returns, please coordinate by email first.
      </p>

      <h2>Response times</h2>
      <ul>
        <li>
          <strong>Order issues</strong> (e.g., wrong item, missing item):
          within 4 hours during business hours.
        </li>
        <li>
          <strong>General questions</strong>: within 1 business day.
        </li>
        <li>
          <strong>Returns</strong>: within 1 business day.
        </li>
      </ul>

      <h2>Social</h2>
      <ul>
        <li>
          Facebook:{" "}
          <a
            href="https://facebook.com/cherryso"
            target="_blank"
            rel="noopener noreferrer"
          >
            facebook.com/cherryso
          </a>
        </li>
        <li>
          Instagram:{" "}
          <a
            href="https://instagram.com/cherryso"
            target="_blank"
            rel="noopener noreferrer"
          >
            @cherryso
          </a>
        </li>
      </ul>

      <h2>Before you email</h2>
      <p>To help us reply faster, please include:</p>
      <ul>
        <li>Your <strong>order number</strong> (format: <code>ORD-XXXXXXXX</code>) if your question is about a specific order.</li>
        <li>The <strong>email</strong> or <strong>phone number</strong> you used at checkout.</li>
        <li>A <strong>photo</strong> if reporting a damaged or wrong item.</li>
      </ul>
    </LegalPage>
  );
}

function ContactCard({
  title,
  email,
  phone,
  hours,
}: {
  title: string;
  email: string;
  phone: string | null;
  hours: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold mb-3 text-base">{title}</h3>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            Email
          </dt>
          <dd>
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>
          </dd>
        </div>
        {phone && (
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
              Phone
            </dt>
            <dd>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:underline">
                {phone}
              </a>
            </dd>
          </div>
        )}
        <div>
          <dt className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            Hours
          </dt>
          <dd
            className="text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: hours }}
          />
        </div>
      </dl>
    </div>
  );
}
