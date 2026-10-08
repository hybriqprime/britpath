import LegalLayout, { Section, List } from '../../components/LegalLayout.jsx';
import { LEGAL } from '../../config.js';

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro={`These terms apply when you use this website or the services of ${LEGAL.brand}. If you do not agree with them, please do not use the site or our services.`}
    >
      <Section title="1. About our service">
        <p>
          {LEGAL.brand} offers private guidance on UK study, relocation and settlement. We provide
          guidance, document-preparation support and administrative help as described in your
          package. We are not a law firm and we do not give regulated immigration advice (see our
          Advice Disclaimer). We will use reasonable skill and care in the work we do.
        </p>
      </Section>

      <Section title="2. The free profile review">
        <p>
          Submitting the enquiry form or taking the free profile review creates no obligation for
          you or for us. A contract begins only when you accept a package and fee in writing (for
          example by WhatsApp or email) and we confirm it.
        </p>
      </Section>

      <Section title="3. Fees and payment">
        <List
          items={[
            'Our fees are those agreed with you in writing before work starts.',
            'Fees paid for services we have not yet started may be refunded as set out in your agreement. Fees for work already carried out are not refundable.',
            'Third-party costs, such as application fees, visa fees, the immigration health surcharge, university deposits, flights and accommodation, are paid to those third parties and are not refundable by us.',
            'Please pay official fees only through official websites, and pay our fees only to the account details we confirm in writing.',
          ]}
        />
      </Section>

      <Section title="4. What you agree to do">
        <List
          items={[
            'Give us accurate, complete and truthful information.',
            'Provide only genuine documents. We will never create, alter or misrepresent documents or funds, and we will refuse to. We may stop work, and report it where the law requires, if asked to.',
            'Reply promptly and meet the deadlines we agree.',
            'Keep your portal password private and not share your account.',
            'Pay agreed fees on time.',
          ]}
        />
      </Section>

      <Section title="5. No guarantees">
        <p>
          Admission, scholarships, visas, jobs and travel dates depend on universities, UK
          authorities and other third parties, and rules change. We cannot and do not promise any
          result. We are not responsible for decisions made by others.
        </p>
      </Section>

      <Section title="6. Your portal account">
        <p>
          Your account is personal to you. We may suspend or close an account for misuse, for
          breaking these terms, or for non-payment. Documents you upload stay yours, and you allow
          us to use them only to provide your service.
        </p>
      </Section>

      <Section title="7. Our responsibility to you">
        <p>
          Nothing in these terms limits liability that cannot be limited by law, including for fraud
          or for death or personal injury caused by negligence, or your legal rights as a consumer.
          Subject to that, we are not liable for indirect or consequential losses, for losses caused
          by wrong or incomplete information you gave us, or for decisions made by third parties.
          Our total liability for any claim about a service is limited to the fees you paid us for
          that service.
        </p>
      </Section>

      <Section title="8. Ending our work">
        <p>
          You may stop at any time by telling us in writing, and fees for work already done remain
          payable. We may stop if you break these terms or ask us to do something unlawful, and we
          will explain why.
        </p>
      </Section>

      {LEGAL.governingLaw && (
        <Section title="9. Governing law">
          <p>These terms are governed by {LEGAL.governingLaw}.</p>
        </Section>
      )}

      <Section title={LEGAL.governingLaw ? '10. Changes and contact' : '9. Changes and contact'}>
        <p>
          We may update these terms. The version in force on the day you accepted your package
          applies to that package. Questions: {LEGAL.privacyEmail}.
        </p>
      </Section>
    </LegalLayout>
  );
}