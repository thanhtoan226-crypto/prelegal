import { NDAFormData } from "./types";

function md(str: string): string {
  return str.replace(/([\\`*_{|}#<>])/g, "\\$1");
}

export function generateCoverPage(data: NDAFormData): string {
  const mndaTermLine =
    data.mndaTermType === "expires"
      ? `- [x] Expires ${data.mndaTermYears} year(s) from Effective Date.\n- [ ] Continues until terminated in accordance with the terms of the MNDA.`
      : `- [ ] Expires ${data.mndaTermYears} year(s) from Effective Date.\n- [x] Continues until terminated in accordance with the terms of the MNDA.`;

  const confTermLine =
    data.confidentialityTermType === "expires"
      ? `- [x] ${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.\n- [ ] In perpetuity.`
      : `- [ ] ${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.\n- [x] In perpetuity.`;

  const modifications = data.modifications.trim()
    ? data.modifications
    : "None.";

  return `# Mutual Non-Disclosure Agreement

## USING THIS MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page ("**Cover Page**") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 ("**Standard Terms**") identical to those posted at [commonpaper.com/standards/mutual-nda/1.0](https://commonpaper.com/standards/mutual-nda/1.0). Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.

### Purpose
${md(data.purpose)}

### Effective Date
${md(data.effectiveDate)}

### MNDA Term
${mndaTermLine}

### Term of Confidentiality
${confTermLine}

### Governing Law & Jurisdiction
Governing Law: ${md(data.governingLaw || "[Not specified]")}

Jurisdiction: ${md(data.jurisdiction || "[Not specified]")}

### MNDA Modifications
${modifications}

By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.

| Field | PARTY 1 | PARTY 2 |
|:--- | :---: | :---: |
| Print Name | ${md(data.party1.printName || "—")} | ${md(data.party2.printName || "—")} |
| Title | ${md(data.party1.title || "—")} | ${md(data.party2.title || "—")} |
| Company | ${md(data.party1.company || "—")} | ${md(data.party2.company || "—")} |
| Notice Address | ${md(data.party1.noticeAddress || "—")} | ${md(data.party2.noticeAddress || "—")} |
| Date | ${md(data.party1.date || "—")} | ${md(data.party2.date || "—")} |

Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).`;
}

export function generateStandardTerms(data: NDAFormData): string {
  const purpose = md(data.purpose);
  const govLaw = md(data.governingLaw || "[Not specified]");
  const juris = md(data.jurisdiction || "[Not specified]");
  const effDate = md(data.effectiveDate);

  return `# Standard Terms

1. **Introduction**. This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("**MNDA**") allows each party ("**Disclosing Party**") to disclose or make available information in connection with the ${purpose} which (1) the Disclosing Party identifies to the receiving party ("**Receiving Party**") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("**Confidential Information**"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("**Cover Page**"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.

2. **Use and Protection of Confidential Information**. The Receiving Party shall: (a) use Confidential Information solely for the ${purpose}; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the ${purpose}, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.

3. **Exceptions**. The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.

4. **Disclosures Required by Law**. The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.

5. **Term and Termination**. This MNDA commences on the ${effDate} and expires at the end of the ${data.mndaTermType === "expires" ? `${data.mndaTermYears} year(s)` : "term as specified"}. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the ${data.confidentialityTermType === "expires" ? `${data.confidentialityTermYears} year(s) from Effective Date` : "period of perpetuity"}, despite any expiration or termination of this MNDA.

6. **Return or Destruction of Confidential Information**. Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.

7. **Proprietary Rights**. The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.

8. **Disclaimer**. ALL CONFIDENTENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

9. **Governing Law and Jurisdiction**. This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of ${govLaw}, without regard to the conflict of laws provisions of such ${govLaw}. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in ${juris}. Each party irrevocably submits to the exclusive jurisdiction of such ${juris} in any such suit, action, or proceeding.

10. **Equitable Relief**. A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.

11. **General**. Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.

Common Paper Mutual Non-Disclosure Agreement [Version 1.0](https://commonpaper.com/standards/mutual-nda/1.0/) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).`;
}

export function generateFullDocument(data: NDAFormData): string {
  return generateCoverPage(data) + "\n\n---\n\n" + generateStandardTerms(data);
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generatePdfHtml(data: NDAFormData): string {
  const mndaTerm =
    data.mndaTermType === "expires"
      ? `&#9745; Expires ${escHtml(data.mndaTermYears)} year(s) from Effective Date.<br/>&#9744; Continues until terminated in accordance with the terms of the MNDA.`
      : `&#9744; Expires ${escHtml(data.mndaTermYears)} year(s) from Effective Date.<br/>&#9745; Continues until terminated in accordance with the terms of the MNDA.`;

  const confTerm =
    data.confidentialityTermType === "expires"
      ? `&#9745; ${escHtml(data.confidentialityTermYears)} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.<br/>&#9744; In perpetuity.`
      : `&#9744; ${escHtml(data.confidentialityTermYears)} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.<br/>&#9745; In perpetuity.`;

  const govLaw = escHtml(data.governingLaw || "[Not specified]");
  const juris = escHtml(data.jurisdiction || "[Not specified]");
  const purpose = escHtml(data.purpose);
  const effDate = escHtml(data.effectiveDate);
  const modifications = escHtml(data.modifications.trim() || "None.");
  const p1 = data.party1;
  const p2 = data.party2;
  const d = (v: string) => escHtml(v || "—");

  return `<div style="font-family: Georgia, 'Times New Roman', serif; color: #111; line-height: 1.6; font-size: 11pt; max-width: 170mm;">

<h1 style="font-size: 18pt; margin-bottom: 12px;">Mutual Non-Disclosure Agreement</h1>

<h2 style="font-size: 14pt; margin-top: 20px; margin-bottom: 8px;">USING THIS MUTUAL NON-DISCLOSURE AGREEMENT</h2>

<p>This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page ("<strong>Cover Page</strong>") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 ("<strong>Standard Terms</strong>") identical to those posted at <a href="https://commonpaper.com/standards/mutual-nda/1.0" style="color: #4f46e5;">commonpaper.com/standards/mutual-nda/1.0</a>. Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.</p>

<h3 style="font-size: 12pt; margin-top: 16px; margin-bottom: 4px;">Purpose</h3>
<p>${purpose}</p>

<h3 style="font-size: 12pt; margin-top: 16px; margin-bottom: 4px;">Effective Date</h3>
<p>${effDate}</p>

<h3 style="font-size: 12pt; margin-top: 16px; margin-bottom: 4px;">MNDA Term</h3>
<p>${mndaTerm}</p>

<h3 style="font-size: 12pt; margin-top: 16px; margin-bottom: 4px;">Term of Confidentiality</h3>
<p>${confTerm}</p>

<h3 style="font-size: 12pt; margin-top: 16px; margin-bottom: 4px;">Governing Law &amp; Jurisdiction</h3>
<p>Governing Law: ${govLaw}</p>
<p>Jurisdiction: ${juris}</p>

<h3 style="font-size: 12pt; margin-top: 16px; margin-bottom: 4px;">MNDA Modifications</h3>
<p>${modifications}</p>

<p>By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 10pt;">
  <thead>
    <tr style="background: #f3f4f6;">
      <th style="border: 1px solid #d1d5db; padding: 6px; text-align: left;">Field</th>
      <th style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">PARTY 1</th>
      <th style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">PARTY 2</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #d1d5db; padding: 6px;">Print Name</td><td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${d(p1.printName)}</td><td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${d(p2.printName)}</td></tr>
    <tr><td style="border: 1px solid #d1d5db; padding: 6px;">Title</td><td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${d(p1.title)}</td><td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${d(p2.title)}</td></tr>
    <tr><td style="border: 1px solid #d1d5db; padding: 6px;">Company</td><td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${d(p1.company)}</td><td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${d(p2.company)}</td></tr>
    <tr><td style="border: 1px solid #d1d5db; padding: 6px;">Notice Address</td><td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${d(p1.noticeAddress)}</td><td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${d(p2.noticeAddress)}</td></tr>
    <tr><td style="border: 1px solid #d1d5db; padding: 6px;">Date</td><td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${d(p1.date)}</td><td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${d(p2.date)}</td></tr>
  </tbody>
</table>

<p style="font-size: 9pt; color: #6b7280; margin-top: 16px;">Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under <a href="https://creativecommons.org/licenses/by/4.0/" style="color: #4f46e5;">CC BY 4.0</a>.</p>

<hr style="border: none; border-top: 1px solid #d1d5db; margin: 24px 0;"/>

<h1 style="font-size: 18pt; margin-bottom: 12px;">Standard Terms</h1>

<p><strong>1. Introduction</strong>. This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("<strong>MNDA</strong>") allows each party ("<strong>Disclosing Party</strong>") to disclose or make available information in connection with the ${purpose} which (1) the Disclosing Party identifies to the receiving party ("<strong>Receiving Party</strong>") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("<strong>Confidential Information</strong>"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("<strong>Cover Page</strong>"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.</p>

<p><strong>2. Use and Protection of Confidential Information</strong>. The Receiving Party shall: (a) use Confidential Information solely for the ${purpose}; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the ${purpose}, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.</p>

<p><strong>3. Exceptions</strong>. The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.</p>

<p><strong>4. Disclosures Required by Law</strong>. The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.</p>

<p><strong>5. Term and Termination</strong>. This MNDA commences on the ${effDate} and expires at the end of the ${data.mndaTermType === "expires" ? `${escHtml(data.mndaTermYears)} year(s)` : "term as specified"}. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the ${data.confidentialityTermType === "expires" ? `${escHtml(data.confidentialityTermYears)} year(s) from Effective Date` : "period of perpetuity"}, despite any expiration or termination of this MNDA.</p>

<p><strong>6. Return or Destruction of Confidential Information</strong>. Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.</p>

<p><strong>7. Proprietary Rights</strong>. The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.</p>

<p><strong>8. Disclaimer</strong>. ALL CONFIDENTENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.</p>

<p><strong>9. Governing Law and Jurisdiction</strong>. This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of ${govLaw}, without regard to the conflict of laws provisions of such ${govLaw}. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in ${juris}. Each party irrevocably submits to the exclusive jurisdiction of such ${juris} in any such suit, action, or proceeding.</p>

<p><strong>10. Equitable Relief</strong>. A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.</p>

<p><strong>11. General</strong>. Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.</p>

<p style="font-size: 9pt; color: #6b7280; margin-top: 16px;">Common Paper Mutual Non-Disclosure Agreement <a href="https://commonpaper.com/standards/mutual-nda/1.0/" style="color: #4f46e5;">Version 1.0</a> free to use under <a href="https://creativecommons.org/licenses/by/4.0/" style="color: #4f46e5;">CC BY 4.0</a>.</p>

</div>`;
}
