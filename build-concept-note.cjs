const docx = require("docx");
const fs = require("fs");
const {
  Document, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  Header, Footer, PageBreak, Indent
} = docx;

// ---- helpers ----
const hr = () => new Paragraph({
  spacing: { before: 100, after: 100 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
});

// Standard body paragraph: Arial 11pt, fully justified, first-line indent
const body = (text, opts = {}) => {
  const runOpts = { text, font: "Arial", size: 22 };
  if (opts.bold) runOpts.bold = true;
  if (opts.italics) runOpts.italics = true;
  if (opts.color) runOpts.color = opts.color;
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 80, line: 360 },
    indent: { firstLine: 440 },  // ~0.8cm first-line indent
    children: [new TextRun(runOpts)]
  });
};

// Body paragraph with no first-line indent (for use after headings, lists, tables)
const bodyNoIndent = (text, opts = {}) => {
  const runOpts = { text, font: "Arial", size: 22 };
  if (opts.bold) runOpts.bold = true;
  if (opts.italics) runOpts.italics = true;
  if (opts.color) runOpts.color = opts.color;
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 80, line: 360 },
    children: [new TextRun(runOpts)]
  });
};

// Bullet paragraph: fully justified, hanging indent
const bullet = (text) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { before: 40, after: 40, line: 360 },
  indent: { left: 720, hanging: 360 },
  children: [
    new TextRun({ text: "\u2022", font: "Arial", size: 22 }),
    new TextRun({ text: "  " + text, font: "Arial", size: 22 }),
  ]
});

// Numbered item: fully justified
const numberedItem = (num, text) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { before: 50, after: 50, line: 360 },
  indent: { left: 720 },
  children: [
    new TextRun({ text: num + ".  ", font: "Arial", size: 22, bold: true }),
    new TextRun({ text, font: "Arial", size: 22 }),
  ]
});

// Headings remain left-aligned (standard professional practice)
const heading1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 160 },
  children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: "1A3A5C" })]
});

const heading2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 120 },
  children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: "2E5F8A" })]
});

