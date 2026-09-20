import { LegalPage } from "@/components/storefront/LegalPage";

export const metadata = {
  title: "Refund & Return Policy — CherrySo",
  description:
    "Our policy on returns, exchanges, and refunds for purchases from CherrySo.",
};

export default function ReturnsPage() {
  return (
    <LegalPage
      title="Refund & Return Policy"
      description="How returns, exchanges, and refunds work at CherrySo."
      lastUpdated="2026-09-20"
    >
      <h2>Overview</h2>
      <p>
        We want you to love what you ordered. If something isn&apos;t right,
        here&apos;s how to make it right.
      </p>

      <h2>1. 7-day return window</h2>
      <p>
        You can return most unopened, unused items within{" "}
        <strong>7 days of delivery</strong> for a full refund to the original
        payment method. Items must be in their original packaging with all
        tags attached.
      </p>

      <h2>2. Items we cannot accept back</h2>
      <ul>
        <li>Items that have been opened, used, or show signs of wear.</li>
        <li>
          Items returned more than 7 days after delivery (per courier tracking).
        </li>
        <li>
          Personalised or made-to-order items (e.g., custom-engraved
          accessories).
        </li>
        <li>Items marked as &quot;Final Sale&quot; on the product page.</li>
        <li>
          Items returned without original packaging or with missing accessories
          (e.g., a hair clip set with missing pieces).
        </li>
      </ul>

      <h2>3. Damaged, defective, or wrong items</h2>
      <p>
        If your order arrives damaged, defective, or with the wrong item, we
        will replace it at our cost &mdash; including return shipping. Email us
        at <a href="mailto:hello@cherryso.com">hello@cherryso.com</a> within
        48 hours of delivery with your order number and a photo. Do not ship
        the item back until we confirm the next step.
      </p>

      <h2>4. How to start a return</h2>
      <ol>
        <li>
          Email <a href="mailto:returns@cherryso.com">returns@cherryso.com</a>{" "}
          with your order number, the item(s) you want to return, and a brief
          reason.
        </li>
        <li>
          We&apos;ll send you a return authorisation and the return shipping
          address within 1 business day.
        </li>
        <li>
          Ship the item back within 5 days of receiving the authorisation. Use
          a trackable courier &mdash; we&apos;re not responsible for returns
          lost in transit.
        </li>
        <li>
          Once we receive and inspect the item, we&apos;ll process your refund
          within 5 business days.
        </li>
      </ol>

      <h2>5. Refund timing</h2>
      <p>
        For <strong>Cash on Delivery</strong> orders, refunds are sent via
        bKash/Nagad/Rocket to a Bangladesh mobile number you provide, or as
        store credit if you prefer. For <strong>prepaid</strong> orders, refunds
        are returned to the original payment method. Bank processing may take
        an additional 3&ndash;7 business days.
      </p>

      <h2>6. Exchanges</h2>
      <p>
        We don&apos;t do direct exchanges. If you want a different colour or
        size, return the original item for a refund (per the process above) and
        place a new order. This gets you the new item fastest.
      </p>

      <h2>7. Cancellations</h2>
      <p>
        You can cancel an order any time <strong>before it ships</strong>. Email
        us as soon as possible at{" "}
        <a href="mailto:hello@cherryso.com">hello@cherryso.com</a>. Once the
        order has shipped, you can refuse delivery (for COD) or follow the
        standard return process above.
      </p>

      <h2>8. Shipping costs</h2>
      <ul>
        <li>
          For <strong>change-of-mind returns</strong>, return shipping is at
          your cost (typically ৳80&ndash;৳120 inside Dhaka, ৳120&ndash;৳150
          outside Dhaka).
        </li>
        <li>
          For <strong>our error</strong> (damaged, defective, wrong item),
          we cover return shipping.
        </li>
      </ul>

      <h2>9. Order not received?</h2>
      <p>
        If your tracking shows delivered but you didn&apos;t receive the
        package, contact us within 48 hours. We&apos;ll work with the courier
        to investigate. If the package is confirmed lost, we&apos;ll send a
        replacement or issue a full refund at your choice.
      </p>

      <p className="text-sm text-muted-foreground italic">
        This is a template return/refund policy suitable for a small
        e-commerce business operating in Bangladesh.{" "}
        <strong>Please have it reviewed by a qualified legal professional
        before relying on it for compliance.</strong>
      </p>
    </LegalPage>
  );
}
