const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = (match[2] || '').trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const INCUBATOR_ID = '1d96fade-187a-427c-9f92-c120345cad08';

const startupsData = [
  {
    submittedAt: '2024-12-17T12:28:03.000Z',
    startup_name: 'The Indi Mums',
    founder: {
      first_name: 'Saumya',
      last_name: 'Nair Rajesh',
      full_name: 'Saumya Nair Rajesh',
      email: 'theindimums@gmail.com',
      phone: '7304678116'
    },
    website: 'https://theindimums.com/',
    pitch_deck_url: 'https://drive.google.com/open?id=1SV5H7yiwgJhSrIfm6a_PulVs1oo1U_tO',
    sector: 'Healthcare',
    business_model: 'Product Based',
    stage: 'Revenue', // Already Launched
    tagline: 'the indi mums',
    description: 'The Indi Mums is an Indian babycare brand that makes conscious and natural products for babies & kids aged 0-5 years. What sets the brand apart is its novel approach toward products and fresh take on Indian Herbs . Currently we have launched our Soapnut (Reetha) based babies and kids products.',
    problem_statement: 'Need for conscious, chemical-free and natural babycare products specifically formulated for babies and kids aged 0-5 years.',
    solution_description: 'Novel approach toward babycare with a fresh take on Indian herbs, featuring Soapnut (Reetha) based baby & kids products.',
    target_market: 'Indian babycare and kids personal care market (0-5 years).',
    investor_type: 'Angel Investor',
    market_highlights: 'Novel take on Indian herbs (Soapnut/Reetha). Product already launched in market.',
    team_members: [
      { name: 'Saumya Nair Rajesh', role: 'Founder' }
    ],
    team_size: 1,
    initials: 'TI',
    logo_color: '#EC4899'
  },
  {
    submittedAt: '2025-01-21T13:10:14.000Z',
    startup_name: 'CensorX',
    founder: {
      first_name: 'Mohammad',
      last_name: 'Ashar',
      full_name: 'Mohammad Ashar',
      email: 'mohammad.ashar.0911@gmail.com',
      phone: '8454800911'
    },
    website: null,
    pitch_deck_url: 'https://drive.google.com/open?id=1GzSAPZCmUahncazGltfaLmkyWjeaSg8R',
    sector: 'IT',
    business_model: 'Service Based',
    stage: 'MVP', // Partially Developed
    tagline: 'CensorX : "Censoring the ****** content"',
    description: 'Real-time detection and blocking of harmful content across audio, image, video, and text using AI-powered speech recognition, image recognition, OCR and NLP. This model supports censorship in English as well as low-resource languages like Hindi, Hinglish, Marathi, etc .\nKey Features :\nCustomizable blocking of content across various categories.\nParental ( ADMIN ) control up to three devices.\nmonthly report of content which is exposed to your child.\nAlert messages in case of sensitive browsing done by the child.',
    problem_statement: 'Harmful content exposure across multimedia (audio, image, video, text) on children devices and lack of local language censorship.',
    solution_description: 'Real-time AI detection and blocking of harmful content across audio, image, video, and text in English, Hindi, Hinglish, and Marathi with parental admin controls and alerts.',
    target_market: 'Parental control, education technology, and digital device safety.',
    investor_type: 'Angel Investor',
    market_highlights: 'Refer to pitch deck. Supports English and regional languages like Hindi, Hinglish, Marathi.',
    team_members: [
      { name: 'Mohammad Ashar', role: 'Founder' },
      { name: 'Aqsa Shah', role: 'Co-founder (ECS, 22EC03)' },
      { name: 'Shaikh Tabish', role: 'Co-founder (Computer Engineering, 21CO52)' }
    ],
    team_size: 3,
    initials: 'CX',
    logo_color: '#6366F1'
  },
  {
    submittedAt: '2025-02-13T23:51:56.000Z',
    startup_name: 'GrindUp',
    founder: {
      first_name: 'Dhanashree',
      last_name: 'Paste',
      full_name: 'Dhanashree Paste',
      email: '07grindup@gmail.com',
      phone: '9372789670'
    },
    website: null,
    pitch_deck_url: 'https://drive.google.com/open?id=1hJchdTIzvuCiZbWiKwNZSyt5bp9bXefL',
    sector: 'EdTech',
    business_model: 'Service Based',
    stage: 'MVP', // Partially Developed
    tagline: 'Get a suitable job on basis of your learning ability',
    description: 'GrindUP is an innovative talent management platform designed to revolutionize skill-based hiring and career growth. Our app bridges the gap between education, industry demands, and jobseekers by focusing on data-driven hiring solutions which can be accessed by colleges, jobseekers and recruiters.\nVision - “To create a future where every individual’s true potential is recognized, bridging the gap between education and industry, and fostering sustainable, data-driven career growth.”\nMission - “Our mission is to revolutionize employability by providing a platform that empowers job seekers with continuous opportunities, equips recruiters with advanced tools for smarter hiring, and connects academia with industry to build a thriving ecosystem of mentorship, learning, and professional success.”',
    problem_statement: 'Bridging the disconnect between academic education, evolving industry demands, and jobseeker employability.',
    solution_description: 'Data-driven talent management platform empowering skill-based hiring, continuous learning metrics, and recruiter connectivity.',
    target_market: 'Colleges, jobseekers, recruiters, and corporate training ecosystems.',
    investor_type: 'Angel Investor',
    market_highlights: 'Grindup focuses on continuous learning and flexibility with changing industry requirements.',
    team_members: [
      { name: 'Dhanashree Paste', role: 'Founder & CEO' },
      { name: 'Sanjana Pradhan', role: 'UI/UX Designer' },
      { name: 'Yashika Tambe', role: 'Frontend Developer' },
      { name: 'Gaurav Patil', role: 'QA & Tester' }
    ],
    team_size: 4,
    initials: 'GU',
    logo_color: '#10B981'
  },
  {
    submittedAt: '2025-06-21T12:02:06.000Z',
    startup_name: 'Mplus',
    founder: {
      first_name: 'Kalidas',
      last_name: 'Maske',
      full_name: 'Kalidas Maske',
      email: 'maske.kalidas123@gmail.com',
      phone: '9307638488'
    },
    website: 'https://play.google.com/store/apps/details?id=com.mplusapp.user',
    pitch_deck_url: 'https://drive.google.com/open?id=19YEA0gvuFT8mLajahboz7zrlaggRkv0',
    sector: 'Others',
    business_model: 'Service Based',
    stage: 'MVP', // Partially Developed
    tagline: 'Book Offline services in real time from Mobile App',
    description: 'MPlus is a unified appointment booking platform designed to digitize offline service sectors such as salons, hospitals, banks, restaurants, and more. Our goal is to eliminate long wait times and unstructured queues by enabling users to book time slots in advance through a user-friendly mobile app. This not only enhances customer convenience but also improves operational efficiency for service providers.',
    problem_statement: 'Unstructured queues, unpredictable waiting times, and operational inefficiencies across offline service providers.',
    solution_description: 'Unified mobile appointment booking app digitizing queue management across salons, clinics, banks, and restaurants.',
    target_market: 'Offline retail, beauty, healthcare, and banking services; estimated $20B market potential.',
    investor_type: 'Seed',
    market_highlights: '1. No direct competition yet. 2. Market potential $20B. 3. Save time, add comfort.',
    team_members: [
      { name: 'Kalidas Maske', role: 'Founder' }
    ],
    team_size: 1,
    initials: 'MP',
    logo_color: '#0284C7'
  },
  {
    submittedAt: '2025-07-05T09:14:08.000Z',
    startup_name: 'Neutraceuticals(Harira)',
    founder: {
      first_name: 'Juveria',
      last_name: 'Zubair Khan',
      full_name: 'Juveria Zubair Khan',
      email: 'jia28119@gmail.com',
      phone: '9867614116'
    },
    website: null,
    pitch_deck_url: null,
    sector: 'Food',
    business_model: 'Product Based',
    stage: 'MVP', // Partially Developed
    tagline: 'Harira - Get one stop traditional health solution for modern world .',
    description: 'Harira - Get one stop traditional health solution for modern world. Formulations inspired by traditional remedies such as Talbina, providing an easy-to-consume superfood for mind and body vitality.',
    problem_statement: 'Lack of accessible, wholesome, and traditional natural remedies for modern lifestyle health conditions.',
    solution_description: 'Nutraceutical superfoods based on traditional Harira and Talbina formulated for modern consumers.',
    target_market: 'Preventative health, wellness, and traditional dietary supplements.',
    investor_type: 'Seed',
    market_highlights: '1. Talbina. 2. Easy to achieve a healthy mind and body. 3. Traditionally beloved health solution.',
    team_members: [
      { name: 'Juveria Zubair Khan', role: 'Founder (D.pharmacy 23DP19)' },
      { name: 'Dr. Shaikh Abusufiyan', role: 'Guide' }
    ],
    team_size: 2,
    initials: 'NH',
    logo_color: '#F59E0B'
  },
  {
    submittedAt: '2025-07-18T18:07:40.000Z',
    startup_name: 'VPU',
    founder: {
      first_name: 'Owais',
      last_name: 'Ashfaque Shaikh',
      full_name: 'Owais Ashfaque Shaikh',
      email: 'owaisshaikh8454@gmail.com',
      phone: '8454091698'
    },
    website: null,
    pitch_deck_url: null,
    sector: 'Human Resource',
    business_model: 'Service Based',
    stage: 'Idea', // Still an Idea
    tagline: 'Reach out to a person who can fix your problem ex(plumber, Electrician, Ac,fridge Washing Machine repairing etc)',
    description: 'On-demand home maintenance and repairs ecosystem. Connects users to verified service pros (plumber, electrician, AC, fridge, washing machine repairs) and simultaneously connects pros with local vendors for buying repair materials without delays.',
    problem_statement: 'Difficulty finding reliable home repair professionals on short notice, combined with technician material sourcing delays.',
    solution_description: 'End-to-end platform connecting homeowners with service professionals, and linking professionals to parts vendors.',
    target_market: 'Home services, maintenance, appliance repairs, and local hardware retail.',
    investor_type: 'Series A-F',
    market_highlights: 'Dual-network architecture: connects users to pros, and pros to parts vendors.',
    team_members: [
      { name: 'Owais Ashfaque Shaikh', role: 'Founder (Department CO, Roll No. 24CO82)' },
      { name: 'Momin Jishan Shakil', role: 'Co-founder (Department CO, Roll No. 24CO78)' }
    ],
    team_size: 2,
    initials: 'VP',
    logo_color: '#8B5CF6'
  },
  {
    submittedAt: '2025-07-27T14:32:06.000Z',
    startup_name: 'CompaniOn',
    founder: {
      first_name: 'Dhanse',
      last_name: 'Rida',
      full_name: 'Dhanse Rida',
      email: 'dhanserida@gmail.com',
      phone: '7387319737'
    },
    website: null,
    pitch_deck_url: null,
    sector: 'Human Resource',
    business_model: 'Service Based',
    stage: 'Idea', // Still an Idea
    tagline: 'Book a Companion in real time, Because Sometimes You just need Someone',
    description: 'A platform that connects people who need help with specific, one-time tasks — like hospital visits, mobility support, grocery shopping, or simple companionship — to trusted helpers nearby. Whether you need one person or four, for an hour or a day, our app lets you book the right support, right when you need it. It’s help without the hassle — personal, safe, and on-demand.',
    problem_statement: 'Need for safe, trusted, and flexible on-demand personal assistance for one-time physical accompaniment and mobility tasks.',
    solution_description: 'On-demand peer assistance and companionship network enabling hourly bookings for hospital visits, errands, and social support.',
    target_market: 'Senior citizens, solo patients, busy individuals, and micro-gig task workers.',
    investor_type: 'Angel Investor',
    market_highlights: '1. Urban Company and TaskRabbit comparison. 2. High demand. 3. Makes asking for help easy, safe, on-demand.',
    team_members: [
      { name: 'Dhanse Rida Zahir', role: 'Founder (Data Science 24DS02)' }
    ],
    team_size: 1,
    initials: 'CO',
    logo_color: '#3B82F6'
  },
  {
    submittedAt: '2025-09-16T23:32:32.000Z',
    startup_name: 'DROVA',
    founder: {
      first_name: 'Shehneel',
      last_name: 'Pawaskar',
      full_name: 'Shehneel Pawaskar',
      email: 'pawaskarshehneel@gmail.com',
      phone: '9619878927'
    },
    website: null,
    pitch_deck_url: 'https://drive.google.com/open?id=1ql3cVTSPIoN5I_3nhOF-w0FnK5fX0DKP',
    sector: 'Fashion',
    business_model: 'Service Based',
    stage: 'Idea', // Still an Idea
    tagline: 'Fastest Fashion Delivery App',
    description: 'DROVA is the fastest fashion delivery app that brings clothes, shoes, and accessories from nearby boutiques straight to your door in under an hour. We connect local stores and big brands to shoppers through real-time inventory tracking and a quick delivery network so last minute outfit needs are never a problem.',
    problem_statement: 'Traditional fashion delivery takes multiple days; urgent last-minute outfit needs have no quick commerce solution.',
    solution_description: 'Under 1-hour fashion delivery network linking nearby boutiques with real-time inventory integration.',
    target_market: 'Quick commerce fashion buyers; estimated $45B market opportunity by 2030.',
    investor_type: 'Seed',
    market_highlights: 'Competes with Myntra & Ajio with <1 hour delivery vs multi-day delivery. $45B market projected by 2030.',
    team_members: [
      { name: 'Shehneel Pawaskar', role: 'Founder (ECE 25DECE12)' }
    ],
    team_size: 1,
    initials: 'DR',
    logo_color: '#D97706'
  },
  {
    submittedAt: '2025-11-06T21:38:52.000Z',
    startup_name: 'komunity',
    founder: {
      first_name: 'Khan Abdul',
      last_name: 'Rehman',
      full_name: 'Khan Abdul Rehman',
      email: 'arktechsolution7@gmail.com',
      phone: '8432929626'
    },
    website: 'https://komunityapp.vercel.app/',
    pitch_deck_url: 'https://drive.google.com/open?id=1LJLPpLWiopqIxKG0lPE-Y81mX7fybj3T',
    sector: 'Others',
    business_model: 'Product Based',
    stage: 'Revenue', // Already Launched
    tagline: 'Get hire by proof-of-work, not resumes',
    description: 'Komunity (Build, Showcase & Get Hired)\nKomunity is a next gen platform for developers, founders, and creators to build projects, showcase their work, and get discovered by startups and communities, all in one place.\nIt’s not another app, it’s a creative hub for builders.\nUsers can join or create their own communities, share updates, post projects, collaborate with other makers, and even find job or freelance opportunities directly through their profile.\nWith Komunity, every developer gets visibility beyond LinkedIn, your work speaks louder than your resume.\nCore Features\n• Communities: Join or start your own tech/startup space.\n• Projects: Showcase your work, progress, and collaborations.\n• Discovery: Find other builders, startups, and teams.\n• Updates & Chats: Real-time community engagement.\n• Hire & Get Hired: Onboard talent directly from their public proof of work.\nOur Vision\nTo become the home for every builder and startup community, where ideas grow into teams, and teams grow into companies.',
    problem_statement: 'Resumes fail to showcase real coding competency; builders struggle to get discovered by early startups and communities.',
    solution_description: 'Creative hub and proof-of-work platform where builders showcase code, collaborate, and get hired directly.',
    target_market: 'Global developers, creators, tech startups ($100M+ India, $1B Global market).',
    investor_type: 'Angel Investor',
    market_highlights: '1) Unstop, Wellfound, Unjob.ai competitor angle. 2) $100M+ India, $1B Global. 3) Hire by proof-of-work, not resumes.',
    team_members: [
      { name: 'Khan Abdul Rehman', role: 'Founder (Alumni)' },
      { name: 'Abdullah Yasin Shaikh', role: 'Co-founder' },
      { name: 'Abdullah Irfan Shaikh', role: 'Co-founder' }
    ],
    team_size: 3,
    initials: 'KM',
    logo_color: '#14B8A6'
  },
  {
    submittedAt: '2025-12-16T19:49:58.000Z',
    startup_name: 'hileofy',
    founder: {
      first_name: 'Nauman',
      last_name: 'Khan',
      full_name: 'Nauman Mujibur Rehman Khan',
      email: 'nomankhan922088@gmail.com',
      phone: '8591084313'
    },
    website: null,
    pitch_deck_url: null,
    sector: 'Healthcare',
    business_model: 'Service Based',
    stage: 'MVP', // Partially Developed
    tagline: 'All Health related tech at one place',
    description: 'This is a telemedicine and digital health platform that enables patients to book appointments, consult doctors via chat or video calls, manage medications, track health metrics, and access medical records in one app.',
    problem_statement: 'Scattered healthcare services causing fragmented patient records, difficult appointments, and disconnected care.',
    solution_description: 'Unified all-in-one telemedicine application providing appointment scheduling, chat/video consults, medication tracking, and medical record management.',
    target_market: 'Telemedicine and digital health patients; global market projected at $946B to $1.9T by 2030s.',
    investor_type: 'Seed',
    market_highlights: 'Solves scattered systems with unified healthcare. Target global digital health market $946B - $1.9T by 2030s.',
    team_members: [
      { name: 'Nauman Mujibur Rehman Khan', role: 'Founder (Diploma in AIML, 23111590059)' },
      { name: 'Motani Saad MD Zahid', role: 'Co-founder (Diploma in AIML, 23111590036)' }
    ],
    team_size: 2,
    initials: 'HF',
    logo_color: '#059669'
  }
];

