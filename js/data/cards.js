/* Auto-split from the original single-file prototype. Pure data, no logic. */
window.AP = window.AP || {};

AP.CARDS = {
    calc:[
      ["Extreme Value Theorem — what must you say?","f continuous on a CLOSED interval [a,b] guarantees both an absolute max and an absolute min on that interval. Naming continuity and closed is what earns the point."],
      ["Mean Value Theorem conditions","f continuous on [a,b] AND differentiable on (a,b). Then some c in (a,b) has f′(c) = (f(b)−f(a))/(b−a). Both conditions must be stated."],
      ["Total distance vs displacement","Displacement = ∫v dt. Total distance = ∫|v| dt. The exam uses these interchangeably in wording only."],
      ["When is speed increasing?","When velocity and acceleration have the SAME sign. Not when acceleration is positive — that's a different claim."],
      ["Justifying a point of inflection","f″ changes sign there. Not “f″ = 0” — that's necessary but not sufficient."],
      ["Candidates test — what gets forgotten?","The ENDPOINTS. Absolute extrema on a closed interval can occur at critical points or at a or b."]
    ],
    chem:[
      ["Anode vs cathode mnemonic","An Ox, Red Cat. ANode = OXidation, REDuction at CAThode. In a galvanic cell the more negative E° is oxidized."],
      ["Half-equivalence point","[HA] = [A⁻], so pH = pKa. Maximum buffering capacity. Distinct from the equivalence point, which is basic for a weak acid."],
      ["Intra vs intermolecular","Boiling and melting overcome INTERmolecular forces. Covalent bonds inside the molecule stay intact. Steam is still H₂O."],
      ["Hydrogen bonding requires","H bonded directly to N, O, or F — and a lone pair on a nearby N, O, or F. H on carbon does not hydrogen bond."],
      ["Q vs K","Q < K runs forward toward products. Q > K runs reverse. The system always moves so Q approaches K."],
      ["Entropy justification language","Argue from particle dispersal and number of accessible microstates. Avoid the word “disorder” — readers do not credit it."]
    ],
    bio:[
      ["Why is 'the environment caused the trait' wrong?","Variation pre-exists via random mutation. The environment SELECTS among existing variation — it never creates the trait on demand."],
      ["What makes a control valid?","It differs from the treatment in exactly one variable. You must explain what it holds constant and therefore what it rules out."],
      ["Reading error bars","Substantially overlapping error bars = no evidence of a significant difference, however far apart the means look."],
      ["Competitive vs noncompetitive inhibition","Competitive binds the active site and IS overcome by excess substrate. Noncompetitive binds an allosteric site and is NOT."],
      ["Sources of meiotic variation","Crossing over in prophase I, and independent assortment in metaphase I. Name the mechanism and the stage."],
      ["Positive vs negative feedback","Positive amplifies the original process (childbirth, clotting). Negative damps it back toward a set point. Neither means good or bad."]
    ],
    apush:[
      ["HAPP","Historical situation, Audience, Purpose, Point of view. Sourcing needs one of these explained AND tied to your argument — on three documents."],
      ["Contextualization test","Could this sentence be pasted onto a different prompt unchanged? If yes, it's generic and earns nothing."],
      ["Complex understanding — what works","Sustained nuance: analyze causation both directions, show variation by region or group, or qualify your own claim. Not one tacked-on sentence."],
      ["New SAQ format, May 2027","Three questions, all required. SAQ 1 secondary text, SAQ 2 primary text, SAQ 3 a NON-TEXT source. Each on a different period."],
      ["New LEQ format, May 2027","One required prompt with a brief introductory statement suggesting areas for analysis. No more choosing among three."],
      ["Evidence beyond the documents","Must be outside the documents AND connected to the argument. Name-dropping without connection earns nothing."]
    ],
    lang:[
      ["The 1-4-1 rubric","1 thesis, 4 evidence and commentary, 1 sophistication. Identical across all three essays."],
      ["Commentary vs summary","Summary says what the evidence means. Commentary says what WORK the choice does for the argument. Never write “this shows that.”"],
      ["Rhetorical analysis — the upgrade","Don't name the device. Explain its function: what it does to the audience and how it serves the writer's purpose."],
      ["What does NOT earn sophistication","Sweeping openers (“since the beginning of time”), token counterarguments, and ornate language that doesn't strengthen the argument."],
      ["Synthesis source minimum","At least THREE sources for 2+ points in Row B. Two sources caps you at 1 regardless of quality."],
      ["Defensible thesis","A claim a reasonable person could argue against. Restating the prompt or observing that people disagree earns zero."]
    ],
    psych:[
      ["The five units","1 Biological Bases, 2 Cognition, 3 Development and Learning, 4 Social Psychology and Personality, 5 Mental and Physical Health. Each 15–25%."],
      ["Operational definition","The specific measurable procedure used in THIS study — the instrument, the scale, the count. Never the dictionary meaning."],
      ["AAQ structure","Six parts: method, operational definition, interpret a statistic, ethical guideline plus application, generalizability, and how a finding supports or refutes a concept."],
      ["EBQ structure","Claim, then evidence from one source with explanation, then evidence from a DIFFERENT source with a DIFFERENT concept explained."],
      ["Why definitions score zero on the EBQ","The rubric requires application. You must connect the specific finding to the specific claim through a mechanism, not restate what a term means."],
      ["Generalizability answers","Cite real participant demographics from the source. “Small sample size” alone almost never earns the point."]
    ]
  };
