import LegalLayout, { Section, List } from '../../components/LegalLayout.jsx';
import { LEGAL } from '../../config.js';

export default function Privacy() {
  const who = LEGAL.operator
    ? `${LEGAL.brand} (operated by ${LEGAL.operator}${LEGAL.regNumber ? `, company number ${LEGAL.regNumber}` : ''})`
    : LEGAL.brand;

  return (
    <LegalLayout
      title="Privacy Policy"
      intro={`This policy explains what personal information ${LEGAL.brand} collects through this website and our client portal, why we collect it, and the choices you have.`}
    >
      <Section title="1. Who we are">
        <p>
          {who} provides private study, relocation and settlement guidance between Nigeria and the
          UK. We decide how your personal information is used, so we are the &quot;controller&quot; under the
          Nigeria Data Protection Act 2023 (NDPA) and, where it applies, the UK GDPR.
        </p>
        <p>
          Privacy questions: {LEGAL.privacyEmail}. {LEGAL.address}.
        </p>
      </Section>

      <Section title="2. What we collect">
        <List
          items={[
            'Enquiry details you enter on our form: name, phone or WhatsApp number, email, course and level, preferred intake, budget, current status, whether you have had a visa refusal or travelled to the UK before, the services you want, and any message.',
            'Account details if you become a client: name, email, phone and an encrypted (hashed) password.',
            'Client records: your journey checklist, notes from your adviser, and documents you or we upload, such as passport pages, transcripts, certificates, offer letters and bank statements.',
            'Records of our conversations on WhatsApp, email and calls where they relate to your service.',
            'Security and technical data: your IP address, sign-in activity, and a log of who opened client documents.',
            'Payment records (amount, date and reference) when you pay us. We do not store card numbers.',
          ]}
        />
      </Section>

      <Section title="3. How and why we use it">
        <List
          items={[
            'To reply to your enquiry and offer a free profile review. Basis: your consent (the box you tick on the form) and steps you ask us to take before a contract.',
            'To provide the service you buy, including preparing applications and supporting documents. Basis: our contract with you.',
            'To keep the site and portal secure, prevent fraud and spam, and keep an audit trail. Basis: our legitimate interests.',
            'To meet legal duties, such as record-keeping and responding to lawful requests. Basis: legal obligation.',
            'To send you updates about your service. If we ever send marketing, we will ask you separately and you can opt out at any time.',
          ]}
        />
        <p>We do not sell your information, and we do not make automated decisions about you.</p>
      </Section>

      <Section title="4. Who we share it with">
        <List
          items={[
            'Service providers who run our systems for us under contract: database hosting (such as MongoDB), document storage (such as Cloudinary), email delivery (such as Resend) and website hosting.',
            'Universities, immigration or visa authorities and other organisations, only when you ask us to submit or discuss something on your behalf.',
            'Professional advisers, for example regulated immigration advisers or lawyers, where needed to help you and normally with your agreement.',
            'Authorities or courts, where the law requires it.',
          ]}
        />
      </Section>

      <Section title="5. Where your data is processed">
        <p>
          We work between Nigeria and the UK, and our providers may process data in other
          countries, including the United States and the European Economic Area. Where data leaves
          Nigeria or the UK, we rely on safeguards the law allows, such as contractual protections
          with our providers.
        </p>
      </Section>

      <Section title="6. How long we keep it">
        <List
          items={[
            'Enquiries that do not become clients: up to 12 months, then deleted.',
            'Client records and documents: while we work with you and for up to 12 months after your service ends, unless the law requires us to keep something longer (for example accounting records).',
            'Sign-in and activity logs: up to 2 years.',
            'You can ask us to delete your information sooner and we will, unless we must keep it by law.',
          ]}
        />
      </Section>

      <Section title="7. Your rights">
        <p>You can ask us to:</p>
        <List
          items={[
            'give you a copy of your information,',
            'correct anything that is wrong,',
            'delete your information,',
            'restrict or stop certain uses, and give you your information in a portable format,',
            'withdraw your consent at any time (this does not affect what we did before).',
          ]}
        />
        <p>
          Email {LEGAL.privacyEmail}. We may ask you to confirm your identity, and we will reply
          within 30 days. If you are unhappy with how we handle your data, you can complain to the
          Nigeria Data Protection Commission or, if you are in the UK, the Information
          Commissioner&apos;s Office. We would appreciate the chance to put things right first.
        </p>
      </Section>

      <Section title="8. Keeping your data safe">
        <p>
          We use encrypted connections, hashed passwords, access limited to our team, short-lived
          secure links for documents, and an audit log of document access. No system is perfectly
          secure, so please protect your password and tell us straight away if you suspect misuse.
          Never send us your card PIN or online banking login.
        </p>
      </Section>

      <Section title="9. Cookies and browser storage">
        <p>
          This website does not use advertising or analytics cookies at present. It uses your
          browser&apos;s storage only to keep you signed in to the client portal or staff area. If we add
          analytics or similar tools, we will update this page and ask for your consent where the
          law requires it.
        </p>
      </Section>

      <Section title="10. Under 18s">
        <p>
          Our service is for adults. If you are under 18, a parent or guardian should contact us
          and agree to your enquiry.
        </p>
      </Section>

      <Section title="11. Changes">
        <p>
          We may update this policy and will change the date above when we do. If a change is
          significant, we will tell our clients directly.
        </p>
      </Section>
    </LegalLayout>
  );
}