async function insertAll() {
  console.log(`Starting insertion for ${startupsData.length} startups into Incubator ID: ${INCUBATOR_ID}`);

  const results = [];

  for (const item of startupsData) {
    console.log(`\nProcessing: ${item.startup_name} (${item.founder.full_name})`);

    // 1. Check if user exists in users table
    let userId = null;
    const { data: existingUser, error: uErr } = await supabase
      .from('users')
      .select('id, email')
      .ilike('email', item.founder.email.trim())
      .maybeSingle();

    if (existingUser?.id) {
      userId = existingUser.id;
      console.log(`  - Found existing user: ${userId}`);
    } else {
      const userPayload = {
        organization_id: INCUBATOR_ID,
        email: item.founder.email.trim().toLowerCase(),
        phone: item.founder.phone || null,
        first_name: item.founder.first_name,
        last_name: item.founder.last_name || null,
        full_name: item.founder.full_name,
        role: 'startup',
        is_active: true,
        email_verified: true,
        phone_verified: false
      };
      const { data: newUser, error: createUErr } = await supabase
        .from('users')
        .insert(userPayload)
        .select('id')
        .single();

      if (createUErr) {
        console.error(`  - Error creating user for ${item.founder.email}:`, createUErr);
        throw createUErr;
      }
      userId = newUser.id;
      console.log(`  - Created user in users table: ${userId}`);
    }

    // 2. Ensure user_roles has startup_founder role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', INCUBATOR_ID)
      .maybeSingle();

    if (!existingRole) {
      const { error: roleErr } = await supabase.from('user_roles').insert({
        user_id: userId,
        organization_id: INCUBATOR_ID,
        role: 'startup_founder',
        permissions: {},
        is_active: true
      });
      if (roleErr) {
        console.warn(`  - Note on user_roles insert:`, roleErr.message);
      } else {
        console.log(`  - Assigned startup_founder role in user_roles table`);
      }
    }

    // 3. Insert or update startups table
    let startupId = null;
    const { data: existingStartup } = await supabase
      .from('startups')
      .select('id')
      .eq('organization_id', INCUBATOR_ID)
      .ilike('startup_name', item.startup_name)
      .maybeSingle();

    const startupPayload = {
      organization_id: INCUBATOR_ID,
      startup_name: item.startup_name,
      founder_id: userId,
      founder_email: item.founder.email.toLowerCase(),
      founder_phone: item.founder.phone,
      founder_name: item.founder.full_name,
      website: item.website,
      pitch_deck_url: item.pitch_deck_url,
      sector: item.sector,
      business_model: item.business_model,
      stage: item.stage,
      status: 'active',
      lifecycle_stage: 'application',
      tagline: item.tagline,
      description: item.description,
      problem_statement: item.problem_statement,
      solution_description: item.solution_description,
      target_market: item.target_market,
      team_members: item.team_members,
      team_size: item.team_size,
      track: 'pre-incubator',
      batch: 'Batch 2026',
      logo_color: item.logo_color,
      initials: item.initials,
      is_active: true,
      monthly_revenue: 0,
      annual_revenue: 0,
      funding_raised: 0,
      customer_count: 0,
      mrr: 0,
      created_by: userId
    };

    if (existingStartup?.id) {
      startupId = existingStartup.id;
      const { error: updErr } = await supabase
        .from('startups')
        .update(startupPayload)
        .eq('id', startupId);
      if (updErr) {
        console.error(`  - Error updating startup ${item.startup_name}:`, updErr);
      } else {
        console.log(`  - Updated startup in startups table: ${startupId}`);
      }
    } else {
      const { data: newStartup, error: insErr } = await supabase
        .from('startups')
        .insert(startupPayload)
        .select('id')
        .single();
      if (insErr) {
        console.error(`  - Error inserting startup ${item.startup_name}:`, insErr);
        throw insErr;
      }
      startupId = newStartup.id;
      console.log(`  - Inserted startup in startups table: ${startupId}`);
    }

    // 4. Insert or update applications table
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id')
      .eq('organization_id', INCUBATOR_ID)
      .ilike('applicant_email', item.founder.email.toLowerCase())
      .maybeSingle();

    const appPayload = {
      organization_id: INCUBATOR_ID,
      startup_id: startupId,
      startup_name: item.startup_name,
      applicant_name: item.founder.full_name,
      applicant_email: item.founder.email.toLowerCase(),
      applicant_phone: item.founder.phone,
      application_type: 'pre_incubator',
      status: 'submitted',
      admission_status: 'admitted',
      created_by: userId,
      submitted_at: item.submittedAt,
      form_data: {
        startupName: item.startup_name,
        fullName: item.founder.full_name,
        email: item.founder.email,
        phone: item.founder.phone,
        website: item.website,
        sector: item.sector,
        businessModel: item.business_model,
        stage: item.stage,
        tagline: item.tagline,
        description: item.description,
        problemStatement: item.problem_statement,
        solutionDescription: item.solution_description,
        targetMarket: item.target_market,
        investorType: item.investor_type,
        marketHighlights: item.market_highlights,
        pitchDeckUrl: item.pitch_deck_url,
        teamMembers: item.team_members,
        teamSize: item.team_size
      }
    };

    if (existingApp?.id) {
      await supabase.from('applications').update(appPayload).eq('id', existingApp.id);
      console.log(`  - Updated application in applications table: ${existingApp.id}`);
    } else {
      const { data: newApp, error: appErr } = await supabase
        .from('applications')
        .insert(appPayload)
        .select('id')
        .single();
      if (appErr) {
        console.warn(`  - Note on application insert:`, appErr.message);
      } else {
        console.log(`  - Inserted application in applications table: ${newApp.id}`);
      }
    }

    results.push({
      startup_name: item.startup_name,
      founder_name: item.founder.full_name,
      founder_email: item.founder.email,
      founder_id: userId,
      startup_id: startupId,
      stage: item.stage,
      sector: item.sector
    });
  }

  console.log('\n=== INSERTION COMPLETE ===');
  console.log(`Successfully processed all ${results.length} startups!`);
  console.table(results);
}

insertAll().catch(console.error);
