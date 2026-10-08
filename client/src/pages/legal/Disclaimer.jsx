import LegalLayout, { Section, List } from '../../components/LegalLayout.jsx';
import { LEGAL } from '../../config.js';

export default function Disclaimer() {
  return (
    <LegalLayout
      title="Advice Disclaimer"
      intro={`Please read this so you know exactly what ${LEGAL.brand} does, and what it does not do.`}
    >
      <Section title="1. We are not a law firm">
        <p>
          {LEGAL.brand} gives general guidance and practical support about studying, relocating and
          settling in the UK. We are not a firm of solicitors and we do not give regulated
          immigration advice. Immigration advice in the UK may only be given by people authorised
          to do so, such as OISC-registered advisers, solicitors and barristers.
        </p>
        {LEGAL.regulatedAdviser ? (
          <p>
            Where regulated immigration advice is needed, we can refer you to: {LEGAL.regulatedAdviser}.
          </p>
        ) : (
          <p>
            If your case needs regulated immigration advice, we will tell you and suggest that you
            speak to an authorised adviser.
          </p>
        )}
      </Section>

      <Section title="2. Guidance, not guarantees">
        <p>
          We cannot guarantee admission to any university, a visa, a job or any other outcome.
          Those decisions belong to universities, UK authorities and other third parties. The rules
          change often, so information we give is general and may be out of date by the time you
          use it.
        </p>
      </Section>

      <Section title="3. No official status">
        <p>
          {LEGAL.brand} is a private company. We are not part of, or endorsed by, the UK
          Government, the Home Office, any university or the NHS. Use of the Union Jack, landmarks
          and similar imagery is for design only. We help you with processes such as NHS or bank
          registration, but we are not those organisations.
        </p>
      </Section>

      <Section title="4. Check official sources">
        <p>
          Before you rely on anything, check the official source, such as GOV.UK for visas and
          your university for admission requirements. You remain responsible for the accuracy of
          your own applications.
        </p>
      </Section>

      <Section title="5. Protect yourself from scams">
        <List
          items={[
            'Official visa and application fees are paid only on official websites, never to us or any agent by transfer.',
            'We never ask you to use forged documents or invented bank statements. Do not accept this from anyone.',
            'We confirm our bank details in writing before you pay. If in doubt, ask us on our known WhatsApp number first.',
          ]}
        />
      </Section>

      <Section title="6. Concerns">
        <p>If something does not look right, tell us at {LEGAL.privacyEmail} and we will look into it.</p>
      </Section>
    </LegalLayout>
  );
}