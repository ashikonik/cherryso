import { LegalPage } from "@/components/storefront/LegalPage";

export const metadata = {
  title: "Terms & Conditions — CherrySo",
  description:
    "The terms that govern your use of CherrySo and purchases from our store.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="The rules that govern your use of CherrySo and purchases from our store."
      lastUpdated="2026-09-20"
    >
      <p>
        By using CherrySo (the &quot;Site&quot;) or placing an order, you agree
        to these Terms. If you do not agree, please do not use the Site.
      </p>

      <h2>1. About us</h2>
      <p>
        CherrySo is a small online retailer of cute accessories, gifts, and
        stationery, operating from Bangladesh and shipping nationwide.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old (or have a parent/guardian&apos;s
        consent) to place an order. By ordering, you represent that the billing
        and shipping information you provide is accurate and that you are
        authorised to use the chosen payment method.
      </p>

      <h2>3. Orders and acceptance</h2>
      <p>
        Placing an order is an <strong>offer</strong> to buy, not a binding
        contract. We reserve the right to refuse or cancel any order, including
        (but not limited to) cases of suspected fraud, pricing errors, or
        stock unavailability. If we cancel an order after payment, we will
        refund you in full within 7 business days.
      </p>

      <h2>4. Pricing</h2>
      <p>
        All prices are listed in Bangladeshi Taka (BDT) and include VAT where
        applicable. Shipping costs are calculated at checkout based on your
        shipping zone. We reserve the right to correct pricing errors at any
        time; if an order you placed was incorrectly priced, we will notify you
        and give you the option to proceed or cancel.
      </p>

      <h2>5. Payment</h2>
      <p>We accept:</p>
      <ul>
        <li>
          <strong>Cash on Delivery (COD):</strong> pay in cash when your order
          is delivered.
        </li>
        <li>
          <strong>Mobile money transfers</strong> (bKash, Nagad, Rocket): pay to
          the merchant number shown at checkout, then enter the transaction ID
          on the order form.
        </li>
      </ul>
      <p>
        For mobile money orders, your order is <strong>pending</strong> until
        we verify the transaction with our payment provider. We aim to verify
        within 4 hours during business hours.
      </p>

      <h2>6. Shipping</h2>
      <p>
        We ship across Bangladesh via third-party couriers. Delivery typically
        takes 1&ndash;3 business days inside Dhaka and 2&ndash;5 business days
        outside Dhaka. Delivery times are estimates, not guarantees. Risk of
        loss passes to you when the courier hands the package over.
      </p>

      <h2>7. Returns and refunds</h2>
      <p>
        See our full <a href="/returns">Refund &amp; Return Policy</a>. In
        short: unopened items can be returned within 7 days of delivery for a
        full refund. Damaged or wrong items are replaced at our cost.
      </p>

      <h2>8. Product information</h2>
      <p>
        We try to display colours and product details accurately, but screen
        settings vary. Minor differences between the photo and the actual
        product are not defects. Sizing information is provided on each
        product page; please check before ordering.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        CherrySo and our logo are our trademarks. The character designs shown
        on this site (Hello Kitty, My Melody, Cinnamoroll, Kuromi, etc.) are
        trademarks of Sanrio Co., Ltd.; we sell inspired accessories, not
        licensed merchandise.
      </p>

      <h2>10. User conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Site for any unlawful purpose.</li>
        <li>
          Place fraudulent orders or orders using someone else&apos;s identity.
        </li>
        <li>
          Interfere with the Site (e.g., by automated scraping at a rate that
          impacts other users).
        </li>
        <li>Post false reviews or impersonate other customers.</li>
      </ul>

      <h2>11. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by Bangladeshi law, CherrySo&apos;s
        total liability for any claim arising from your use of the Site or any
        order is limited to the amount you paid for that order. We are not
        liable for indirect, incidental, or consequential damages.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These Terms are governed by the laws of Bangladesh. Any disputes will
        be resolved in the courts of Dhaka.
      </p>

      <h2>13. Changes</h2>
      <p>
        We may update these Terms from time to time. The &quot;Last
        updated&quot; date above will reflect the most recent change.
        Material changes will be communicated by email where we have your
        address on file.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions? Email <a href="mailto:hello@cherryso.com">hello@cherryso.com</a>{" "}
        or see our <a href="/contact">Contact page</a>.
      </p>

      <p className="text-sm text-muted-foreground italic">
        This is a template terms-of-service document.{" "}
        <strong>Please have it reviewed by a qualified legal professional
        before relying on it for compliance.</strong>
      </p>
    </LegalPage>
  );
}
