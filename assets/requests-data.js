/* Scinode — shared Requests dataset & helpers.
   Loaded by requests.html and request-detail.html so both pages read the
   same request records (plain globals, no build step — same pattern as
   scinode.js). Do NOT wrap in an IIFE; other page scripts depend on these
   being on window. */

/* ---------- Type / status visual language (mapped to Scinode design-system badge recipes) ---------- */
var TYPE_META = {
  'R&D Project':           { label:'R&D Project',    bg:'#EEF2FF', text:'#4338CA' },
  'Manufacturing Project': { label:'CMO',             bg:'#E8F2F6', text:'var(--navy-500)' },
  'CDMO Project':          { label:'CDMO',            bg:'#F3E8FF', text:'#7C3AED' },
  'RFQ':                   { label:'RFQ',             bg:'#EFF6FF', text:'#1D4ED8' },
  'Sample Request':        { label:'Sample Request',  bg:'#FFF7ED', text:'#C2410C' },
  'Consultation':          { label:'Consultation',    bg:'#F0FDF4', text:'#15803D' }
};
var STATUS_META = {
  'Active':           { bg:'#DBEAFE', text:'#1E40AF' },
  'Action Required':  { bg:'rgba(229,214,46,.28)', text:'#5C4A00' },
  'Completed':        { bg:'#D4F0EE', text:'#016358' },
  'Dropped':          { bg:'#F1F5F9', text:'#64748B' }
};
var TYPE_ORDER = ['R&D Project','Manufacturing Project','CDMO Project','RFQ','Sample Request','Consultation'];