// Two-column table helper — table cells left-aligned (standard for data tables)
const twoColTable = (headerRow, dataRows) => {
  const allRows = [headerRow, ...dataRows];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [28, 72],
    rows: allRows.map(([left, right], i) => new TableRow({
      children: [
        new TableCell({
          width: { size: 28, type: WidthType.PERCENTAGE },
          shading: i === 0 ? { type: "clear", fill: "E8EEF4" } : undefined,
          children: [new Paragraph({
            spacing: { before: 55, after: 55 },
            children: [new TextRun({ text: left, font: "Arial", size: 22, bold: i === 0, italics: i !== 0 })]
          })]
        }),
        new TableCell({
          width: { size: 72, type: WidthType.PERCENTAGE },
          shading: i === 0 ? { type: "clear", fill: "E8EEF4" } : undefined,
          children: [new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 55, after: 55 },
            children: [new TextRun({ text: right, font: "Arial", size: 22, bold: i === 0 })]
          })]
        }),
      ]
    }))
  });
};

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },  // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text: "AI Wellness Initiative \u2014 Concept Paper for Singapore Red Cross", font: "Arial", size: 16, bold: true, color: "1A3A5C" })]
          }),
          hr(),
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          hr(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 0 },
            children: [
              new TextRun({ text: "Concept Paper \u2014 For senior management consideration  |  ", font: "Arial", size: 18, color: "888888" }),
              new TextRun({ text: "September 2026", font: "Arial", size: 18, color: "888888" }),
            ]
          }),
        ]
      })
    },
    children: [
      // Cover page
      new Paragraph({ spacing: { before: 1100, after: 200 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: "AI Wellness Initiative", font: "Arial", size: 44, bold: true, color: "1A3A5C" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "A proposed programme stream under the Mental Health pillar", font: "Arial", size: 22, italics: true, color: "555555" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Exploring AI literacy, digital resilience, and community well-being", font: "Arial", size: 22, color: "666666" })]
      }),
      new Paragraph({ spacing: { before: 400, after: 80 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "Concept Paper for Singapore Red Cross Senior Management", font: "Arial", size: 20, color: "444444" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "Requesting approval for a 6\u20138 week discovery and design phase", font: "Arial", size: 18, italics: true, color: "888888" })]
      }),

      // === Section 1: Executive Summary ===
      new Paragraph({ children: [new PageBreak()] }),
      heading1("1.  Executive Summary"),
      body("Artificial intelligence is moving from a back-office technology into everyday community life. AI chatbots, AI tutors, deepfakes, and agentic systems are increasingly part of how children learn, how families communicate, how young adults study and socialise, and how workers manage their time and attention."),
      body("For Singapore Red Cross, this creates both a challenge and an opportunity. The challenge is that AI is becoming a new source of stress, anxiety, and vulnerability in the communities the organisation serves \u2014 particularly among youth, families, and volunteers. The opportunity is that Singapore Red Cross is well placed to address it: trusted by the community, embedded in schools and youth networks, experienced in volunteer-led education, and anchored by a clear Mental Health mission."),
      body("The proposal recommends that Singapore Red Cross explore an **AI Wellness Initiative** as a new programme stream under the Mental Health pillar. The initiative would help communities build AI literacy, digital resilience, and healthy habits \u2014 not as a technology programme, but as a mental wellness and community education initiative."),
      body("Singapore Red Cross would not be positioned as a clinical authority on AI, a technical regulator, or a provider of diagnosis, counselling, or therapy. The initiative would provide education, literacy-building, resilience support, signposting, and preventive community education \u2014 delivered within clear clinical and safeguarding boundaries."),
      body("The document does not request approval to launch a full-scale programme. It requests approval for a **6\u20138 week discovery and design phase** during which Singapore Red Cross would validate need, map partners, assess governance requirements, estimate resourcing, and develop a scoped pilot proposal for senior management review."),

      // === Section 2: Strategic Rationale ===
      new Paragraph({ children: [new PageBreak()] }),
      heading1("2.  Strategic Rationale"),

      heading2("2a. AI is becoming a community well-being issue"),
      body("Generative and agentic AI are no longer specialist technologies. They are embedded in the tools that children use for homework, young adults use for study and social connection, parents encounter in children's apps and devices, and workers use for productivity and communication. This ubiquity creates new pressures on mental health and community resilience."),
      body("The risks are present and growing:"),
      bullet("Youth and children are interacting with AI chatbots, AI-generated content, and AI-mediated social environments before they have the critical thinking skills to evaluate what they encounter. Risks include emotional attachment to AI companions, exposure to deepfakes and manipulated media, distorted self-image from AI-curated content, and AI-enabled grooming or manipulation."),
      bullet("Parents and caregivers are frequently less AI-literate than their children. In homes where AI tutors, AI companions, and AI-driven apps are normalised, parents lack the knowledge and confidence to set healthy boundaries or guide meaningful conversations about what their children are experiencing."),
      bullet("Young adults lean on AI for study, work, and emotional support \u2014 creating dependence while bypassing critical judgment. The risk extends beyond academic or professional outcomes to the gradual atrophy of independent thinking and emotional self-reliance."),
      bullet("Volunteers themselves need AI literacy to support beneficiaries navigating AI-shaped stressors. Without this capability, volunteers may miss signals of AI-related distress or lack the tools to guide conversations effectively."),
      body("These are present-day community issues. They fall within the scope of a mental wellness and community resilience organisation."),

      heading2("2b. Why existing approaches are insufficient"),
      body("Singapore's established cyber wellness programmes cover screen time, cyberbullying, safe sharing, and responsible digital citizenship. These foundations are important and must continue. But they were designed for an internet built on human-generated content, not for AI systems that create content, mediate relationships, and act on people's behalf."),
      body("Generative and agentic AI introduce new categories of risk that traditional programmes do not address: AI-generated misinformation that is plausible but false; emotional dependence on AI companions that mimic empathy; automation bias that erodes independent judgment; AI-curated social environments that distort identity formation; and deepfake media that undermines shared reality."),
      body("Addressing these risks requires a programme that understands both the technology and its psychological impact, that builds resilience as well as knowledge, and that operates through trusted community channels."),

      heading2("2c. Why Singapore Red Cross"),
      body("Singapore Red Cross is not a technology organisation. That is precisely why it is well suited to explore this initiative. When the subject is mental health, community education, and youth resilience, the messenger matters as much as the message."),
      body("The proposal does not suggest that Singapore Red Cross should immediately lead the national agenda on AI and mental wellness. It suggests that the organisation is well positioned to explore whether this is a meaningful new direction for its Mental Health pillar, and to develop a rigorous, evidence-based pilot before committing to scale."),

      // === Section 3: Why This Fits ===
      heading1("3.  Why This Fits Singapore Red Cross"),
      new Paragraph({ spacing: { before: 60, after: 60 } }),
      twoColTable(
        ["Dimension", "Relevance to Singapore Red Cross"],
        [
          ["Mission alignment", "AI wellness is a community well-being issue that fits within the Mental Health pillar and the organisation's preventive health orientation."],
          ["Audience overlap", "The programme serves the same populations that Singapore Red Cross already engages \u2014 youth, families, volunteers, and community members."],
          ["Existing channels", "Established relationships with schools, community partners, and volunteer networks reduce the cost and complexity of programme delivery."],
          ["Community trust", "As an established humanitarian organisation, Singapore Red Cross carries credibility in mental health and community education that technology and academic institutions do not."],
          ["Differentiation", "Positions Singapore Red Cross as a forward-looking, preventive mental wellness organisation \u2014 relevant to a generation that lives in an AI-shaped world."],
          ["Scalability", "A validated pilot model can be refined and, if warranted, extended to additional audiences or adapted for regional partners."],
        ]
      ),
      bodyNoIndent("The key word is **explore**. Singapore Red Cross is invited to assess whether this initiative fits the organisation's strategic priorities, resourcing capacity, and risk appetite \u2014 not to commit to a multi-year programme before the case has been built."),

      // === Section 4: Discovery Phase Scope ===
      heading1("4.  Proposed Scope for Discovery Phase"),
      body("If management approves, the discovery phase would be a structured 6\u20138 week exploration with the following scope."),
      body("In scope:"),
      bullet("Review of the AI wellness landscape in Singapore: existing programmes, gaps, and potential collaborators"),
      bullet("Stakeholder mapping: schools, community partners, corporate sponsors, government agencies, and expert advisors who could advise, co-design, or support delivery"),
      bullet("Needs validation: initial engagement with a small number of schools, parents, youth, and volunteers to test whether the proposed programme topics resonate and identify priority needs"),
      bullet("Governance review: identification of safeguarding, data protection, AI tool governance, and clinical boundary requirements"),
      bullet("Partner and resourcing assessment: mapping of what could be delivered internally versus what requires external expertise or partnership"),
      bullet("Pilot curriculum outline: draft framework for one or two priority programme tracks, including session structure, content themes, and delivery formats"),
      bullet("Risk register: initial identification of key risks and proposed mitigations"),
      bullet("Resource and budget estimate: indicative costing for a pilot phase"),
      bullet("Success criteria: definition of what a successful pilot would look like and how it would be measured"),
      body("Out of scope:"),
      bullet("Programme delivery or pilot execution"),
      bullet("Commitment of funds beyond the discovery phase"),
      bullet("Appointment of programme staff"),
      bullet("Signing of partnership agreements or funding commitments"),
      bullet("Development of a full Centre of Excellence or national platform"),
      body("The discovery phase would be led by a small internal working group with input from external advisors as needed. A final report would be presented to senior management with a clear recommendation: proceed to pilot, modify scope and revisit, or discontinue."),

      // === Section 5: Priority Audiences ===
      heading1("5.  Priority Audiences for Initial Pilot"),
      body("If the discovery phase validates the concept and management approves a pilot, the recommendation would be to start with one or two priority audiences rather than all four at once. This reduces risk, contains cost, and allows learning to inform later expansion."),

      heading2("Priority 1: Youth and Schools"),
      body("Secondary and post-secondary students, delivered through school workshops, assemblies, and peer-facilitated sessions. This is the highest-priority audience because young people are the group most directly exposed to AI risks while having the least developed critical thinking skills to evaluate what they encounter. Schools provide a structured, trusted delivery environment with established pastoral and safeguarding frameworks. Peer-ambassador models leverage existing youth leadership structures within Singapore Red Cross. Early success with youth also creates a platform for parent and caregiver engagement, since children often raise these topics at home."),
      body("Programme content for youth would cover: healthy AI habits; understanding AI chatbots and companions; deepfakes and digital trust; emotional regulation in AI-mediated environments; online boundaries; and agentic AI \u2014 what it is and how to stay in control."),

      heading2("Priority 2: Parents and Caregivers"),
      body("Delivered through school-based parent sessions, webinars, and family learning resources. Parents are frequently less AI-literate than their children, creating a guidance gap at home. Engaging parents alongside youth multiplies the impact of school-based sessions. Parent sessions can be layered onto existing school engagement relationships, reducing marginal delivery cost. Family learning resources extend the programme's reach beyond attendees."),
      body("Programme content for parents would cover: AI tools children are likely to encounter; setting family boundaries for AI and device use; recognising AI-influenced distress in children; conversation starters for difficult topics; and signposting to appropriate support services."),

      heading2("Later-phase extensions, subject to pilot outcomes"),
      body("Young adults (tertiary learners and young workers): campus seminars and practical labs, contingent on successful delivery with secondary-level audiences first. Working adults and frontline professionals: workplace sessions, digital wellness clinics, and sector-specific programmes \u2014 positioned as a Phase 2 extension after the pilot has been evaluated and refined."),

      // === Section 6: Operating Model ===
      heading1("6.  Operating Model and Partner Roles"),
      body("A clear operating model is essential to ensure Singapore Red Cross leads what it should lead, partners contribute what they are best placed to provide, and the organisation does not overreach into areas where it lacks expertise or mandate."),

      heading2("What Singapore Red Cross would lead"),
      new Paragraph({ spacing: { before: 60, after: 60 } }),
      twoColTable(
        ["Area", "Description"],
        [
          ["Programme design and delivery", "Curriculum development, session facilitation, and participant engagement \u2014 drawing on the organisation's established education and community outreach capabilities."],
          ["Volunteer management", "Recruitment, training, supervision, and safeguarding of volunteer facilitators."],
          ["Community trust and relationships", "Leveraging existing relationships with schools, families, and community networks to enable programme delivery."],
          ["Brand and communications", "Positioning the initiative as a Mental Health pillar programme, with clear messaging about scope, boundaries, and intended outcomes."],
          ["Pilot governance and oversight", "Ensuring the programme operates within Singapore Red Cross's governance frameworks and safeguarding standards."],
          ["Impact measurement", "Tracking participant reach, satisfaction, knowledge gains, and behaviour change indicators."],
        ]
      ),

      heading2("What expert partners should provide"),
      new Paragraph({ spacing: { before: 60, after: 60 } }),
      twoColTable(
        ["Area", "Description"],
        [
          ["AI and technology expertise", "Technical accuracy in curriculum content, advice on AI tool developments, and support with content review \u2014 from technology academics, AI governance practitioners, or industry advisors."],
          ["Mental health and clinical oversight", "Expert review of programme content for psychological safety, referral pathways, and escalation procedures \u2014 from qualified mental health professionals."],
          ["Youth and education expertise", "Input on age-appropriate content, school engagement, and youth facilitation \u2014 from education specialists and youth sector partners."],
          ["Research and evaluation", "Design of measurement frameworks, analysis of pilot outcomes, and identification of improvement areas \u2014 from academic or evaluation partners."],
        ]
      ),

      heading2("What schools, community partners, and volunteers would support"),
      new Paragraph({ spacing: { before: 60, after: 60 } }),
      twoColTable(
        ["Area", "Description"],
        [
          ["Programme venues and access", "Schools providing space, assembly time, or co-facilitation; community partners hosting sessions or referring participants."],
          ["Participant recruitment", "Schools, parents, and community partners helping to reach the right audiences."],
          ["Peer facilitation", "Trained youth volunteers facilitating peer-ambassador sessions."],
          ["Family engagement", "Parents and caregivers participating in sessions and providing feedback."],
          ["Beneficiary feedback", "Schools and community partners sharing observations on programme value and participant response."],
        ]
      ),

      heading2("What should be outsourced or co-developed"),
      new Paragraph({ spacing: { before: 60, after: 60 } }),
      twoColTable(
        ["Area", "Approach"],
        [
          ["Legal and regulatory advice", "PDPA compliance, data protection impact assessments, and liability considerations \u2014 provided by qualified external legal counsel."],
          ["AI tool assessment", "Evaluation of any AI tools for potential demonstration \u2014 conducted by external AI governance advisors, not internal staff."],
          ["Research and evaluation design", "Measurement frameworks and outcome analysis \u2014 potentially provided by academic or evaluation partners with relevant expertise."],
        ]
      ),

      heading2("What Singapore Red Cross should not become"),
      body("Singapore Red Cross should not be positioned as:"),
      bullet("A clinical authority on AI or mental health \u2014 the organisation provides education and signposting, not diagnosis or therapy"),
      bullet("A technical authority on AI \u2014 technology expertise should come from expert advisors and partners"),
      bullet("A regulatory or compliance authority on AI \u2014 governance advice should come from qualified external sources"),
      bullet("An unsupervised emotional support provider \u2014 participants experiencing distress should be referred to qualified mental health services"),
      body("This clarity protects the organisation's reputation, reduces liability, and ensures the initiative operates within its genuine areas of strength."),

      // === Section 7: Safeguards ===
      heading1("7.  Safeguards, Governance, and Boundaries"),

      heading2("7a. Programme boundaries"),
      body("The AI Wellness Initiative would **provide**:"),
      bullet("Education and literacy \u2014 helping participants understand AI systems, their capabilities, and their limitations"),
      bullet("Resilience-building \u2014 strengthening critical thinking, emotional regulation, and healthy digital habits"),
      bullet("Signposting \u2014 directing participants to appropriate support services for AI-related distress"),
      bullet("Preventive support \u2014 early intervention conversations and referrals before issues escalate"),
      body("The initiative would **not** provide:"),
      bullet("Diagnosis of mental health conditions related to AI use"),
      bullet("Counselling, therapy, or clinical intervention"),
      bullet("Crisis intervention or emergency mental health response"),
      bullet("Unsupervised emotional support through AI tools or otherwise"),
      bullet("Technical advice or support for specific AI platforms"),
      bullet("Legal advice on AI governance or data protection"),
      body("Any participant identified as needing clinical support, crisis intervention, or specialised services would be referred to appropriate qualified providers through established referral pathways."),

      heading2("7b. Safeguarding commitments"),
      body("Child and youth safeguarding:"),
      bullet("All programme content for participants under 18 would be reviewed and approved by qualified safeguarding advisors before delivery"),
      bullet("Volunteer facilitators working with children and youth would be trained in child protection, mandatory reporting obligations, and Singapore Red Cross safeguarding standards"),
      bullet("Sessions with children and youth would be conducted in school or supervised community settings, never in isolated or unsupervised environments"),
      bullet("Parental consent would be obtained for all youth participants, with clear information about programme content and boundaries"),
      body("Vulnerable persons:"),
      bullet("Programme materials would be designed to be accessible and inclusive, with consideration for participants with different abilities, backgrounds, and levels of digital access"),
      bullet("Facilitators would be trained to recognise signs of AI-related distress and to refer participants to appropriate support services"),
      bullet("The programme would not collect sensitive personal data from participants beyond what is necessary for programme evaluation"),
      body("Volunteer safeguarding:"),
      bullet("All volunteer facilitators would undergo background screening in accordance with Singapore Red Cross policy"),
      bullet("Volunteers would receive training on programme content, safeguarding obligations, referral pathways, and appropriate boundaries with participants"),
      bullet("Volunteers would be supervised by experienced programme leads and would have clear escalation routes for safeguarding concerns"),
      bullet("Volunteers would not be placed in situations where they are expected to provide emotional support beyond their training and role definition"),

      heading2("7c. Governance framework"),
      new Paragraph({ spacing: { before: 60, after: 60 } }),
      twoColTable(
        ["Governance Area", "Proposed Approach"],
        [
          ["Child safeguarding", "Programme content reviewed by safeguarding advisors; volunteer training on child protection; mandatory reporting procedures; school-based delivery settings."],
          ["Data protection (PDPA)", "Minimal data collection; informed consent for all data gathered; clear retention and deletion policies; data protection impact assessment for any digital tools used."],
          ["AI tool selection and approval", "Any AI tools demonstrated or referenced must be reviewed and approved by external AI governance advisors before use; must meet criteria for safety, data minimisation, age-appropriateness, and transparency."],
          ["Third-party platforms", "External platforms assessed for data protection, safeguarding, and content appropriateness; Singapore Red Cross would not endorse specific commercial products."],
          ["Crisis escalation and referral", "Clear, documented referral pathways to qualified mental health services, school counsellors, and community support agencies; facilitators trained on escalation triggers and procedures."],
          ["Volunteer training and supervision", "Structured onboarding covering content knowledge, safeguarding, referral procedures, and boundary management; ongoing supervision by programme leads."],
          ["Reputational risk", "Clear communication about the initiative's scope and boundaries; all public communications reviewed before release."],
          ["Partner accountability", "Written agreements with all partners clarifying roles, responsibilities, safeguarding obligations, and governance standards; regular review of partner performance."],
          ["Content review", "All programme content reviewed by qualified mental health professionals and AI governance experts before delivery; curriculum updated as AI landscape evolves."],
        ]
      ),

      heading2("7d. Clinical and safeguarding boundaries in practice"),
      body("To ensure clarity for management, participants, and partners:"),
      bullet("Workshops and sessions are educational and preventive. They are not therapy, counselling, or clinical intervention."),
      bullet("Discussion of AI-related distress in sessions is acknowledged and met with appropriate signposting, not clinical response."),
      bullet("AI tools demonstrated (if any, in later phases) are supervised, closed-scope, non-clinical, and do not collect sensitive personal data."),
      bullet("One-on-one conversations between facilitators and participants about personal AI use or mental health concerns would be handled through established referral pathways, not kept within the programme."),
      bullet("Crisis situations would be escalated immediately to qualified professionals via documented procedures \u2014 not managed within the programme."),

      // === Section 8: Discovery Roadmap ===
      heading1("8.  Indicative 6\u20138 Week Discovery Roadmap"),
      new Paragraph({ spacing: { before: 60, after: 60 } }),
      twoColTable(
        ["Week", "Activity and Output"],
        [
          ["Week 1", "Internal scoping: briefing for management sponsor and working group; review of existing Singapore Red Cross programmes, assets, and partnerships; initial landscape scan. **Output:** Internal scoping memo; list of existing assets and partners to leverage."],
          ["Week 2", "Stakeholder mapping: identification of potential expert advisors (mental health, AI, education, youth), partner organisations, schools, and funding sources; preliminary risk and governance review. **Output:** Stakeholder map; initial risk register; list of governance questions to address."],
          ["Week 3", "Needs validation: initial informal conversations with 3\u20135 schools, parent groups, youth organisations, and volunteer representatives to test whether proposed programme topics resonate. **Output:** Stakeholder feedback summary; refined understanding of audience priorities."],
          ["Week 4", "Partner engagement: outreach to 2\u20133 potential expert advisors and partner organisations to explore willingness to contribute expertise or co-design support. **Output:** Partner engagement summary; indicative terms of collaboration."],
          ["Week 5", "Governance review: detailed assessment of safeguarding, data protection, AI tool governance, and clinical boundary requirements; draft governance framework. **Output:** Governance framework draft; identified gaps and required actions."],
          ["Week 6", "Pilot curriculum outline: draft curriculum framework for proposed priority audience(s), including session structure, content themes, delivery formats, and volunteer training requirements. **Output:** Pilot curriculum outline; volunteer training framework."],
          ["Week 7", "Resource and budget estimate: indicative costing for pilot delivery, including facilitator time, volunteer coordination, materials, partner contributions, and administrative overhead. **Output:** Resource and budget estimate; identification of potential funding or co-funding sources."],
          ["Week 8", "Synthesis and recommendation: compilation of discovery findings into a management report with a clear recommendation \u2014 proceed to pilot, modify scope and revisit, or discontinue. **Output:** Management report with recommendation; scoped pilot proposal (if proceeding); governance plan; resource estimate."],
        ]
      ),
      body("Additional outputs throughout the discovery phase include: success criteria for a pilot phase, defined in consultation with internal and external stakeholders; key risk mitigations, documented and reviewed; and alignment check with Singapore Red Cross strategic priorities and Mental Health pillar objectives."),

      // === Section 9: Success Measures ===
      heading1("9.  Potential Pilot Success Measures"),
      body("If the discovery phase leads to a pilot, the following measures would define success:"),
      new Paragraph({ spacing: { before: 60, after: 60 } }),
      twoColTable(
        ["Measure", "Description"],
        [
          ["Reach", "Number of participants engaged in pilot sessions, by audience type and delivery format."],
          ["Knowledge and confidence", "Pre- and post-session assessments measuring changes in participants' understanding of AI-related risks and their confidence in managing AI-related situations."],
          ["Satisfaction", "Participant and facilitator satisfaction scores collected after sessions."],
          ["Behavioural indicators", "Self-reported and observed changes in digital habits, conversation quality at home (for parent sessions), and help-seeking behaviour."],
          ["Volunteer development", "Number of volunteers trained, quality of facilitation, and volunteer retention and satisfaction."],
          ["Partner engagement", "Number and quality of partner organisations engaged, and their feedback on programme value and delivery."],
          ["Referral and escalation", "Number of participants referred to support services, and appropriate handling of safeguarding concerns."],
          ["Learning and iteration", "Evidence that pilot outcomes are being reviewed and used to refine programme content and delivery."],
          ["Feasibility of scale", "Assessment of whether the model can be refined and extended to additional audiences or settings."],
        ]
      ),
      body("These measures are deliberately practical and focused on learning. The pilot is an evidence-building exercise, not a public performance. Its success is measured by whether it generates reliable, actionable insight \u2014 not by scale of reach or media coverage."),

      // === Section 10: Management Decision ===
      heading1("10.  Management Decision Requested"),
      body("Senior management is invited to consider the following:"),
      new Paragraph({ spacing: { before: 60, after: 60 } }),
      twoColTable(
        ["Decision Point", "Options"],
        [
          ["Strategic fit", "Does the AI Wellness Initiative align with Singapore Red Cross's current strategic priorities and the Mental Health pillar?"],
          ["Approve discovery phase", "Approve a 6\u20138 week discovery and design phase with a defined scope, budget envelope, and reporting timeline."],
          ["Appoint sponsor / working group", "Appoint an internal sponsor and small working group to lead the discovery phase."],
          ["External engagement", "Approve initial informal conversations with selected external partners and expert advisors to test concept feasibility."],
          ["Return point", "Receive a management report at the end of the discovery phase with a clear recommendation: proceed to pilot, modify scope and revisit, or discontinue."],
        ]
      ),
      body("What this decision **does not** commit Singapore Red Cross to:"),
      bullet("Programme delivery or pilot execution"),
      bullet("Appointment of programme staff or allocation of significant resources"),
      bullet("Signing of partnership agreements or funding commitments"),
      bullet("Public positioning as a national leader on AI and mental wellness"),
      bullet("Any form of clinical, technical, or regulatory authority on AI"),
      body("What this decision **enables**:"),
      bullet("A structured, time-bound exploration of whether the initiative fits the organisation"),
      bullet("Low-risk engagement with external expertise to inform the decision"),
      bullet("Development of a rigorous, evidence-based pilot proposal before any commitment to scale"),
      bullet("Clear governance boundaries and programme limits established upfront"),

      // === Section 11: Longer-Term Pathway ===
      heading1("11.  Longer-Term Pathway, Subject to Validation"),
      body("If the discovery phase and subsequent pilot validate the concept and management approves expansion, the longer-term pathway might include:"),
      bullet("Phase 2 \u2014 Programme refinement and scale: Based on pilot learning, refine the curriculum, expand to additional schools and parent groups, and build a volunteer facilitator network."),
      bullet("Phase 3 \u2014 Extended audiences: Introduce young adult and working adult tracks, contingent on successful delivery with youth and parent audiences and availability of appropriate expertise and partnerships."),
      bullet("Phase 4 \u2014 Centre of Excellence consideration: The \"Centre of Excellence\" positioning \u2014 including structured research, national partnerships, and regional knowledge-sharing \u2014 may be considered only after demand has been validated, partner ecosystems have been established, governance frameworks are mature, and resourcing is secure. This is a potential long-term ambition, not a starting point."),
      bullet("Regional knowledge-sharing: If the programme proves effective, frameworks, curricula, and insights could be shared with other Red Cross / Red Crescent societies and international humanitarian partners \u2014 positioning Singapore Red Cross as a contributor to regional thinking on AI and community wellness, without premature claims of leadership."),
      body("None of these phases are pre-committed. Each would require its own management approval, evidence of impact from the preceding phase, and confirmation that governance, resourcing, and risk parameters remain acceptable."),

      hr(),
      new Paragraph({ spacing: { before: 160, after: 0 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: "\u2014 End of Concept Paper \u2014", font: "Arial", size: 18, italics: true, color: "888888" })]
      }),
    ]
  }]
});

const outPath = "C:\\CCProject\\AI Wellness Initiative \u2014 Concept Paper for Singapore Red Cross.docx";
docx.Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log("Written to " + outPath);
}).catch(err => console.error(err));
