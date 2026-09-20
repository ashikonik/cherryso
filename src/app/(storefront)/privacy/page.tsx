import { LegalPage } from "@/components/storefront/LegalPage";

export const metadata = {
  title: "Privacy Policy — CherrySo",
  description:
    "How CherrySo collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How we collect, use, and protect your personal information."
      lastUpdated="2026-09-20"
    >
      <p>
        <strong>TL;DR:</strong> We collect only what we need to ship your order,
        we never sell your data, and you can ask us to delete your account at
        any time.
      </p>

      <h2>1. Information we collect</h2>
      <p>When you place an order we collect:</p>
      <ul>
        <li>
          <strong>Contact details:</strong> name, phone number, email (if
          provided), and shipping address.
        </li>
        <li>
          <strong>Order details:</strong> the products you ordered, quantities,
          prices, and the shipping zone you selected.
        </li>
        <li>
          <strong>Account data (optional):</strong> if you register an account,
          we store your email and a hashed password. You can use checkout as a
          guest without an account.
        </li>
      </ul>
      <p>
        We also collect basic analytics (page views, referrer, device type) via
        Google Analytics 4 to understand which products are popular. You can
        opt out using a browser-level ad blocker or by enabling your browser's
        &quot;Do Not Track&quot; signal.
      </p>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To process and ship your order, and contact you about delivery.</li>
        <li>
          To send transactional emails (order confirmation, shipping updates)
          and &mdash; only with your consent &mdash; marketing emails you can
          unsubscribe from at any time.
        </li>
        <li>
          To prevent fraud and abuse (e.g., blocking repeated failed orders or
          fake reviews).
        </li>
        <li>
          To comply with legal obligations (e.g., tax records in Bangladesh).
        </li>
      </ul>

      <h2>3. Payment information</h2>
      <p>
        We support Cash on Delivery (no payment data collected) and direct
        mobile money transfers (bKash, Nagad, Rocket). For mobile money
        transfers we collect only the <strong>transaction ID</strong> and the{" "}
        <strong>sender phone number</strong> you provide &mdash; we never see
        or store your account PIN or balance.
      </p>

      <h2>4. Who we share data with</h2>
      <p>We share the minimum data necessary with:</p>
      <ul>
        <li>
          <strong>Courier partners</strong> (e.g., Steadfast, Pathao, RedX) for
          order delivery &mdash; they receive your name, phone, and address.
        </li>
        <li>
          <strong>Supabase</strong> (our database and file-storage provider,
          hosted on AWS) for data persistence.
        </li>
        <li>
          <strong>Netlify</strong> (our hosting provider) for serving the site.
        </li>
      </ul>
      <p>
        We <strong>never sell</strong> your personal data to third parties, and
        we do not run third-party advertising trackers.
      </p>

      <h2>5. Cookies and local storage</h2>
      <p>
        We use browser <code>localStorage</code> to remember your shopping cart
        between visits. We do not use tracking cookies or third-party cookies.
        Clearing your browser data will clear your local cart.
      </p>

      <h2>6. Data retention</h2>
      <p>
        Order records are retained for at least 5 years as required by
        Bangladeshi tax law. Account data is retained until you delete your
        account. Analytics data is retained for 14 months (Google Analytics
        default).
      </p>

      <h2>7. Your rights</h2>
      <p>You can request at any time:</p>
      <ul>
        <li>A copy of the personal data we hold about you.</li>
        <li>Correction of inaccurate data.</li>
        <li>Deletion of your account and associated data (subject to the retention rules above).</li>
      </ul>
      <p>
        Contact us at <a href="mailto:privacy@cherryso.com">privacy@cherryso.com</a>{" "}
        to exercise these rights. We respond within 30 days.
      </p>

      <h2>8. Security</h2>
      <p>
        We use HTTPS for all traffic, hash passwords with bcrypt, and restrict
        admin access behind role-based checks. No system is perfectly secure,
        but we follow industry best practices to protect your data.
      </p>

      <h2>9. Children</h2>
      <p>
        CherrySo does not knowingly collect data from children under 13. If you
        believe a child has registered, contact us and we will delete the
        account.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We will post any material changes here and update the &quot;Last
        updated&quot; date above. Continued use of CherrySo after a change
        constitutes acceptance of the updated policy.
      </p>

      <p className="text-sm text-muted-foreground italic">
        This is a template privacy policy suitable for a small e-commerce site
        operating in Bangladesh. <strong>Please have it reviewed by a qualified
        legal professional before relying on it for compliance.</strong>
      </p>
    </LegalPage>
  );
}