/* ---------- Dataset (ported 1:1 from the AI Studio prototype's data.ts) ---------- */
var BASE_REQUESTS = [
  { id:'RD-2026-00089', type:'R&D Project', status:'Action Required', objective:'Develop ECOCERT-certified Piroctone Olamine for anti-dandruff and antimicrobial applications.', productName:'Piroctone Olamine', casNumber:'68890-66-4', stage:'Commercial Proposal Ready', progress:70,
    expert:{ name:'Vinayak Verma', avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', title:'Principal Formulation Scientist' },
    lastUpdated:'2026-06-25', createdDate:'2026-06-12',
    attentionMessage:'Proposal awaiting approval. Review the formulation blueprint, quality guidelines and submit your decision.', attentionActionLabel:'Review Proposal',
    problemStatement:'Need to generate synthetic routes for Piroctone Olamine using specified ECOCERT starting materials that meet organic standard guidelines.',
    specifications:[{label:'Assay (Purity)',value:'≥ 99.0% (HPLC)'},{label:'ECOCERT Certified',value:'Yes'},{label:'Solubility',value:'Soluble in Alcohol and Water-surfactant mixtures'},{label:'Melting Point',value:'130 - 135 °C'}],
    timeline:[
      {label:'Request Submitted',status:'completed',date:'2026-06-12',description:'Request lodged and validated by Scinode triage team.'},
      {label:'Talk to Expert',status:'completed',date:'2026-06-14',description:'Video consultation with Vinayak Verma completed.'},
      {label:'Feasibility Study',status:'completed',date:'2026-06-20',description:'Lab feasibility and ECOCERT raw material sourcing validated.'},
      {label:'Proposal Prepared',status:'current',date:'2026-06-25',description:'Proposal and pricing structure prepared. Awaiting client signature.'},
      {label:'PO Upload',status:'upcoming',description:'Upload Signed Proposal / PO to trigger formulation work.'},
      {label:'Formulation Phase',status:'upcoming',description:'Synthesizing batches and testing stability.'}
    ]
  },
  { id:'CONSULT-2026-00096', type:'Consultation', status:'Active', objective:'Process optimization consultation for continuous flow synthesis of pharmaceutical intermediates.', productName:'Continuous Flow Setup', casNumber:'N/A', stage:'Consultation Requested', progress:15,
    expert:{ name:'Vinayak Verma', avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', title:'Principal Formulation Scientist' },
    lastUpdated:'2026-06-28', createdDate:'2026-06-20',
    problemStatement:'Existing batch synthesis yields unstable isomer ratio. We want to convert to continuous flow with precise residence time controls.',
    specifications:[{label:'Flow Rate Range',value:'0.1 - 10.0 mL/min'},{label:'Max Temperature',value:'180 °C'},{label:'Key Catalyst',value:'Pd/C fixed bed'}],
    timeline:[
      {label:'Request Submitted',status:'completed',date:'2026-06-20',description:'Consultation requested.'},
      {label:'Talk to Expert',status:'current',date:'2026-06-28',description:'Consultation session with Vinayak Verma scheduled.'},
      {label:'Feasibility Study',status:'upcoming',description:'Technical viability assessment.'},
      {label:'Roadmap Delivery',status:'upcoming',description:'Deliver recommendations and engineering blueprint.'}
    ]
  },
  { id:'MFG-2026-00102', type:'Manufacturing Project', status:'Action Required', objective:'Scale-up manufacturing of 2-Ethylhexyl Triazone UV filter (500kg pilot batch).', productName:'2-Ethylhexyl Triazone', casNumber:'88122-99-0', stage:'Talk to our expert', progress:25,
    expert:{ name:'Rajesh Kumar', avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', title:'Head of Scaling & CMO Operations' },
    lastUpdated:'2026-06-27', createdDate:'2026-06-05',
    attentionMessage:'It’s been a few days since your request. Schedule a discovery call to avoid project delays.', attentionActionLabel:'Schedule a call',
    problemStatement:'Scale up reaction from 5L flask to 1000L glass-lined reactor. Temperature control critical at -5°C to avoid polymer byproduct.',
    specifications:[{label:'CAS Number',value:'88122-99-0'},{label:'Volume',value:'500 kg'},{label:'Max Free Amine',value:'< 0.1%'},{label:'Appearance',value:'Off-white to light yellow powder'}],
    timeline:[
      {label:'Request Submitted',status:'completed',date:'2026-06-05'},
      {label:'Talk to Expert',status:'completed',date:'2026-06-10'},
      {label:'Feasibility & Sourcing',status:'completed',date:'2026-06-18'},
      {label:'Pricing & SOW Agreed',status:'completed',date:'2026-06-24'},
      {label:'PO Upload',status:'current',date:'2026-06-27',description:'Awaiting client PO to lock reactor slot.'},
      {label:'Manufacturing & QA',status:'upcoming'}
    ]
  },
  { id:'CDMO-2026-00140', type:'CDMO Project', status:'Action Required', objective:'End-to-end development & manufacturing of a controlled-release Niacinamide microcapsule for a pilot batch.', productName:'Niacinamide Microcapsule', casNumber:'98-92-0', stage:'Lab & Plant Match', progress:45,
    expert:{ name:'Rajesh Kumar', avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', title:'Head of Scaling & CMO Operations' },
    lastUpdated:'2026-06-26', createdDate:'2026-06-08',
    attentionMessage:'A partner match is ready for your review. Check the selection reasoning and capabilities below.', attentionActionLabel:'Review Match',
    problemStatement:'Need a dedicated development-to-manufacturing partner for a controlled-release microencapsulation process, including a pilot batch before scale-up.',
    specifications:[{label:'Encapsulation Type',value:'Controlled-release, pH-triggered'},{label:'Target Payload',value:'10% Niacinamide'},{label:'Batch Size',value:'25 kg pilot'}],
    timeline:[
      {label:'Request Submitted',status:'completed',date:'2026-06-08'},
      {label:'Talk to Expert',status:'completed',date:'2026-06-12'},
      {label:'Lab & Plant Match',status:'current',date:'2026-06-26',description:'Reviewing shortlisted development partner.'},
      {label:'Proposal Ready',status:'upcoming'},
      {label:'Request Closed',status:'upcoming'}
    ]
  },
  { id:'CDMO-2026-00155', type:'CDMO Project', status:'Completed', objective:'CDMO partnership for commercial-scale production of Bakuchiol (99%) with full regulatory documentation.', productName:'Bakuchiol (99%)', casNumber:'10309-37-2', stage:'Request Closed', progress:100,
    expert:{ name:'Dr. Amelie Laurent', avatar:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', title:'Senior Bio-Organic Researcher' },
    lastUpdated:'2026-05-30', createdDate:'2026-05-02',
    problemStatement:'Required a single partner to take Bakuchiol from lab-scale synthesis through commercial manufacturing, including stability and regulatory documentation.',
    specifications:[{label:'Purity',value:'≥ 99.0%'},{label:'Commercial Volume',value:'2,000 kg / year'},{label:'Documentation',value:'Full DMF + stability package'}],
    timeline:[
      {label:'Request Submitted',status:'completed',date:'2026-05-02'},
      {label:'Talk to Expert',status:'completed',date:'2026-05-08'},
      {label:'Lab & Plant Match',status:'completed',date:'2026-05-16'},
      {label:'Proposal Ready',status:'completed',date:'2026-05-24'},
      {label:'Request Closed',status:'completed',date:'2026-05-30'}
    ]
  },
  { id:'RFQ-2026-00095', type:'RFQ', status:'Completed', objective:'RFQ for bulk supply of USP grade Caprylyl Glycol (10 Metric Tons per annum).', productName:'Caprylyl Glycol', casNumber:'1117-86-8', stage:'RFQ Closed', progress:100,
    expert:{ name:'Sarah Jenkins', avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', title:'Sourcing & Supply Chain Lead' },
    lastUpdated:'2026-06-15', createdDate:'2026-05-20',
    problemStatement:'Sourcing high-purity, low-odor Caprylyl Glycol for sensitive infant care line. Continuous supply and ISO audit trail required.',
    specifications:[{label:'Grade',value:'USP Cosmetic Grade'},{label:'Odor',value:'Practically odorless'},{label:'Purity',value:'≥ 99.5%'},{label:'Annual Volume',value:'10,000 kg'}],
    timeline:[
      {label:'RFQ Submitted',status:'completed',date:'2026-05-20'},
      {label:'Sourcing Evaluation',status:'completed',date:'2026-05-25'},
      {label:'Quotation Shared',status:'completed',date:'2026-06-02'},
      {label:'Sample Approval',status:'completed',date:'2026-06-10'},
      {label:'Contract Signed',status:'completed',date:'2026-06-15'}
    ]
  },
  { id:'SAMPLE-2026-00110', type:'Sample Request', status:'Active', objective:'Request for 50g sample of high-purity Ethyl Ferulate for clinical trials.', productName:'Ethyl Ferulate', casNumber:'4046-02-0', stage:'Specs Locked', progress:50,
    expert:{ name:'Dr. Amelie Laurent', avatar:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', title:'Senior Bio-Organic Researcher' },
    lastUpdated:'2026-06-26', createdDate:'2026-06-22',
    problemStatement:'Need rapid evaluation of biological antioxidant properties in skin patch tests. Must be free of solvents.',
    specifications:[{label:'Purity',value:'≥ 98.5% (GC)'},{label:'Solvent Residue',value:'< 100 ppm'},{label:'Quantity',value:'50 grams'}],
    timeline:[
      {label:'Sample Requested',status:'completed',date:'2026-06-22'},
      {label:'Expert Review',status:'completed',date:'2026-06-24'},
      {label:'Feasibility Study',status:'current',date:'2026-06-26',description:'Assessing custom purification steps.'},
      {label:'Sample Synthesis & QA',status:'upcoming'},
      {label:'Dispatch',status:'upcoming'}
    ]
  },
  { id:'RD-2026-00085', type:'R&D Project', status:'Active', objective:'Develop high-efficiency extraction process for tire pyrolysis oil purification.', productName:'Tire pyrolysis oil', casNumber:'N/A', stage:'Talk to our expert', progress:25,
    expert:{ name:'Dr. Amelie Laurent', avatar:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', title:'Senior Bio-Organic Researcher' },
    lastUpdated:'2026-05-27', createdDate:'2026-05-10',
    problemStatement:'Develop a process for extracting and refining tire pyrolysis oil from waste tires for fuel-grade or chemical-grade recovery, reducing sulfur content.',
    specifications:[{label:'Sulfur Content Target',value:'< 100 ppm'},{label:'Viscosity Target',value:'< 5 cSt @ 40°C'},{label:'Ash Content',value:'< 0.01 wt%'}],
    timeline:[
      {label:'Request Logged',status:'completed',date:'2026-05-10'},
      {label:'Talk to Expert',status:'completed',date:'2026-05-16'},
      {label:'Feasibility Study',status:'current',date:'2026-05-27',description:'Evaluating acid-base washing vs hydrodesulfurization.'},
      {label:'Proposal Drafting',status:'upcoming'}
    ]
  },
  { id:'CONSULT-2026-00092', type:'Consultation', status:'Active', objective:'Expert consultation regarding impurities synthesis and compliance protocols for OECD-301B biodegradability.', productName:'Biodegradability Compliance', casNumber:'N/A', stage:'Expert Assigned', progress:50,
    expert:{ name:'Vinayak Verma', avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', title:'Principal Formulation Scientist' },
    lastUpdated:'2026-05-27', createdDate:'2026-05-15',
    problemStatement:'Need specialized methodology and guidelines to run testing and synthetic route planning for compliance with OECD biodegradation rules.',
    specifications:[{label:'Testing Standard',value:'OECD 301 B CO2 Evolution'},{label:'Target Biodegradation',value:'> 60% within 28 days'}],
    timeline:[
      {label:'Request Lodged',status:'completed',date:'2026-05-15'},
      {label:'Talk to Expert',status:'current',date:'2026-05-27',description:'Scheduled deep dive on degradability kinetics.'},
      {label:'Action Plan Drafted',status:'upcoming'}
    ]
  },
  { id:'MFG-2026-00041', type:'Manufacturing Project', status:'Completed', objective:'Synthesis of cosmetic-grade Ceramide NP via green biocatalysis.', productName:'Ceramide NP', casNumber:'100403-19-8', stage:'Request Closed', progress:100,
    expert:{ name:'Rajesh Kumar', avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', title:'Head of Scaling & CMO Operations' },
    lastUpdated:'2026-04-20', createdDate:'2026-03-01',
    problemStatement:'Enzymatic acylation of phytosphingosine using lipase. High stereospecificity and non-toxic solvents required.',
    specifications:[{label:'Enantiomeric Purity',value:'≥ 99.0% L-isomer'},{label:'Heavy Metals',value:'< 10 ppm'},{label:'Residual Solvents',value:'Ethanol only, < 0.1%'}],
    timeline:[
      {label:'SOW Finalized',status:'completed',date:'2026-03-01'},
      {label:'Enzyme Loading & Trial',status:'completed',date:'2026-03-15'},
      {label:'Bulk Campaign Run',status:'completed',date:'2026-04-05'},
      {label:'Purification & HPLC QA',status:'completed',date:'2026-04-12'},
      {label:'Delivery & Sign-off',status:'completed',date:'2026-04-20'}
    ]
  },
  { id:'RD-2026-00105', type:'R&D Project', status:'Dropped', objective:'Development of bio-based surfactants with HLB value of 12-14 from coconut fatty acids.', productName:'Bio-based Surfactant', casNumber:'61789-30-8', stage:'Research Partner Identified', progress:55,
    expert:{ name:'Dr. Amelie Laurent', avatar:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', title:'Senior Bio-Organic Researcher' },
    lastUpdated:'2026-06-22', createdDate:'2026-05-18',
    problemStatement:'Slight delay in sourcing the custom ethoxylation catalyst from supplier. We are exploring alternative catalysts to speed up.',
    specifications:[{label:'Hydrophilic-Lipophilic Balance',value:'12 - 14'},{label:'Bio-based Content',value:'> 85% (ASTM D6866)'},{label:'Active Content',value:'≥ 70%'}],
    timeline:[
      {label:'Request Lodged',status:'completed',date:'2026-05-18'},
      {label:'Technical Alignment',status:'completed',date:'2026-05-25'},
      {label:'Sourcing Catalyst',status:'current',date:'2026-06-22',description:'Catalyst delayed in custom logistics.'},
      {label:'Formulation Trials',status:'upcoming'}
    ]
  },
  { id:'RFQ-2026-00115', type:'RFQ', status:'Action Required', objective:'Quotation for bulk supply of Phenoxyethanol preservative (25 Metric Tons).', productName:'Phenoxyethanol', casNumber:'122-99-6', stage:'Quotation Received', progress:40,
    expert:{ name:'Sarah Jenkins', avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', title:'Sourcing & Supply Chain Lead' },
    lastUpdated:'2026-06-28', createdDate:'2026-06-25',
    attentionMessage:'New quote available. Review the pricing and terms below, then accept or ask for a revision.', attentionActionLabel:'Review Quote',
    problemStatement:'Phenoxyethanol bulk sourcing. Need exact clarification on free phenol levels limit (typically <10 ppm max requested).',
    specifications:[{label:'Free Phenol',value:'< 5 ppm target'},{label:'Colour (APHA)',value:'< 10 max'},{label:'Moisture',value:'< 0.1%'}],
    timeline:[
      {label:'RFQ Submitted',status:'completed',date:'2026-06-25'},
      {label:'Sourcing Analysis',status:'current',date:'2026-06-28',description:'Waiting on client purity parameter confirmation.'},
      {label:'Quotation Release',status:'upcoming'}
    ]
  },
  { id:'SAMPLE-2026-00120', type:'Sample Request', status:'Dropped', objective:'Request for 100g sample of Ultra-Pure Zinc Pyrithione (ZPT) dispersion (48%).', productName:'Zinc Pyrithione', casNumber:'13463-41-7', stage:'Sample Requested', progress:20,
    expert:{ name:'Vinayak Verma', avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', title:'Principal Formulation Scientist' },
    lastUpdated:'2026-06-24', createdDate:'2026-06-02',
    problemStatement:'Milling equipment under scheduled maintenance, causing temporary delay in producing the high-purity micro-dispersion.',
    specifications:[{label:'ZPT Dispersion',value:'48% active in water'},{label:'D50 Particle Size',value:'< 0.5 microns'},{label:'pH Range',value:'6.5 - 8.5'}],
    timeline:[
      {label:'Request Lodged',status:'completed',date:'2026-06-02'},
      {label:'Engineering Sizing',status:'completed',date:'2026-06-10'},
      {label:'Milling Phase',status:'current',date:'2026-06-24',description:'Scheduled maintenance of nanocolloid mill in progress.'},
      {label:'Dispersion Dispatch',status:'upcoming'}
    ]
  },
  { id:'CONSULT-2026-00122', type:'Consultation', status:'Completed', objective:'Consultation regarding regulatory registration of cosmetics in the EU (REACH compliance).', productName:'REACH Compliance Consultation', casNumber:'N/A', stage:'Completed', progress:100,
    expert:{ name:'Sarah Jenkins', avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', title:'Sourcing & Supply Chain Lead' },
    lastUpdated:'2026-06-18', createdDate:'2026-06-10',
    problemStatement:'Evaluating regulatory compliance requirements and dossier guidelines for novel skincare polymer importation in European markets.',
    specifications:[{label:'Market Access',value:'European Union'},{label:'Registration Scope',value:'REACH Member Dossier'},{label:'Timeline Target',value:'Immediate 2026 filings'}],
    timeline:[
      {label:'Consultation Booked',status:'completed',date:'2026-06-10'},
      {label:'Expert Review Session',status:'completed',date:'2026-06-14'},
      {label:'Dossier Guidelines Delivered',status:'completed',date:'2026-06-18'}
    ]
  },
  { id:'RFQ-2026-00130', type:'RFQ', status:'Action Required', objective:'RFQ for contract synthesis of high-purity Benzophenone-4 (3 Metric Tons).', productName:'Benzophenone-4', casNumber:'4065-45-6', stage:'Upload Purchase Order', progress:80,
    expert:{ name:'Rajesh Kumar', avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', title:'Head of Scaling & CMO Operations' },
    lastUpdated:'2026-06-28', createdDate:'2026-06-19',
    attentionMessage:'Quote accepted. Upload your Purchase Order to lock the commercial terms and trigger production scheduling.', attentionActionLabel:'Upload PO',
    problemStatement:'Quotation evaluation for high volumes. Reaction involves sulfonation of benzophenone. Safe waste handling and acid recycling required.',
    specifications:[{label:'Purity Assay',value:'≥ 98.0%'},{label:'Bulk Quantity',value:'3,000 kg'},{label:'Water Solubility',value:'Complete'}],
    timeline:[
      {label:'RFQ Lodged',status:'completed',date:'2026-06-19'},
      {label:'Technical Check',status:'completed',date:'2026-06-22'},
      {label:'Pricing Model Ready',status:'current',date:'2026-06-28',description:'Awaiting customer quote approval.'},
      {label:'PO Placement',status:'upcoming'}
    ]
  }
];

/* Procedurally generate the remaining 35 records to reach 48 total (mirrors the prototype's generator) */
function generateRemainingRequests(){
  var extra = [];
  var products = [
    { name:'Niacinamide (Vitamin B3)', cas:'98-92-0', type:'R&D Project', obj:'Formulation development of 10% active serum for skin barrier repair.' },
    { name:'Salicylic Acid USP', cas:'69-72-7', type:'RFQ', obj:'Bulk pricing for cosmetic-grade exfoliating agent (5 Metric Tons).' },
    { name:'Squalane (Olive-derived)', cas:'111-01-3', type:'Sample Request', obj:'Request 100mL high-purity emollient sample for compatibility checks.' },
    { name:'Alpha-Arbutin', cas:'84380-01-8', type:'Manufacturing Project', obj:'Scale up biocatalytic synthesis of skin lightening agent.' },
    { name:'Bakuchiol (99%)', cas:'10309-37-2', type:'R&D Project', obj:'Formulate natural alternative to retinol with high photo-stability.' },
    { name:'Coenzyme Q10', cas:'303-98-0', type:'RFQ', obj:'Annual purchase contract for premium antioxidant powder.' },
    { name:'Centella Asiatica Extract', cas:'84696-21-9', type:'Sample Request', obj:'Request sample of standard 10% Asiaticoside fraction extract.' },
    { name:'Panthenol (Provitamin B5)', cas:'81-13-0', type:'Consultation', obj:'Consultation regarding viscosity adjustment in hair care systems.' },
    { name:'Allantoin Cosmetic Grade', cas:'97-59-6', type:'RFQ', obj:'Supply contract for anti-irritant agent.' },
    { name:'Ferulic Acid (Natural)', cas:'537-98-4', type:'R&D Project', obj:'Stabilization of natural Ferulic Acid in aqueous vitamin C systems.' },
    { name:'Retinyl Palmitate', cas:'79-81-2', type:'CDMO Project', obj:'End-to-end development and manufacturing of a stabilized retinyl palmitate emulsion.' },
    { name:'Azelaic Acid', cas:'123-99-9', type:'CDMO Project', obj:'CDMO partnership for commercial-scale production of an azelaic acid suspension.' }
  ];
  var experts = [
    { name:'Vinayak Verma', title:'Principal Formulation Scientist', avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name:'Rajesh Kumar', title:'Head of Scaling & CMO Operations', avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { name:'Sarah Jenkins', title:'Sourcing & Supply Chain Lead', avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { name:'Dr. Amelie Laurent', title:'Senior Bio-Organic Researcher', avatar:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' }
  ];
  var statuses = [];
  for (var a=0;a<17;a++) statuses.push('Active');
  for (var b=0;b<13;b++) statuses.push('Completed');
  for (var c=0;c<3;c++) statuses.push('Dropped');
  for (var d=0;d<2;d++) statuses.push('Action Required');

  for (var i=0;i<35;i++){
    var status = statuses[i];
    var prodInfo = products[i % products.length];
    var expInfo = experts[(i+2) % experts.length];
    var isJune = i < 10;
    var createdDate = isJune
      ? '2026-06-' + String(3 + (i*2) % 25).padStart(2,'0')
      : '2026-05-' + String(1 + (i*3) % 28).padStart(2,'0');
    var lastUpdated = isJune ? '2026-06-28' : '2026-05-29';
    var typePrefix = prodInfo.type === 'R&D Project' ? 'RD' : prodInfo.type === 'Manufacturing Project' ? 'MFG' : prodInfo.type === 'CDMO Project' ? 'CDMO' : prodInfo.type === 'RFQ' ? 'RFQ' : prodInfo.type === 'Sample Request' ? 'SAMPLE' : 'CONSULT';
    var id = typePrefix + '-2026-002' + String(i+1).padStart(2,'0');

    var stage = 'Completed', progress = 100, attentionMessage, attentionActionLabel;
    if (status === 'Active'){
      var stages = ['Talk to Expert','Feasibility Study','PO Upload'];
      stage = stages[i % stages.length];
      progress = stage === 'Talk to Expert' ? 25 : stage === 'Feasibility Study' ? 50 : 75;
    } else if (status === 'Action Required'){
      stage = 'Talk to Expert'; progress = 30;
      attentionMessage = 'Technical specifications alignment is needed to proceed with formulation.';
      attentionActionLabel = 'Confirm Specs';
    } else if (status === 'Dropped'){
      stage = 'Dropped'; progress = 0;
    }

    /* Demo override: RD-2026-00210 is used to demonstrate the Collaboration
       Requirements table with two Secure documents visible at once — NDA already
       Approved (from its normal seeded history) and NCDS still Pending Upload (see
       the matching override in seedDemoSecureVersions). Progress is bumped to reach
       stage 4 ("Commercial Proposal Ready"), where NCDS first triggers. */
    if (id === 'RD-2026-00210'){
      stage = 'Commercial Proposal Ready';
      progress = 70;
    }

    extra.push({
      id: id, type: prodInfo.type, status: status, objective: prodInfo.obj, productName: prodInfo.name, casNumber: prodInfo.cas,
      stage: stage, progress: progress, expert: expInfo, lastUpdated: lastUpdated, createdDate: createdDate,
      attentionMessage: attentionMessage, attentionActionLabel: attentionActionLabel,
      problemStatement: 'Standard procedural tracking for ' + prodInfo.name + '. Objective is ' + prodInfo.obj.toLowerCase(),
      specifications: [{label:'Purity Assay',value:'≥ 99.0%'},{label:'CAS Number',value:prodInfo.cas}],
      timeline: [
        {label:'Request Lodged',status:'completed',date:createdDate},
        {label:'Review Completed',status: status === 'Completed' ? 'completed' : 'current', date:lastUpdated}
      ]
    });
  }
  return extra;
}

function loadUserRequests(){
  try { return JSON.parse(localStorage.getItem('scinodeUserRequests') || '[]'); } catch (e) { return []; }
}

/* ---------- Per-request stage-progress overrides (localStorage) ----------
   Base/procedural records are regenerated fresh on every load (not stored),
   so "functional" actions on the detail page (Accept Quote, Place Order, ...)
   are captured here as a patch keyed by request id and re-applied on top of
   the freshly generated record. Mirrors the loadUserRequests() pattern above. */
function getRequestOverrides(){
  try { return JSON.parse(localStorage.getItem('scinodeRequestOverrides') || '{}'); } catch (e) { return {}; }
}
function saveRequestOverride(id, patch){
  var all = getRequestOverrides();
  all[id] = Object.assign({}, all[id], patch);
  try { localStorage.setItem('scinodeRequestOverrides', JSON.stringify(all)); } catch (e) { /* storage unavailable */ }
}
function clearRequestOverride(id){
  var all = getRequestOverrides();
  delete all[id];
  try { localStorage.setItem('scinodeRequestOverrides', JSON.stringify(all)); } catch (e) { /* storage unavailable */ }
}

/* ---------- RFQ request-details flow: stage list + deterministic rich content ---------- */
var RFQ_LOG_STAGES = ['Requirement Submitted','Under Sourcing','Quotation Received','Quotation Accepted','Upload Purchase Order','RFQ Closed'];
var MAX_NEGOTIATION_ROUNDS = 3; /* shared across every type's negotiation thread (RFQ quote, CMO/CDMO offer, R&D proposal) so "ask for another" can't loop forever in the demo */

function rfqSeed(id){
  var h = 0;
  for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 1000;
}

function buildRfqQuote(req, roundIndex){
  var seed = rfqSeed(req.id) + roundIndex * 37;
  var basePrice = 8 + (seed % 40) + (seed % 7) / 10;
  var price = roundIndex === 0 ? basePrice : +(basePrice * (1 - 0.05 * roundIndex)).toFixed(2);
  var qtyOpts = [1, 2, 5, 10, 25];
  var qty = qtyOpts[seed % qtyOpts.length];
  var incoTerms = ['FOB', 'CIF', 'EXW', 'DDP'][seed % 4];
  var paymentTerms = ['TT Advance', '50% Advance, 50% on Dispatch', 'LC at Sight'][seed % 3];
  var ports = ['Nhava Sheva Port', 'Santos Port', 'Rotterdam Port', 'Shanghai Port'];
  var packagingOpts = ['25kg Drum', '100kg Drum', '200L HDPE Drum', '1MT Flexi Bag'];
  var leadTimes = ['2-3 weeks', '3-4 weeks', '4-6 weeks'];
  return {
    from: 'scimplify',
    round: roundIndex,
    price: +price.toFixed(2), unit: '$/KG', validityDays: 7,
    productName: req.productName, quantity: qty + (qty === 1 ? ' Ton' : ' Tons'),
    incoTerms: incoTerms, paymentTerms: paymentTerms,
    portName: ports[seed % ports.length], packaging: packagingOpts[seed % packagingOpts.length],
    leadTime: leadTimes[seed % leadTimes.length],
    quoteDocName: 'Quote_' + req.id + '_R' + (roundIndex + 1) + '.pdf'
  };
}

/* Deterministic, static per-request RFQ content: uploaded docs, sourcing note, first quote round. */
function buildRfqDetail(req){
  var seed = rfqSeed(req.id);
  return {
    uploadedDoc: { name: 'Concept Note.pdf', size: (40 + seed % 200) + ' KB' },
    sourcingNote: 'Your requested product is under sourcing currently. We will get back to you soon with quotation details.',
    quoteRounds: [buildRfqQuote(req, 0)],
    poDeadlineDays: 21,
    invoiceName: 'Performa_Invoice_' + req.id + '.pdf'
  };
}

/* ---------- RFS (Sample Request) request-details flow: stage list + deterministic rich content ---------- */
var RFS_LOG_STAGES = ['Sample Requested', 'Specs Locked', 'Sample Dispatched'];

function buildRfsDetail(req){
  var seed = rfqSeed(req.id);
  var partners = ['DHL', 'FedEx', 'Blue Dart', 'Aramex'];
  var addresses = [
    '4th Floor, BLM Tower, Plot 63, Sector 44 Rd, Gurugram, Haryana, India, Pin-122001',
    '12B Industrial Estate, Andheri East, Mumbai, Maharashtra, India, Pin-400093',
    '221 Innovation Park, Electronic City, Bengaluru, Karnataka, India, Pin-560100'
  ];
  var days = 3 + (seed % 10);
  var eta = new Date(new Date(req.lastUpdated + 'T00:00:00').getTime() + days * 86400000);
  return {
    uploadedDoc: { name: 'Concept Note.pdf', size: (30 + seed % 150) + ' KB' },
    quantityGrams: 10 + (seed % 90),
    address: addresses[seed % addresses.length],
    logisticsPartner: partners[seed % partners.length],
    estimatedDelivery: eta.toISOString().slice(0, 10)
  };
}

/* ---------- Consultation (Expert Guidance) request-details flow ---------- */
var CONSULT_LOG_STAGES = ['Consultation Requested', 'Expert Assigned', 'Consultation Completed'];

function buildConsultationDetail(req){
  var seed = rfqSeed(req.id);
  var expertiseTagPool = ['Chromatography', 'Scale-up', 'Natural Product Isolation', 'Formulation Design', 'Regulatory Strategy', 'Process Safety', 'Analytical Method Development', 'Green Chemistry'];
  var tags = [expertiseTagPool[seed % expertiseTagPool.length], expertiseTagPool[(seed + 3) % expertiseTagPool.length], expertiseTagPool[(seed + 5) % expertiseTagPool.length]];
  var durations = [30, 30, 45, 60];
  var timezones = ['ASIA/KOLKATA', 'ASIA/SINGAPORE', 'EUROPE/LONDON'];
  var hours = [10, 11, 13, 15, 16];
  var sessionDate = new Date(new Date(req.createdDate + 'T00:00:00').getTime() + (2 + seed % 5) * 86400000);
  var partnersPool = ['Sudarshan Chemical Industries', 'Anthea Aromatics', 'Vivid Colloids', 'Meridian Fine Chem'];
  return {
    session: { date: sessionDate.toISOString().slice(0, 10), hour: hours[seed % hours.length], duration: durations[seed % durations.length], timezone: timezones[seed % timezones.length] },
    expertiseTags: tags,
    meetingNotes: 'I want to know more about the ' + (req.productName || 'process') + ' scale-up considerations.',
    keyPoints: [
      'Confirmed feasibility of the proposed approach based on your requirements.',
      'Reviewed technical constraints and timeline expectations.'
    ],
    nextSteps: [
      'CMO Recommended: ' + partnersPool[seed % partnersPool.length],
      'Proceed with CDMO selection for pilot batch.'
    ]
  };
}

/* ---------- CMO request-details flow ---------- */
var CMO_LOG_STAGES = ['Requirement Submitted', 'Talk to our expert', 'Process Finalised', 'Partner Shortlisted', 'Commercial Proposal Getting Ready', 'Request Closed'];

function buildCmoDetail(req){
  var seed = rfqSeed(req.id);
  var expertiseTagPool = ['Hydrogenation', 'APIs', 'Fine Chemicals', 'Spray Drying', 'Crystallization', 'GMP Manufacturing'];
  var equipmentPool = ['Spray Dryer - 20kg', 'High-Shear Mixer - 200L', 'Jacketed Glass-Lined Reactor - 1000L', 'Vacuum Tray Dryer'];
  var facilityLocations = ['India', 'Vietnam', 'South Korea', 'Germany'];
  var testimonialPool = [
    { quote: 'On average, this 30-min call reduces project time by 14 days.', name: 'Sandeep R.', title: 'Head of Engineering' },
    { quote: 'The discovery call caught a scale-up risk we would have missed otherwise.', name: 'Priya M.', title: 'VP Manufacturing' },
    { quote: 'Talking to the expert upfront cut our sourcing cycle nearly in half.', name: 'Arjun K.', title: 'Director, Process R&D' }
  ];
  return {
    uploadedDoc: { name: 'Concept Note.pdf', size: (40 + seed % 200) + ' KB' },
    expertiseTags: [expertiseTagPool[seed % expertiseTagPool.length], expertiseTagPool[(seed + 2) % expertiseTagPool.length], expertiseTagPool[(seed + 4) % expertiseTagPool.length]],
    callScheduled: seed % 2 === 0,
    daysSinceRequest: 2 + (seed % 4),
    testimonial: testimonialPool[seed % testimonialPool.length],
    expertsAvailableToday: 2 + (seed % 4),
    session: { date: req.lastUpdated, hour: [10, 11, 13, 15, 16][seed % 5], duration: 30, timezone: 'ASIA/KOLKATA' },
    projectBrief: 'Here’s the details of the Project brief from the Scheduled call. This project evaluates the feasibility of scaling ' + (req.productName || 'the target compound') + ' based on your requirements for specifications, scale, and timeline. Following our discussion, we will assess technical, safety, and manufacturing considerations and recommend suitable partners to execute the process reliably and safely.',
    keyChallenges: 'Primary technical risks identified: temperature control during scale-up, byproduct formation above pilot volumes, and raw material lead time for the specified grade.',
    projectScale: 'Target batch size: ' + (10 + seed % 490) + ' kg pilot run, with a scale-up path to commercial volumes upon successful validation.',
    equipmentTags: [equipmentPool[seed % equipmentPool.length], equipmentPool[(seed + 1) % equipmentPool.length]],
    matchedFacility: {
      location: facilityLocations[seed % facilityLocations.length],
      matchScorePct: 85 + (seed % 14),
      status: 'Approved & Active',
      advantages: [
        { title: 'Proven Track Record', desc: '95%+ purity results in multi-stage synthesis.' },
        { title: 'Regulatory Compliance', desc: 'Full GMP certification & international standards.' },
        { title: 'Cost Efficiency', desc: 'Optimized parameters reduce production waste.' },
        { title: 'Timeline Assurance', desc: 'Dedicated batch scheduling for this order.' }
      ]
    },
    capabilities: {
      keyReactions: ['O-Alkylation', 'Hydrolysis to form sodium salt', 'Potassium salt formation'],
      reactorSystems: ['High-volume Glass-Lined Reactors (GLR)', 'Hydrogenation Reactor'],
      equipment: ['Centrifuge Filtration System', 'Vacuum Tray Dryer (VTD)'],
      uniqueCapabilities: ['Expertise in anhydrous condition management']
    },
    offerRounds: [buildRfqQuote(req, 0)]
  };
}

/* ---------- CDMO request-details flow ---------- */
var CDMO_LOG_STAGES = ['Requirement Submitted', 'Talk to our expert', 'Lab & Plant Match', 'Proposal Ready', 'Request Closed'];

function buildCdmoDetail(req){
  var seed = rfqSeed(req.id);
  var expertiseTagPool = ['Process Development', 'Scale-up Engineering', 'GMP Manufacturing', 'Analytical Method Development', 'Formulation Support'];
  var facilityLocations = ['India', 'Vietnam', 'South Korea', 'Germany'];
  return {
    uploadedDoc: { name: 'Concept Note.pdf', size: (40 + seed % 200) + ' KB' },
    expertiseTags: [expertiseTagPool[seed % expertiseTagPool.length], expertiseTagPool[(seed + 2) % expertiseTagPool.length]],
    session: { date: req.lastUpdated, hour: [10, 11, 13, 15, 16][seed % 5], duration: 30, timezone: 'ASIA/KOLKATA' },
    labPlantDefault: seed % 2 === 0 ? 'Plant' : 'Lab',
    matchedFacility: {
      location: facilityLocations[seed % facilityLocations.length],
      matchScorePct: 85 + (seed % 14),
      status: 'Approved & Active',
      advantages: [
        { title: 'Proven Track Record', desc: '95%+ purity results in multi-stage synthesis.' },
        { title: 'Regulatory Compliance', desc: 'Full GMP certification & international standards.' },
        { title: 'Cost Efficiency', desc: 'Optimized parameters reduce production waste.' },
        { title: 'Timeline Assurance', desc: 'Dedicated batch scheduling for this order.' }
      ]
    },
    capabilities: {
      keyReactions: ['O-Alkylation', 'Hydrolysis to form sodium salt', 'Potassium salt formation'],
      reactorSystems: ['High-volume Glass-Lined Reactors (GLR)', 'Hydrogenation Reactor'],
      equipment: ['Centrifuge Filtration System', 'Vacuum Tray Dryer (VTD)'],
      uniqueCapabilities: ['Expertise in anhydrous condition management']
    },
    offerRounds: [buildRfqQuote(req, 0)]
  };
}

/* ---------- R&D request-details flow ---------- */
var RD_LOG_STAGES = ['Requirement Submitted', 'Talk to our expert', 'Finalising Process', 'Research Partner Identified', 'Commercial Proposal Ready', 'Request Closed'];

function buildRdPricingTiers(seed){
  var basePerGram = 0.5 + (seed % 50) / 10;
  var tierDefs = [ { qty: '2.5', unit: 'gm' }, { qty: '250', unit: 'gm' }, { qty: '1', unit: 'kg' }, { qty: '15', unit: 'kg' }, { qty: '100', unit: 'kg' } ];
  var discounts = [1, 0.85, 0.7, 0.55, 0.4];
  return tierDefs.map(function(t, i){
    var grams = t.unit === 'kg' ? parseFloat(t.qty) * 1000 : parseFloat(t.qty);
    var perUnitCost = +(basePerGram * discounts[i]).toFixed(2);
    return { quantity: t.qty, unit: t.unit, currency: 'USD', cost: +(perUnitCost * grams).toFixed(2), perUnit: perUnitCost + '/' + t.unit };
  });
}

function scaleRdTiers(tiers, mult){
  return tiers.map(function(t){
    var perUnitNum = parseFloat(t.perUnit);
    var suffix = t.perUnit.replace(/^[\d.]+/, '');
    return Object.assign({}, t, { cost: +(t.cost * mult).toFixed(2), perUnit: (perUnitNum * mult).toFixed(2) + suffix });
  });
}

function buildRdDetail(req){
  var seed = rfqSeed(req.id);
  var expertiseTagPool = ['Polymer Design', 'Material Characterization', 'Performance Testing', 'Analytical Method Development', 'Formulation Design'];
  var facilityLocations = ['India', 'Vietnam', 'South Korea', 'Germany'];
  var partnerNames = ['ABC Analytical Lab', 'Meridian Research Labs', 'Vantage Bio Labs', 'Crestline R&D Center'];
  var objectives = ['Analytical & Quality Testing', 'Exploratory R&D', 'Process Optimization', 'Formulation Development'];
  var stages = ['Lab', 'Pilot', 'Bench'];
  var methodWorks = ['HPLC method development', 'GC-MS method validation', 'Rheology characterization', 'Stability protocol design'];
  return {
    uploadedDoc: { name: 'Concept Note.pdf', size: (40 + seed % 200) + ' KB' },
    expertiseTags: [expertiseTagPool[seed % expertiseTagPool.length], expertiseTagPool[(seed + 2) % expertiseTagPool.length], expertiseTagPool[(seed + 4) % expertiseTagPool.length]],
    session: { date: req.lastUpdated, hour: [10, 11, 13, 15, 16][seed % 5], duration: 30, timezone: 'ASIA/KOLKATA' },
    productKnown: seed % 2 === 0,
    projectBrief: 'Here’s the details of the Project brief from the Scheduled call. This project evaluates the feasibility of ' + (req.objective || 'the requested work').toLowerCase() + ' based on your requirements for specifications, scale, and timeline.',
    requiredCapabilities: [expertiseTagPool[seed % expertiseTagPool.length], expertiseTagPool[(seed + 1) % expertiseTagPool.length]],
    projectScale: 'Target output: ' + (5 + seed % 95) + ' g lab-scale, with a path to kg-scale upon successful validation.',
    matchedFacility: {
      location: facilityLocations[seed % facilityLocations.length],
      matchScorePct: 85 + (seed % 14),
      status: 'Approved & Active',
      partnerName: partnerNames[seed % partnerNames.length]
    },
    capabilities: {
      keyReactions: ['O-Alkylation', 'Hydrolysis to form sodium salt', 'Potassium salt formation'],
      reactorSystems: ['High-volume Glass-Lined Reactors (GLR)', 'Hydrogenation Reactor'],
      equipment: ['Centrifuge Filtration System', 'Vacuum Tray Dryer (VTD)'],
      uniqueCapabilities: ['Expertise in anhydrous condition management']
    },
    equipmentTags: ['HPLC System', 'Lyophilizer', 'Analytical Balance (0.01mg)'],
    proposalRounds: [{
      from: 'scimplify', round: 0,
      objective: objectives[seed % objectives.length],
      researchPartner: partnerNames[seed % partnerNames.length],
      stage: stages[seed % stages.length],
      leadTime: ['2-3 weeks', '3-4 weeks'][seed % 2],
      methodWork: methodWorks[seed % methodWorks.length],
      tiers: buildRdPricingTiers(seed),
      qualityAttribute: 'Purity NLT 98%. Colorless to pale yellow liquid.',
      paymentTerms: 'Advance for 3 Transactions',
      shipmentTerms: 'Ex-Factory',
      compliance: 'R&D/Non-GMP',
      specDocs: ['SDS doc.pdf', 'IFP.pdf', 'COA.pdf', 'FDS doc.pdf']
    }]
  };
}

/* Full merged dataset: user-submitted (localStorage) + seeded base + procedural fill,
   with per-type rich content attached and any saved stage-progress overrides re-applied.
   User-submitted requests are flagged isUserSubmitted so Scinode Secure never seeds fake
   demo document history onto a request the current user actually created (see
   seedDemoSecureVersions). */
function getAllRequests(){
  var userReqs = loadUserRequests().map(function(r){ r.isUserSubmitted = true; return r; });
  var list = userReqs.concat(BASE_REQUESTS).concat(generateRemainingRequests());
  var overrides = getRequestOverrides();
  return list.map(function(req){
    if (req.type === 'RFQ') req.rfq = buildRfqDetail(req);
    else if (req.type === 'Sample Request') req.rfs = buildRfsDetail(req);
    else if (req.type === 'Consultation') req.consult = buildConsultationDetail(req);
    else if (req.type === 'Manufacturing Project') req.cmo = buildCmoDetail(req);
    else if (req.type === 'CDMO Project') req.cdmo = buildCdmoDetail(req);
    else if (req.type === 'R&D Project') req.rd = buildRdDetail(req);
    var patch = overrides[req.id];
    if (patch) Object.assign(req, patch);
    return req;
  });
}

/* ---------- Scinode Secure: trust-framework overlay (all 6 request types) ----------
   Not a request stage — a security/governance layer shown alongside the existing
   stage timeline. Collaboration Requirements (NDA/NCDS/MSA) are introduced at
   specific stages per type (SECURE_STAGE_TRIGGERS) and accumulate as the request
   progresses. Each requirement carries an immutable version history rather than a
   single overwritable document (see buildSecureRequirements) so every upload/
   replace/review action is preserved, per the Scinode Secure dev spec's document
   review workflow (Pending Upload -> Under Review -> Approved/Rejected). */
var SECURE_PILLARS = [
  { code:'ip', title:'IP Protection', desc:'Protect your research, formulations, technical know-how, and proprietary documents through encrypted collaboration and controlled access.' },
  { code:'collab', title:'Secure Collaboration', desc:'Collaborate securely with authorized stakeholders using role-based permissions and controlled document visibility.' },
  { code:'legal', title:'Legal Controls', desc:'Govern collaboration through NDAs, MSAs, and other required legal agreements before sensitive information is shared.' },
  { code:'data', title:'Protected Data Exchange', desc:'Share technical documents, specifications, reports, and supporting files securely with version control and encrypted storage.' },
  { code:'security', title:'Security & Encryption', desc:'Encryption, authentication, audit logs, and continuous monitoring to protect your project data.' }
];
var SECURE_REQUIREMENT_DEFS = {
  NDA:  { purpose:'Before Technical Discussion', label:'Non-Disclosure Agreement (NDA)' },
  NCDS: { purpose:'Commercial Proposal',         label:'Non-Circumvention & Non-Disclosure (NCDS)' },
  MSA:  { purpose:'Project Execution',           label:'Master Service Agreement (MSA)' }
};
/* Per-type: stage index (within that type's own LOG_STAGES) -> requirements first introduced
   there, plus the "why you're seeing this" reason shown in the Timeline Secure Card. */
var SECURE_STAGE_TRIGGERS = {
  'RFQ': {
    2: { requirements:['NDA','NCDS'], reason:'Commercial proposals, quotations, and pricing discussions require confidentiality before they are shared.' },
    5: { requirements:['MSA'], reason:'Project execution requires a signed Master Service Agreement to formalise the engagement.' }
  },
  'Sample Request': {
    1: { requirements:['NDA'], reason:'The customer requested an NDA before sharing detailed technical specifications.' }
  },
  'Consultation': {
    1: { requirements:['NDA'], reason:'The customer requested confidential technical discussions before sharing research information.' }
  },
  'Manufacturing Project': {
    1: { requirements:['NDA'], reason:'The customer requested confidential technical discussions before sharing research information.' },
    4: { requirements:['NCDS'], reason:'Commercial proposals and pricing discussions require confidentiality before they are shared.' },
    5: { requirements:['MSA'], reason:'Project execution requires a signed Master Service Agreement to formalise the engagement.' }
  },
  'CDMO Project': {
    1: { requirements:['NDA'], reason:'The customer requested confidential technical discussions before sharing research information.' },
    3: { requirements:['NCDS'], reason:'Commercial proposals and pricing discussions require confidentiality before they are shared.' },
    4: { requirements:['MSA'], reason:'Project execution requires a signed Master Service Agreement to formalise the engagement.' }
  },
  'R&D Project': {
    1: { requirements:['NDA'], reason:'The customer requested an NDA before sharing detailed technical information.' },
    4: { requirements:['NCDS'], reason:'Commercial proposals and pricing discussions require confidentiality before they are shared.' },
    5: { requirements:['MSA'], reason:'Project execution requires a signed Master Service Agreement to formalise the engagement.' }
  }
};

function secureTriggerAt(typeKey, stageIdx){
  var triggers = SECURE_STAGE_TRIGGERS[typeKey];
  return (triggers && triggers[stageIdx]) || null;
}

/* True from the stage that first triggers Collaboration Requirements onward —
   used to mark every timeline stage header from that point on, not just the
   single triggering stage, since Secure stays active for the rest of the request. */
function secureActiveByStage(typeKey, stageIdx){
  var triggers = SECURE_STAGE_TRIGGERS[typeKey];
  if (!triggers) return false;
  for (var k = 0; k <= stageIdx; k++){
    if (triggers[k]) return true;
  }
  return false;
}

/* Deterministic demo version history for a requirement that has no real upload yet,
   shown only on seeded/procedural sample requests (never on a request the current
   user actually submitted — see isUserSubmitted in getAllRequests). Exists purely so
   the document review workflow (Under Review / Approved / Rejected) and version
   history are visible in the prototype without a real backend/admin reviewer. */
function seedDemoSecureVersions(req, code){
  /* Demo override: force NCDS to Pending Upload on RD-2026-00210 so its
     Collaboration Requirements table shows an Approved doc (NDA) and a Pending
     Upload requirement side by side — see the matching progress override above. */
  if (req.id === 'RD-2026-00210' && code === 'NCDS') return [];
  var seed = rfqSeed(req.id + code);
  var baseDate = req.createdDate || req.lastUpdated || '2026-06-01';
  function ts(daysAfterBase, offset){
    var d = new Date(baseDate + 'T00:00:00');
    d.setDate(d.getDate() + daysAfterBase);
    d.setHours(9 + ((seed + offset) % 8), ((seed + offset) * 7) % 60, 0, 0);
    return d.toISOString();
  }
  var fileBase = code + '_Agreement';
  var bucket = seed % 5;
  if (bucket === 0) return [];
  if (bucket === 1){
    return [{ version:'v1', status:'Under Review', fileName: fileBase + '_v1.pdf', uploadedBy:'You', uploadedAt: ts(1, 0), changeNote:'', reviewComment:'' }];
  }
  if (bucket === 2){
    return [{ version:'v1', status:'Approved', fileName: fileBase + '_v1.pdf', uploadedBy:'You', uploadedAt: ts(1, 0), changeNote:'', reviewComment:'Reviewed and approved. No further action required.' }];
  }
  if (bucket === 3){
    return [{ version:'v1', status:'Rejected', fileName: fileBase + '_v1.pdf', uploadedBy:'You', uploadedAt: ts(1, 0), changeNote:'', reviewComment:'Missing authorized signature. Please re-upload a signed copy.' }];
  }
  return [
    { version:'v1', status:'Rejected', fileName: fileBase + '_v1.pdf', uploadedBy:'You', uploadedAt: ts(1, 0), changeNote:'', reviewComment:'Missing authorized signature. Please re-upload a signed copy.' },
    { version:'v2', status:'Approved', fileName: fileBase + '_v2.pdf', uploadedBy:'You', uploadedAt: ts(4, 3), changeNote:'Re-uploaded with signature.', reviewComment:'Signature verified. Approved.' }
  ];
}

/* Accumulated Collaboration Requirements for a request, up to (and including) stage `uptoIdx`.
   Each requirement carries a full version array (oldest first) rather than a single
   document — nothing is ever overwritten or deleted, matching the dev spec's immutable
   versioning rule. `status`/`doc` reflect the latest (current) version. NDA/NCDS are
   customer-uploaded and go through review (Pending Upload -> Under Review -> Approved/
   Rejected). MSA is Admin-managed: always a single Approved version, view-only. */
function buildSecureRequirements(req, typeKey, uptoIdx){
  var triggers = SECURE_STAGE_TRIGGERS[typeKey];
  if (!triggers) return [];
  var uploads = req.secureUploads || {};
  var seen = {}, out = [];
  for (var idx = 0; idx <= uptoIdx; idx++){
    var t = triggers[idx];
    if (!t) continue;
    t.requirements.forEach(function(code){
      if (seen[code]) return;
      seen[code] = true;
      var def = SECURE_REQUIREMENT_DEFS[code];
      var versions;
      if (code === 'MSA'){
        versions = [{ version:'v1', status:'Approved', fileName:'MSA_Agreement.pdf', uploadedBy:'Scinode Team', uploadedAt:(req.lastUpdated || req.createdDate || '2026-06-01') + 'T10:00:00', changeNote:'', reviewComment:'' }];
      } else {
        var stored = uploads[code];
        if (stored && stored.versions && stored.versions.length) versions = stored.versions;
        else if (!req.isUserSubmitted) versions = seedDemoSecureVersions(req, code);
        else versions = [];
      }
      var current = versions.length ? versions[versions.length - 1] : null;
      out.push({
        code: code,
        purpose: def.purpose,
        label: def.label,
        ownedByCustomer: code !== 'MSA',
        status: current ? current.status : 'Pending Upload',
        versions: versions,
        doc: current
      });
    });
  }
  return out;
}

/* Persists the full (already-appended) version array for a requirement — the caller
   is expected to have read the current effective versions from buildSecureRequirements,
   appended the new version, and passed the whole array back here. Nothing is deleted;
   there is intentionally no "remove" counterpart. */
function saveSecureVersions(id, code, versions){
  var existing = (getRequestOverrides()[id] || {}).secureUploads || {};
  var uploads = Object.assign({}, existing);
  uploads[code] = { versions: versions };
  saveRequestOverride(id, { secureUploads: uploads });
}

/* "Today"/"Yesterday" read naturally in a live demo; anything older falls back to the
   same absolute format used everywhere else (formatDate). */
function relativeShareLabel(iso){
  var d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  var now = new Date();
  var startOfDay = function(x){ return new Date(x.getFullYear(), x.getMonth(), x.getDate()); };
  var diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return formatDate(iso);
}

/* ---------- Categorized document catalog (Documents tab) ----------
   Backs both sides of the Documents-tab "Flat List / Categorized" demo toggle — Flat
   List is flattenDocumentCatalog() rendered as one list, Categorized adds the All/
   Request/Product/Scinode Secure second-level nav on top of the same data. Three real
   domains: Request (Commercial Proposal / Meeting Notes — Admin-only; Purchase Orders —
   customer-uploadable), Product (Admin-only), and Scinode Secure. The Secure entries are
   read straight from buildSecureRequirements — same source of truth as the Secure
   Vault/Timeline — so this is a second VIEW of real Secure data, never a second fake
   Secure dataset living in parallel. */
var REQUEST_MEETING_POOL = [
  { name:'Technical Discussion Notes', ext:'pdf' },
  { name:'Kickoff Call Summary', ext:'pdf' },
  { name:'Process Review Minutes', ext:'pdf' }
];
var PRODUCT_DOC_POOL = [
  { name:'Product Specification', ext:'pdf' },
  { name:'Certificate of Analysis', ext:'pdf' },
  { name:'Technical Data Sheet', ext:'pdf' },
  { name:'Safety Data Sheet', ext:'pdf' }
];
var CATALOG_DAY_OFFSETS = [0, 1, 4, 9, 15, 22];
function catalogDateFor(offsetIdx){
  var d = new Date();
  d.setDate(d.getDate() - CATALOG_DAY_OFFSETS[Math.min(offsetIdx, CATALOG_DAY_OFFSETS.length - 1)]);
  return d.toISOString().slice(0, 10);
}
function buildDocumentCatalog(req, secureCurrentIdx){
  var seed = rfqSeed(req.id + 'CATALOG');
  var expertName = (req.expert && req.expert.name) || 'Scinode Team';

  var proposal = [{
    name:'Commercial Proposal.pdf', ext:'pdf', type:'PDF',
    sharedOnDate: catalogDateFor(0), sharedBy:'Scinode Team', isNew:true
  }];

  var meetingCount = 1 + (seed % 2);
  var meeting = [];
  for (var m = 0; m < meetingCount; m++){
    var mp = REQUEST_MEETING_POOL[(seed + m) % REQUEST_MEETING_POOL.length];
    meeting.push({ name:mp.name + '.' + mp.ext, ext:mp.ext, type:mp.ext.toUpperCase(), sharedOnDate: catalogDateFor(m + 1), sharedBy: expertName, isNew:false });
  }

  var poCount = 1 + ((seed >> 2) % 2);
  var po = [];
  for (var p = 0; p < poCount; p++){
    po.push({ name:'PO-2026-' + ('00' + (p + 1)).slice(-3) + '.pdf', ext:'pdf', type:'PDF', sharedOnDate: catalogDateFor(p + 2), sharedBy:'You', isNew:false });
  }

  var productCount = 3 + (seed % 2);
  var product = [];
  for (var q = 0; q < productCount; q++){
    var pp = PRODUCT_DOC_POOL[q % PRODUCT_DOC_POOL.length];
    product.push({ name:pp.name + '.' + pp.ext, ext:pp.ext, type:pp.ext.toUpperCase(), sharedOnDate: catalogDateFor(q + 1), sharedBy:'Scinode Team', isNew:(q === 0) });
  }

  var requirements = buildSecureRequirements(req, req.type, secureCurrentIdx);
  var secure = requirements.filter(function(r){ return r.doc; }).map(function(r){
    return {
      name: r.doc.fileName, ext:'pdf', type:'PDF',
      sharedOnDate: (r.doc.uploadedAt || '').slice(0, 10),
      sharedBy: r.doc.uploadedBy === 'You' ? 'You' : 'Scinode Team',
      isNew:false, secureStatus: r.status
    };
  });

  return { request:{ proposal:proposal, meeting:meeting, po:po }, product:product, secure:secure };
}
function documentCatalogCounts(catalog){
  var requestCount = catalog.request.proposal.length + catalog.request.meeting.length + catalog.request.po.length;
  var productCount = catalog.product.length;
  var secureCount = catalog.secure.length;
  return { all: requestCount + productCount + secureCount, request:requestCount, product:productCount, secure:secureCount };
}
function flattenDocumentCatalog(catalog){
  var out = [];
  catalog.request.proposal.forEach(function(d){ out.push(Object.assign({ category:'request' }, d)); });
  catalog.request.meeting.forEach(function(d){ out.push(Object.assign({ category:'request' }, d)); });
  catalog.request.po.forEach(function(d){ out.push(Object.assign({ category:'request' }, d)); });
  catalog.product.forEach(function(d){ out.push(Object.assign({ category:'product' }, d)); });
  catalog.secure.forEach(function(d){ out.push(Object.assign({ category:'secure' }, d)); });
  out.sort(function(a, b){ return a.sharedOnDate < b.sharedOnDate ? 1 : a.sharedOnDate > b.sharedOnDate ? -1 : 0; });
  return out;
}

function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function formatDate(iso){
  if (!iso) return '';
  var d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}
