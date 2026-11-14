/* Founder Tribune content. Sample stories: replace with real reporting.
   Each story has image, alt and credit fields. Remove image to fall back to a generated cover. */
window.FT = {
  config: {
    name: 'Founder Tribune',
    tagline: 'The people building companies, and how they do it',
    email: 'editor@foundertribune.com',      // where contact and pitch forms are sent
    adsEmail: 'partners@foundertribune.com',
    formEndpoint: '',                         // optional: POST URL (Formspree, your API). Empty = opens the visitor's email app
    newsletterEndpoint: '',                   // optional: POST URL for newsletter signups
    legalName: '[Company legal name]',        // the registered company that publishes Founder Tribune
    address: '[Registered postal address]',
    jurisdiction: '[State or country]',       // whose law governs the terms
    privacyEmail: 'privacy@foundertribune.com',
    correctionsEmail: 'corrections@foundertribune.com',
    breaking: { text: 'Flights resume after nationwide FAA ground stop; days of disruption expected', slug: 'faa-ground-stop-flights-resume' },  // set to null to hide the bar
    social: { LinkedIn: '#', X: '#', Instagram: '#', YouTube: '#' }
  },
  sections: [
    { id: 'news',          name: 'News',          color: '#B3261E', blurb: 'The day\u2019s reporting on business, work and the economy, and what it means for people who run companies.' },
    { id: 'startups',      name: 'Startups',      color: '#1F4FD8', blurb: 'New companies, early traction and the decisions that shape the first three years.' },
    { id: 'funding',       name: 'Funding',       color: '#0A6B43', blurb: 'Who raised, from whom, on what terms, and what the money is for.' },
    { id: 'leadership',    name: 'Leadership',    color: '#7A2E8E', blurb: 'Hiring, firing, culture and the daily work of running a company.' },
    { id: 'technology',    name: 'Technology',    color: '#C9410B', blurb: 'The tools and platforms founders are betting their companies on.' },
    { id: 'money',         name: 'Money',         color: '#0B7285', blurb: 'Founder pay, equity, taxes and personal finance when your net worth is on paper.' },
    { id: 'health',        name: 'Health',        color: '#4F7F0E', blurb: 'Sleep, stress, medicine and the business of keeping people well.' },
    { id: 'entertainment', name: 'Entertainment', color: '#A32FC0', blurb: 'Film, games, music and podcasts, and the people building careers in them.' },
    { id: 'sports',        name: 'Sports',        color: '#B35C00', blurb: 'Clubs, athletes and the companies changing how sport is played and paid for.' },
    { id: 'lifestyle',     name: 'Lifestyle',     color: '#C2255C', blurb: 'Family, food, travel and life outside the cap table.' },
    { id: 'opinion',       name: 'Opinion',       color: '#3B4540', blurb: 'Arguments from founders, investors and our columnists.' }
  ],
  authors: {
    maya:   { name: 'Maya Okafor',   role: 'Editor in chief',       bio: 'Maya edits Founder Tribune and writes about how early teams make decisions.' },
    daniel: { name: 'Daniel Reyes',  role: 'Funding reporter',      bio: 'Daniel covers venture capital, term sheets and the companies on both sides of them.' },
    priya:  { name: 'Priya Nair',    role: 'Technology editor',     bio: 'Priya reports on the software and infrastructure that startups are built on.' },
    tom:    { name: 'Tom Whitfield', role: 'Leadership columnist',  bio: 'Tom spent twelve years as an operator before writing about management.' },
    lena:   { name: 'Lena Fischer',  role: 'Money and life writer', bio: 'Lena writes about founder finances and the cost of building a company.' },
    ravi:   { name: 'Ravi Menon',    role: 'News editor',           bio: 'Ravi runs the news desk and reports on policy, trade and the local economy.' },
    hannah: { name: 'Hannah Brooks',  role: 'Health reporter',       bio: 'Hannah covers health, medicine and wellbeing at work.' },
    marcus: { name: 'Marcus Cole',    role: 'Culture and sports writer', bio: 'Marcus writes about entertainment, sport and the businesses behind both.' },
    desk:   { name: 'Tribune News Desk', role: 'Staff report',          bio: 'News desk stories are compiled from the published sources listed with each story and checked by an editor.' },
    omar:   { name: 'Omar Haddad',   role: 'Staff writer',          bio: 'Omar profiles first-time founders outside the usual startup capitals.' }
  },
  wire: [
    { co: 'Harborline',     sector: 'Freight software',   round: 'Series B', amt: '$42M',  lead: 'Northgate Partners', date: '2026-11-11' },
    { co: 'Tessel Health',  sector: 'Clinic operations',  round: 'Series A', amt: '$18M',  lead: 'Juniper Ventures',   date: '2026-11-10' },
    { co: 'Plainsight Pay', sector: 'Payroll',            round: 'Seed',     amt: '$6.5M', lead: 'First Ledger',       date: '2026-11-10' },
    { co: 'Kiln & Co',      sector: 'Consumer goods',     round: 'Series A', amt: '$12M',  lead: 'Maple Row Capital',  date: '2026-11-09' },
    { co: 'Orchard Grid',   sector: 'Energy storage',     round: 'Series C', amt: '$90M',  lead: 'Calder Growth',      date: '2026-11-06' },
    { co: 'Lumen Desk',     sector: 'Customer support',   round: 'Seed',     amt: '$4M',   lead: 'Angel syndicate',    date: '2026-11-05' },
    { co: 'Farrow Robotics',sector: 'Warehouse robots',   round: 'Series B', amt: '$55M',  lead: 'Ironbridge',         date: '2026-11-04' },
    { co: 'Sable Learning', sector: 'Workforce training', round: 'Pre-seed', amt: '$1.8M', lead: 'Open Door Fund',     date: '2026-11-03' }
  ],
  articles: [
    { slug: 'harborline-series-b', image: 'assets/img/stories/harborline-series-b.jpg', alt: "Trucks and trailers parked in front of a warehouse", credit: { name: "Troy Mortier", url: 'https://unsplash.com/@troyscanon?utm_source=founder_tribune&utm_medium=referral' }, section: 'funding', author: 'daniel', date: '2026-11-11', read: 6, featured: true,
      title: 'Harborline raises $42 million to put small freight brokers on one screen',
      dek: 'Founder Ana Castellanos turned down two larger offers to keep control of the board. She explains the trade.',
      body: [
        'Ana Castellanos spent her first two years as a founder driving to freight offices in the Midwest with a laptop and a list of questions. The brokers she met ran their businesses from email, a phone and spreadsheets that only one person in the office understood.',
        'Harborline, the company that came out of those visits, now handles scheduling, carrier payments and customs paperwork for about 900 small brokerages. On Tuesday it announced a $42 million Series B led by Northgate Partners.',
        '## Why she took the smaller cheque',
        'Castellanos says two other firms offered more money at a higher valuation. Both wanted a second board seat. She declined.',
        '> A higher price felt good for one afternoon. A board I could not outvote would have felt bad for ten years.',
        'The round leaves founders and employees with a majority of board votes. Northgate partner Idris Vance says the firm accepted the terms because the company is already close to break-even and did not need the money to survive.',
        '## What the money is for',
        'About half will go to hiring engineers for a customs product due next spring. The rest funds a sales team in Mexico and Canada, where most of Harborline’s cross-border customers already operate.',
        'Castellanos says she will not raise again unless the company chooses to buy a competitor. “We built this to be a business,” she says. “Fundraising is something that happens to it now and then.”'
      ],
      takeaways: ['Harborline raised $42M at Series B, led by Northgate Partners.', 'The founder rejected larger offers that required a second investor board seat.', 'Funds go to a customs product and expansion into Mexico and Canada.'] },

    { slug: 'kitchen-table-to-40-stores', image: 'assets/img/stories/kitchen-table-to-40-stores.jpg', alt: "A potter's wheel spinning beside bowls of clay tools", credit: { name: "Taylor Heery", url: 'https://unsplash.com/@taylorheeryphoto?utm_source=founder_tribune&utm_medium=referral' }, section: 'startups', author: 'omar', date: '2026-11-10', read: 8, featured: true, interview: true,
      title: 'From a kitchen table to 40 stores in 18 months',
      dek: 'Kiln & Co founder Rosa Delgado on selling ceramics wholesale before she had a website, and why she still packs orders on Fridays.',
      quote: 'I packed the first thousand orders myself. That is how I learned what customers complain about before they complain.',
      body: [
        'Rosa Delgado did not plan to start a company. She planned to sell forty mugs at a weekend market to cover the cost of a kiln. A buyer for a regional home store walked past, asked for a price list and placed an order for six hundred.',
        'She did not have a price list. She wrote one that night.',
        '## Wholesale first',
        'Most consumer brands start online and move into stores later. Delgado did the reverse because stores paid in thirty days and a website would have taken months to earn the same amount.',
        '> I packed the first thousand orders myself. That is how I learned what customers complain about before they complain.',
        'Kiln & Co now sells in 40 stores and employs 22 people at a workshop outside Albuquerque. Delgado still packs orders every Friday, a habit her operations lead has asked her, politely, to stop.',
        '## What she would do differently',
        'She says she waited too long to hire a bookkeeper and spent a year not knowing which products made money. Two of her best sellers turned out to lose a dollar each.',
        'Her advice to founders selling physical goods is short: know your cost per unit to the cent before you take a large order.'
      ],
      takeaways: ['Selling wholesale first gave Kiln & Co faster cash than a direct website.', 'The founder found two best sellers were losing money once a bookkeeper was hired.', 'Know your unit cost before accepting a large order.'] },

    { slug: 'four-day-week-18-months', image: 'assets/img/stories/four-day-week-18-months.jpg', alt: "Four coworkers around a laptop at a table", credit: { name: "Jud Mackrill", url: 'https://unsplash.com/@judmackrill?utm_source=founder_tribune&utm_medium=referral' }, section: 'leadership', author: 'tom', date: '2026-11-09', read: 7, featured: true,
      title: 'We ran a four-day week for 18 months. Here is what broke',
      dek: 'Lumen Desk kept the shorter week, but only after rewriting how the support team hands over work.',
      body: [
        'When Lumen Desk moved its 34 employees to a four-day week, co-founder Hugo Marchetti expected sales to complain first. It was the support team.',
        'Customers still wrote in on Fridays. The team split into two shifts to cover the gap, and within a month people on different shifts were answering the same tickets twice.',
        '## The fix was a document',
        'Marchetti says the answer was a one-page handover note written at the end of every shift. It lists open tickets, what was promised to whom and anything odd.',
        '> The four-day week did not fail. Our handovers failed, and the short week showed us.',
        'Output per person is roughly level with the five-day period, according to figures the company shared. Resignations fell from seven in the prior 18 months to two.',
        'Marchetti does not recommend the change to every company. Teams that depend on live coverage, he says, should fix their handovers first and shorten the week second.'
      ] },

    { slug: 'ai-agents-back-office', image: 'assets/img/stories/ai-agents-back-office.jpg', alt: "A laptop on a desk after work", credit: { name: "Luca Bravo", url: 'https://unsplash.com/@lucabravo?utm_source=founder_tribune&utm_medium=referral' }, section: 'technology', author: 'priya', date: '2026-11-11', read: 5,
      title: 'Small companies are handing the back office to AI agents. The invoices tell the story',
      dek: 'Three founders opened their books to show what automation saved, what it cost and where it made mistakes.',
      body: [
        'Tessel Health has eleven employees and no finance team. An AI agent matches invoices to purchase orders, flags the ones that do not agree and drafts the payment run for a human to approve.',
        'Founder Dr. Wen Zhao says the setup saves about thirty hours a month. It also paid one supplier twice in March, an error a person caught four days later.',
        '## Where it works',
        'All three founders we spoke to use agents for the same jobs: matching documents, chasing late payments and preparing reports. None lets software approve a payment alone.',
        '> It is a very fast junior employee who never gets bored and occasionally makes things up.',
        '## What it costs',
        'Monthly bills ranged from $400 to $2,300, mostly driven by how many documents were processed. Each founder said the cost was lower than a part-time hire, and each kept a person in the approval step.'
      ] },

    { slug: 'founder-salary-what-to-pay-yourself', image: 'assets/img/stories/founder-salary-what-to-pay-yourself.jpg', alt: "A person holding paperwork beside a pen and calculator", credit: { name: "Kelly Sikkema", url: 'https://unsplash.com/@kellysikkema?utm_source=founder_tribune&utm_medium=referral' }, section: 'money', author: 'lena', date: '2026-11-08', read: 6,
      title: 'What should a founder pay themselves? Forty founders shared their numbers',
      dek: 'Pay rose with each funding round, but the widest gap was between founders who had savings and those who did not.',
      body: [
        'We asked forty founders what they paid themselves at each stage of their company. Most answered on the condition that we not name them.',
        'Before any outside funding, more than half paid themselves nothing. After a seed round the typical salary in our group was close to $95,000, and after Series A it was about $150,000.',
        '## Savings mattered more than stage',
        'Founders with a year of living costs saved were far more likely to take a low salary for longer. Those without savings set their pay higher from the first round, and several said investors questioned it.',
        '> Nobody tells you that a low salary is a privilege. I could not afford to look that committed.',
        'This was a small group and not a survey of the whole market. It does suggest a practical rule several founders repeated: set pay at the level where money stops being a daily worry, and say so plainly to your board.'
      ] },

    { slug: 'founders-who-sleep', image: 'assets/img/stories/founders-who-sleep.jpg', alt: "A runner on a waterfront path in the city", credit: { name: "Zoshua Colah", url: 'https://unsplash.com/@zoshuacolah?utm_source=founder_tribune&utm_medium=referral' }, section: 'lifestyle', author: 'lena', date: '2026-11-07', read: 4,
      title: 'The founders who decided to sleep',
      dek: 'Five people who run growing companies describe the routines that replaced the all-nighter.',
      body: [
        'Farrow Robotics chief executive Nadia Brandt used to answer email at two in the morning. Her co-founder asked her to stop after she approved the wrong version of a contract.',
        'She now leaves her phone in the kitchen at ten. The company, she points out, has grown faster since.',
        '## Small rules, kept',
        'None of the five founders described anything elaborate. One blocks the first hour of the day for exercise. Another refuses meetings after four on Fridays. A third takes one full week off each quarter and tells investors in advance.',
        '> I thought being tired was proof I was working. It was only proof I was tired.',
        'Each of them said the hardest part was the first month, when the old habit still felt like commitment.'
      ] },

    { slug: 'stop-calling-it-a-pivot', image: 'assets/img/stories/stop-calling-it-a-pivot.jpg', alt: "A person arranging paper notes on a board", credit: { name: "Alvaro Reyes", url: 'https://unsplash.com/@alvarordesign?utm_source=founder_tribune&utm_medium=referral' }, section: 'opinion', author: 'maya', date: '2026-11-10', read: 4,
      title: 'Stop calling it a pivot. You were wrong, and that is fine',
      dek: 'The word lets founders skip the useful part, which is working out why the first idea failed.',
      body: [
        'A founder told me last month that her company had “pivoted” three times. When I asked what she had learned from the first version, she could not say.',
        'The word has become a way to change direction without admitting a mistake. That is a loss, because the mistake is where the information is.',
        '## Write the post-mortem first',
        'Before you announce a new direction, write one page on the old one. Who did you think would buy it? Who did? What did you believe that turned out to be false?',
        'Investors and employees forgive being wrong. They are less patient with founders who cannot explain how.'
      ] },

    { slug: 'your-first-ten-hires', image: 'assets/img/stories/your-first-ten-hires.jpg', alt: "Two people shaking hands across a desk", credit: { name: "Mina Rad", url: 'https://unsplash.com/@miinrad?utm_source=founder_tribune&utm_medium=referral' }, section: 'opinion', author: 'tom', date: '2026-11-06', read: 5,
      title: 'Your first ten hires are your culture. Your values page is a poster',
      dek: 'What a company rewards in its first year is what it becomes. Choose those ten people accordingly.',
      body: [
        'I have read hundreds of company values pages. Nearly all of them say the same six things, and none of them predicted how the company behaved.',
        'What did predict it was the first ten people hired and what they were praised for.',
        '## Watch what gets praised',
        'If the first engineer is thanked for shipping fast and breaking things, that becomes the rule. If the first salesperson is thanked for an honest “no” to a bad-fit customer, that becomes the rule too.',
        'Write the values page later. For now, decide what you will praise in public this week.'
      ] },

    { slug: 'investors-want-profit-again', image: 'assets/img/stories/investors-want-profit-again.jpg', alt: "A person signing a document", credit: { name: "Scott Graham", url: 'https://unsplash.com/@amstram?utm_source=founder_tribune&utm_medium=referral' }, section: 'opinion', author: 'daniel', date: '2026-11-04', read: 4,
      title: 'Investors say they want profit again. Check the term sheets',
      dek: 'The language has changed. The incentives inside a venture fund have not.',
      body: [
        'Every investor I interview now says the same sentence: we back efficient companies. Then I read the deals they sign.',
        'A venture fund still needs a few very large outcomes to return its money. That arithmetic pushes partners toward growth, whatever they say on stage.',
        '## What founders should ask',
        'Ask a prospective investor which of their companies chose slower growth, and what the partner did when that happened. The answer tells you more than the pitch.'
      ] },

    { slug: 'orchard-grid-series-c', image: 'assets/img/stories/orchard-grid-series-c.jpg', alt: "A solar farm seen from above", credit: { name: "Green Voltaics Solar Energy", url: 'https://unsplash.com/@greenvoltaics?utm_source=founder_tribune&utm_medium=referral' }, section: 'funding', author: 'daniel', date: '2026-11-06', read: 5,
      title: 'Orchard Grid closes $90 million to build batteries beside farms',
      dek: 'The Series C is one of the largest energy storage rounds this quarter and comes with a factory commitment in Ohio.',
      body: [
        'Orchard Grid installs battery systems on farmland and sells the stored power back to utilities during peak hours. Farmers receive rent and a share of revenue.',
        'The $90 million round, led by Calder Growth, will pay for a factory in Ohio that the company says will employ 300 people by 2028.',
        '## A slow sale that got faster',
        'Founder Callum Reid says the first twenty contracts took three years. The next two hundred took one, after utilities began publishing standard terms for small storage sites.',
        'The company is not yet profitable. Reid says it expects to be once the factory reaches full output.'
      ] },

    { slug: 'seed-rounds-getting-smaller', image: 'assets/img/stories/seed-rounds-getting-smaller.jpg', alt: "People working at laptops around a table", credit: { name: "Cherrydeck", url: 'https://unsplash.com/@cherrydeck?utm_source=founder_tribune&utm_medium=referral' }, section: 'funding', author: 'daniel', date: '2026-11-03', read: 5,
      title: 'Seed rounds are getting smaller, and some founders prefer it',
      dek: 'Cheaper tools mean a first product costs less to build. Founders are raising less and keeping more.',
      body: [
        'Sable Learning raised $1.8 million last week. Two years ago its founder, Imani Clarke, would have asked for four.',
        'She says a team of three built the first version in ten weeks with tools that did not exist when she planned the company.',
        '## Less money, more ownership',
        'Clarke and her co-founder kept 82 percent of the company after the round. Several early investors told us they now see small rounds as a sign of discipline, though others worry such companies will be short of cash if growth takes longer than planned.'
      ] },

    { slug: 'plainsight-payroll-launch', image: 'assets/img/stories/plainsight-payroll-launch.jpg', alt: "A calculator on a desk next to a laptop", credit: { name: "Jakub Żerdzicki", url: 'https://unsplash.com/@jakubzerdzicki?utm_source=founder_tribune&utm_medium=referral' }, section: 'startups', author: 'omar', date: '2026-11-08', read: 4,
      title: 'Plainsight Pay wants payroll to take one click for firms under 20 people',
      dek: 'Two former accountants built the product they wanted their clients to have.',
      body: [
        'Greta Lindqvist and Samir Patel ran a small accounting practice for nine years. Their most common call was from a client who had run payroll wrong.',
        'Plainsight Pay does one thing: it runs payroll for companies with fewer than twenty employees and files the taxes. There is no add-on marketplace and no upsell.',
        '## A narrow product on purpose',
        'Lindqvist says investors pushed them to add benefits and HR tools. They refused, and closed a $6.5 million seed round anyway.'
      ] },

    { slug: 'second-city-startups', image: 'assets/img/stories/second-city-startups.jpg', alt: "A brick building in downtown Chattanooga", credit: { name: "Kevin Dunlap", url: 'https://unsplash.com/@kevinadunlap?utm_source=founder_tribune&utm_medium=referral' }, section: 'startups', author: 'omar', date: '2026-11-05', read: 6,
      title: 'The startups choosing second cities, and what they give up',
      dek: 'Lower rent and loyal staff on one side. Fewer investors and senior hires on the other.',
      body: [
        'Farrow Robotics is based in Chattanooga. Its chief executive says the company would not exist in a more expensive city, because the first two years of rent alone would have used the seed round.',
        'The cost shows up later. Hiring a head of sales took eleven months, and the person they chose commutes by plane.',
        '## Who it suits',
        'Founders we spoke to said second cities work best for companies that build physical things or sell to local industry. Companies that need many senior software hires found it harder.'
      ] },

    { slug: 'firing-a-co-founder', image: 'assets/img/stories/firing-a-co-founder.jpg', alt: "Two colleagues in conversation", credit: { name: "Christina @ wocintechchat.com", url: 'https://unsplash.com/@wocintechchat?utm_source=founder_tribune&utm_medium=referral' }, section: 'leadership', author: 'tom', date: '2026-11-05', read: 7,
      title: 'How to part ways with a co-founder without ending the company',
      dek: 'Three founders who went through it describe what they wish they had agreed on day one.',
      body: [
        'All three founders said the same thing first: the conversation happened a year too late.',
        'In each case the co-founders had no written agreement about what would happen to shares if one left. Lawyers settled it, slowly and at great cost.',
        '## Agree it while you are friends',
        'Put vesting in writing on day one, with a four-year schedule for every founder. Agree who decides if you disagree. Review both once a year.',
        'None of the three companies failed. Each lost about six months.'
      ] },

    { slug: 'the-weekly-letter', image: 'assets/img/stories/the-weekly-letter.jpg', alt: "A laptop, mug and phone on a table", credit: { name: "Andrew Neel", url: 'https://unsplash.com/@andrewtneel?utm_source=founder_tribune&utm_medium=referral' }, section: 'leadership', author: 'maya', date: '2026-11-02', read: 4,
      title: 'The weekly letter: one habit that keeps a growing team informed',
      dek: 'A short Friday note from the chief executive replaced three recurring meetings at one 60-person company.',
      body: [
        'Every Friday at four, Tessel Health founder Dr. Wen Zhao sends the whole company a letter of about four hundred words.',
        'It covers what happened, what she is worried about and one decision she made that week, with her reasons.',
        '## Why it works',
        'Employees told us the section on worries is the one they read first. It tells them what matters before it becomes urgent.'
      ] },

    { slug: 'own-your-customer-data', image: 'assets/img/stories/own-your-customer-data.jpg', alt: "A rack of servers in a server room", credit: { name: "Kevin Ache", url: 'https://unsplash.com/@kevinache?utm_source=founder_tribune&utm_medium=referral' }, section: 'technology', author: 'priya', date: '2026-11-07', read: 5,
      title: 'Founders are moving customer data back in-house',
      dek: 'Rising platform fees and sudden rule changes are pushing small companies to keep their own records.',
      body: [
        'When a marketplace changed its terms last year, Kiln & Co lost access to the email addresses of 14,000 customers overnight.',
        'The company now keeps its own customer database and treats every platform as a sales channel only.',
        '## A modest setup',
        'Priya Nair found that most small firms need only a database, a nightly backup and one person responsible for both.'
      ] },

    { slug: 'no-code-limits', image: 'assets/img/stories/no-code-limits.jpg', alt: "Code on a computer screen", credit: { name: "Chris Ried", url: 'https://unsplash.com/@cdr6934?utm_source=founder_tribune&utm_medium=referral' }, section: 'technology', author: 'priya', date: '2026-11-03', read: 5,
      title: 'Where no-code tools stop: lessons from three rebuilds',
      dek: 'Each company launched without engineers and later rebuilt. None regrets the first version.',
      body: [
        'All three founders launched with no-code tools and reached paying customers within weeks.',
        'Each hit a limit around the same point, when they needed custom billing or more than a few thousand users.',
        '## Plan the rebuild',
        'Their shared advice: launch fast, keep your data exportable and expect to rebuild once the product has proved itself.'
      ] },

    { slug: 'equity-tax-mistakes', image: 'assets/img/stories/equity-tax-mistakes.jpg', alt: "A tax form with a pen and phone", credit: { name: "Kelly Sikkema", url: 'https://unsplash.com/@kellysikkema?utm_source=founder_tribune&utm_medium=referral' }, section: 'money', author: 'lena', date: '2026-11-04', read: 6,
      title: 'Five equity tax mistakes founders make in year one',
      dek: 'Missing one filing deadline can cost more than the first year of salary. An adviser walks through the common errors.',
      body: [
        'The most expensive mistake is also the simplest: missing the deadline to file a tax election after receiving founder shares.',
        'Advisers we spoke to listed four more, from mispricing options to forgetting state rules after moving.',
        '## Get advice early',
        'This article is general information and not tax advice. Rules differ by country and state, so speak to a qualified adviser before you act.'
      ] },

    { slug: 'founder-sabbatical', image: 'assets/img/stories/founder-sabbatical.jpg', alt: "A hiker with a backpack on a mountain trail", credit: { name: "Holly Mandarich", url: 'https://unsplash.com/@hollymandarich?utm_source=founder_tribune&utm_medium=referral' }, section: 'lifestyle', author: 'lena', date: '2026-11-01', read: 5,
      title: 'She took a month off from her own company. It kept running',
      dek: 'A planned sabbatical showed one founder which decisions only she could make. There were fewer than she thought.',
      body: [
        'Imani Clarke told her team in June that she would be away for all of August with no email.',
        'She came back to a company that had shipped two features and signed three customers.',
        '## What she learned',
        'Only two decisions had waited for her. She has since handed both to other people.'
      ] },

    { slug: 'westbridge-small-business-grants', image: 'assets/img/stories/westbridge-small-business-grants.jpg', alt: "The entrance to a city hall building", credit: { name: "Pascal Bernardon", url: 'https://unsplash.com/@pbernardon?utm_source=founder_tribune&utm_medium=referral' }, section: 'news', author: 'ravi', date: '2026-11-12', read: 5, featured: true,
      title: "Westbridge opens $20 million grant fund for small firms squeezed by rising rents",
      dek: "Businesses with fewer than 25 staff can apply from Monday. The city says decisions will take three weeks, not three months.",
      body: [
        "Westbridge city council voted 9 to 2 on Wednesday night to create a $20 million grant fund for small businesses whose rent has risen by more than 15 percent in two years.",
        "Firms with fewer than 25 employees can apply for up to $40,000 from Monday. The money can be spent on rent, wages or moving costs, and does not have to be repaid.",
        "## A faster process",
        "The city’s last support scheme was criticised for taking an average of eleven weeks to pay out. Council finance chair Dana Okoye said the new fund has a three-week target and a two-page form.",
        "> If a business needs the money in March, a cheque in June is a condolence card.",
        "Applicants need to show a lease, two years of rent statements and a payroll summary. The council has hired twelve temporary staff to process claims.",
        "## Who voted against",
        "The two councillors who opposed the fund argued it rewards landlords who raised rents. Councillor Peter Lindahl proposed tying grants to a rent freeze, an amendment that failed.",
        "Local shop owners we spoke to welcomed the money but doubted it would last. “Forty thousand covers my increase for about fourteen months,” said Amara Nwosu, who runs a print shop on Ferry Street. “Then what?”",
        "The council will publish the number of applications and payments each month."
      ],
      takeaways: ["Westbridge approved a $20M grant fund for small firms with fast-rising rents.", "Grants of up to $40,000 open Monday, with a three-week decision target.", "Critics say the fund subsidises landlords and will not last."] },

    { slug: 'calder-port-strike-ends', image: 'assets/img/stories/calder-port-strike-ends.jpg', alt: "Shipping containers at a port, seen from above", credit: { name: "Olga Subach", url: 'https://unsplash.com/@create4eyes?utm_source=founder_tribune&utm_medium=referral' }, section: 'news', author: 'ravi', date: '2026-11-11', read: 4,
      title: "Dockworkers and Calder Port reach a deal, ending a nine-day stoppage",
      dek: "Importers say it will take about three weeks to clear the backlog. Small firms without spare stock were hit hardest.",
      body: [
        "Dockworkers at Calder Port returned to work on Tuesday morning after their union and the port operator agreed a four-year contract, ending a stoppage that had lasted nine days.",
        "The deal includes a 14 percent pay rise over four years and a commitment that no jobs will be cut as a result of new automated cranes before 2029, according to a joint statement.",
        "## The backlog",
        "Forty-one ships were waiting offshore when work resumed. The port operator estimates it will take about three weeks to return to normal schedules.",
        "Harborline, a freight software company whose customers are small brokerages, said bookings through Calder fell 80 percent during the stoppage and that many customers rerouted goods by road at roughly double the cost.",
        "## Small importers",
        "Larger retailers had built up stock in advance. Smaller firms had not. Kiln & Co, a ceramics maker, said a container of glaze materials had been stuck for eight days and that it had paused two product lines.",
        "> We learned how thin our safety margin was. It was one container.",
        "Union members will vote on the contract next week. Leaders on both sides said they expect it to pass."
      ],
      takeaways: ["A nine-day stoppage at Calder Port ended with a four-year contract.", "Clearing the 41-ship backlog is expected to take about three weeks.", "Small importers without spare stock were hit hardest."] },

    { slug: 'harlow-county-broadband', image: 'assets/img/stories/harlow-county-broadband.jpg', alt: "A utility pole standing in a field", credit: { name: "Taan Huyn", url: 'https://unsplash.com/@taanhuyn?utm_source=founder_tribune&utm_medium=referral' }, section: 'news', author: 'ravi', date: '2026-11-09', read: 4,
      title: "Rural broadband project connects its 10,000th home in Harlow County",
      dek: "Local business registrations are up since the lines went in. Residents say the monthly price is the next problem.",
      body: [
        "A publicly funded broadband project in Harlow County connected its ten-thousandth home last week, two months ahead of schedule.",
        "The network, built by the county with a regional co-operative, now reaches about 70 percent of households. Before construction began three years ago, fewer than a third could get a connection fast enough for a video call.",
        "## New businesses",
        "County records show 412 new business registrations in the past twelve months, up from 268 in the year before the first lines went live. Officials caution that other factors, including people moving from cities, also played a part.",
        "Among the new firms is a four-person bookkeeping practice run from a converted barn. Its owner, Ruth Abernathy, said she previously drove forty minutes to an office to upload client files.",
        "## The price question",
        "The standard plan costs $65 a month. A county survey found that one in five connected households considers that hard to afford. The co-operative says a reduced-price plan will be offered from January.",
        "The remaining 30 percent of homes are the most remote and the most expensive to reach. The county has not yet secured funding for them."
      ] },

    { slug: 'wage-floor-small-employers', image: 'assets/img/stories/wage-floor-small-employers.jpg', alt: "A person pouring coffee into a glass jug", credit: { name: "Karl Fredrickson", url: 'https://unsplash.com/@kfred?utm_source=founder_tribune&utm_medium=referral' }, section: 'news', author: 'ravi', date: '2026-11-06', read: 4,
      title: "Survey: most small employers in the region already pay above the new wage floor",
      dek: "A poll of 600 firms found the rise will affect fewer than one in five. Cafes and care providers expect the biggest change.",
      body: [
        "Most small employers in the region already pay more than the higher minimum wage that takes effect in January, according to a survey of 600 firms by the Northfield Chamber of Commerce.",
        "Eighty-two percent said their lowest-paid worker already earns above the new rate. Among the rest, most said they would raise prices to cover the difference, and about a third said they would cut hours.",
        "## Where it bites",
        "Food service and home care reported the largest effect. Half the cafes and restaurants surveyed said at least one employee would get a rise.",
        "Leo Fontaine, who owns two cafes, said the change adds about $1,900 a month to his payroll. He plans to raise the price of a coffee by twenty cents.",
        "> I would rather explain twenty cents to customers than explain to staff why the cafe down the road pays more.",
        "## Limits of the survey",
        "The chamber’s members tend to be established businesses, so newer and very small firms may be under-represented. The chamber said it will repeat the survey six months after the change."
      ] },

    { slug: 'founder-burnout-clinic', image: 'assets/img/stories/founder-burnout-clinic.jpg', alt: "A doctor holding a stethoscope", credit: { name: "Online Marketing", url: 'https://unsplash.com/@impulsq?utm_source=founder_tribune&utm_medium=referral' }, section: 'health', author: 'hannah', date: '2026-11-12', read: 7, featured: true,
      title: "Inside the clinic that treats founder burnout like a workplace injury",
      dek: "Its doctors start with sleep, workload and money worries before anything else. Most patients arrive later than they should.",
      body: [
        "The waiting room at the Aldergate Clinic has no magazines about success. Its director, Dr. Miriam Castellano, removed them in the first week.",
        "The clinic sees people who run companies and have stopped functioning the way they used to. Castellano, an occupational physician, describes most of what she sees as the predictable result of months of short sleep, constant decisions and financial fear.",
        "## What the first appointment looks like",
        "New patients fill in a diary of one ordinary week: hours worked, hours slept, meals, exercise and who they spoke to about something other than work. Many leave the last column empty.",
        "> People expect a diagnosis. Usually the first thing I hand them is their own calendar.",
        "Doctors then check for medical causes, because exhaustion can have many, and refer patients on when they find one. Where the cause is overwork, the plan is plain: protected sleep, a real day off, and one decision handed to someone else each week.",
        "## Arriving late",
        "Castellano says the typical patient waits about a year after the first clear signs. Several told us they came only after a co-founder or partner insisted.",
        "Nadia Brandt, chief executive of Farrow Robotics, attended for three months last year. She says the most useful change was the smallest: no phone in the bedroom.",
        "This article is general information and not medical advice. If you are struggling, speak to a doctor or a qualified mental health professional."
      ],
      takeaways: ["An occupational clinic treats founder burnout by starting with sleep, workload and money worries.", "Patients typically wait about a year after the first signs before seeking help.", "Doctors rule out medical causes first and refer on when needed."] },

    { slug: 'walking-meetings-year', image: 'assets/img/stories/walking-meetings-year.jpg', alt: "People walking through a green park", credit: { name: "Alena Kalash", url: 'https://unsplash.com/@alenakalashmatina?utm_source=founder_tribune&utm_medium=referral' }, section: 'health', author: 'hannah', date: '2026-11-08', read: 5,
      title: "A 60-person company replaced its one-to-one meetings with walks for a year",
      dek: "Staff liked them more than managers expected. Notes, weather and accessibility took some working out.",
      body: [
        "Every one-to-one meeting at Lumen Desk now starts at the front door. For the past year, managers and their reports have walked a loop around the nearby park instead of sitting in a meeting room.",
        "Co-founder Hugo Marchetti introduced the rule after noticing that most of the company sat for nine hours a day, himself included.",
        "## What staff said",
        "In an internal survey shared with Founder Tribune, 71 percent of employees said they preferred walking meetings, and 12 percent preferred sitting. The rest had no preference.",
        "Several said difficult conversations were easier side by side. “You are both looking at the path,” one engineer said. “It takes the edge off.”",
        "## What had to change",
        "Taking notes was the first problem. The company now ends each walk with five minutes at a bench to write down decisions.",
        "Walks are optional, and anyone can ask for a seated or video meeting without giving a reason. Marchetti says that rule matters most, because not everyone can or wants to walk.",
        "This is one company’s experience and not a study. Marchetti says he would not claim more for it than this: people moved a bit more, and nobody asked to go back."
      ] },

    { slug: 'tessel-night-clinics', image: 'assets/img/stories/tessel-night-clinics.jpg', alt: "A member of staff walking down a hospital corridor", credit: { name: "Hush Naidoo Jade Photography", url: 'https://unsplash.com/@hush52?utm_source=founder_tribune&utm_medium=referral' }, section: 'health', author: 'hannah', date: '2026-11-05', read: 5,
      title: "Tessel Health opens night clinics for people who work shifts",
      dek: "Three sites now take appointments until 2am. The company says a fifth of bookings are after 10pm.",
      body: [
        "Tessel Health has begun opening three of its clinics until two in the morning, aimed at patients who work nights and cannot attend during the day.",
        "Founder Dr. Wen Zhao says the idea came from the company’s own missed-appointment data. Warehouse, hospitality and care workers were cancelling at more than twice the average rate.",
        "## Early numbers",
        "In the first eight weeks, about 20 percent of all bookings at the three sites were for appointments after 10pm, according to figures the company shared. Missed appointments among shift workers fell by roughly half.",
        "> We kept asking why these patients did not turn up. Then we looked at when we were open.",
        "## Staffing the late shift",
        "Night clinics are staffed by volunteers from the existing team, who are paid a premium and work no more than two late shifts a week. Zhao says recruiting for them was easier than expected, because some clinicians prefer the hours.",
        "The company plans to extend late opening to two more sites next year if demand holds. Each night clinic currently runs at a small loss."
      ] },

    { slug: 'sleep-trackers-doctors', image: 'assets/img/stories/sleep-trackers-doctors.jpg', alt: "A close-up of a smartwatch", credit: { name: "Indra Projects", url: 'https://unsplash.com/@indraprojects?utm_source=founder_tribune&utm_medium=referral' }, section: 'health', author: 'hannah', date: '2026-11-02', read: 5,
      title: "Do sleep trackers help? Three doctors on what the numbers can and cannot tell you",
      dek: "They agree the devices are good at showing habits and poor at diagnosing anything. One warns that a score can become its own source of worry.",
      body: [
        "Sleep-tracking watches and rings are now common among founders, who tend to like a number. We asked three doctors who see patients with sleep problems how useful that number is.",
        "## Good for patterns",
        "All three said trackers are reasonably good at showing when you went to bed, when you got up and how regular that is. Dr. Miriam Castellano says that alone can be useful: “People are often surprised to see they average under six hours.”",
        "## Not a diagnosis",
        "None would rely on a consumer device to identify a sleep disorder. Dr. Samuel Oyelaran, a sleep physician, said the stage-by-stage breakdowns are estimates and vary between devices.",
        "He advises anyone with loud snoring, pauses in breathing or daytime sleepiness that affects driving to see a doctor, whatever their watch says.",
        "## When the score becomes the problem",
        "Dr. Elena Voss, a psychologist, sees patients who sleep worse because they worry about their score.",
        "> If checking the number in the morning decides your mood, take the device off for a month.",
        "Their shared advice is ordinary: keep regular hours, get daylight in the morning and stop looking at the data if it makes you anxious. This article is general information and not medical advice."
      ] },

    { slug: 'lanternfish-indie-game', image: 'assets/img/stories/lanternfish-indie-game.jpg', alt: "A game controller lit by neon light", credit: { name: "Javier Martínez", url: 'https://unsplash.com/@cjdante?utm_source=founder_tribune&utm_medium=referral' }, section: 'entertainment', author: 'marcus', date: '2026-11-11', read: 7, featured: true,
      title: "A four-person studio’s game sold 300,000 copies. Then the hard part began",
      dek: "Lanternfish Games spent three years on a quiet puzzle game about a lighthouse. Success brought support tickets, tax bills and an argument about what to make next.",
      body: [
        "For three years, Lanternfish Games was four people in a rented flat making a puzzle game about a lighthouse keeper. They hoped to sell twenty thousand copies.",
        "“Tidewatch” has sold more than 300,000 since its release in the spring, according to the studio. Co-founder Ingrid Solberg says the first month was the best and worst of her working life.",
        "## Four people, nine thousand emails",
        "The studio had no support team. Within two weeks it had nine thousand unanswered emails, most about a save-file bug on one console.",
        "> We had planned for failure in detail. We had no plan at all for it going well.",
        "They hired two contractors, fixed the bug in eleven days and wrote a public apology that Solberg says did more for sales than any advert.",
        "## Money arrives late and all at once",
        "Stores pay developers weeks after a sale, and take about 30 percent. The studio’s accountant warned that a large tax bill would follow, and persuaded the founders to set half the income aside.",
        "## What next",
        "Two of the four want to make a sequel. Two want to make something new and smaller. They have agreed to spend six months on prototypes of both before deciding.",
        "Solberg says they turned down three offers to buy the studio. “We would like to find out what we are first.”"
      ],
      takeaways: ["Lanternfish Games sold 300,000 copies of its first game with a team of four.", "Unplanned success brought a support backlog and a large tax bill.", "The founders turned down three acquisition offers."] },

    { slug: 'single-screen-cinema', image: 'assets/img/stories/single-screen-cinema.jpg', alt: "Rows of red cinema seats", credit: { name: "Felix Mooneeram", url: 'https://unsplash.com/@felixmooneeram?utm_source=founder_tribune&utm_medium=referral' }, section: 'entertainment', author: 'marcus', date: '2026-11-07', read: 5,
      title: "The single-screen cinema that sold out a winter season",
      dek: "The Orpheum stopped competing on new releases and started selling membership. It now has a waiting list.",
      body: [
        "Two years ago the Orpheum, a 210-seat cinema in a market town, was losing money on every new release it showed. Its owner, Clara Whitcombe, could not match the screens or the snacks of the multiplex ten miles away.",
        "So she stopped trying. The Orpheum now shows one older film a night, chosen a season in advance, and sells most of its seats to members.",
        "## Membership, not tickets",
        "A membership costs $18 a month and includes two films. The cinema has 1,900 members and a waiting list of about 300.",
        "Predictable income changed everything, Whitcombe says. She can pay staff year-round and book films months ahead at lower rates.",
        "> People were never short of films to watch. They were short of a reason to leave the house.",
        "## The programme",
        "Each season has a theme. The winter one, courtroom dramas, sold out before it opened. Members vote on one slot a month.",
        "Whitcombe has had calls from cinema owners in other towns. Her advice is to count the seats first: “This works at two hundred. I am not sure it works at eight hundred.”"
      ] },

    { slug: 'podcast-hosts-turn-down-buyout', image: 'assets/img/stories/podcast-hosts-turn-down-buyout.jpg', alt: "A studio microphone", credit: { name: "israel palacio", url: 'https://unsplash.com/@othentikisra?utm_source=founder_tribune&utm_medium=referral' }, section: 'entertainment', author: 'marcus', date: '2026-11-04', read: 5,
      title: "Why two podcast hosts turned down a network buyout",
      dek: "The offer would have doubled their income for three years. They worked out what it would cost them in year four.",
      body: [
        "Priyanka Rao and Joel Abrams have made a weekly podcast about small business for six years. This summer a network offered to buy it.",
        "The deal would have paid them a salary roughly double what the show earns, for three years. The network would own the feed, the name and the archive.",
        "## The year-four problem",
        "Abrams built a spreadsheet. In every version, the hosts were better off for three years and worse off afterwards, because they would no longer own the thing listeners subscribe to.",
        "> They were not buying two presenters. They were buying 140,000 people who press play on Tuesdays.",
        "## What they did instead",
        "They hired a part-time ad salesperson on commission and launched a paid tier with one extra episode a month. About 4 percent of listeners signed up.",
        "Income is up by a third, less than the offer but theirs to keep. Rao says the decision would have been different if either of them had needed the money urgently.",
        "The network declined to comment on the talks."
      ] },

    { slug: 'field-festival-year-five', image: 'assets/img/stories/field-festival-year-five.jpg', alt: "A crowd in front of a festival stage at night", credit: { name: "Danny Howe", url: 'https://unsplash.com/@dannyhowe?utm_source=founder_tribune&utm_medium=referral' }, section: 'entertainment', author: 'marcus', date: '2026-11-01', read: 6,
      title: "She started a festival in a field. Year five drew 18,000 people",
      dek: "Freya Halloran on insurance, mud, and why she capped ticket sales when she could have doubled them.",
      body: [
        "The first Hollowfield festival had four bands, one food van and 600 people, most of whom knew the organiser. This year it drew 18,000 over three days.",
        "Founder Freya Halloran still runs it from a farm office with a year-round staff of five.",
        "## The cost nobody mentions",
        "Insurance is now her second-largest cost after artists. It tripled after a storm cancelled the final day in year three, and she had to refund a third of all tickets.",
        "She now sets aside 10 percent of every ticket in a weather fund. It has not been needed since.",
        "## Choosing not to grow",
        "The site could hold 35,000. Halloran capped sales at 18,000 after surveying attendees, who said queues and crowding were what they liked least about larger events.",
        "> I could sell twice the tickets and deliver half the weekend.",
        "Tickets for next year sold out in four hours. She says the cap stays."
      ] },

    { slug: 'calder-city-women-fan-owned', image: 'assets/img/stories/calder-city-women-fan-owned.jpg', alt: "A football pitch inside a stadium", credit: { name: "Vienna Reyes", url: 'https://unsplash.com/@viennachanges?utm_source=founder_tribune&utm_medium=referral' }, section: 'sports', author: 'marcus', date: '2026-11-10', read: 6, featured: true,
      title: "Fans now own a third of Calder City Women. The club is in profit for the first time",
      dek: "Four thousand supporters bought shares at $250 each. They elect two board members and voted on the ticket price.",
      body: [
        "Calder City Women finished last season in profit for the first time in the club’s history, a year after selling a third of its shares to supporters.",
        "About four thousand fans bought in at $250 a share, raising $1 million. The money paid for a training pitch and a full-time physiotherapist.",
        "## What owners get",
        "Fan shareholders elect two of the seven board members and vote on a small number of decisions each year. The first was the price of a season ticket, which they voted to hold.",
        "Chief executive Bianca Ferreira says attendance rose 40 percent. “People turn up differently when it is theirs,” she says.",
        "## The limits",
        "Fans do not pick the team or the manager. Ferreira says that line was agreed in writing before the sale and has been tested once, when a petition called for a coaching change.",
        "> Owning a share gives you a vote on the budget. It does not give you a vote on the left back.",
        "Three other clubs in the league have asked to see the share agreement. Ferreira has sent it to all of them."
      ],
      takeaways: ["Supporters bought a third of Calder City Women for $1M in total.", "The club made its first profit and attendance rose 40 percent.", "Fans vote on budget matters but not on team selection."] },

    { slug: 'sprinter-coaching-app', image: 'assets/img/stories/sprinter-coaching-app.jpg', alt: "Runners on an athletics track, seen from above", credit: { name: "Steven Lelham", url: 'https://unsplash.com/@slelham?utm_source=founder_tribune&utm_medium=referral' }, section: 'sports', author: 'marcus', date: '2026-11-06', read: 5,
      title: "A retired sprinter built a coaching app. Runners pay for the humans",
      dek: "Stride & Co tried automated training plans first. Subscribers stayed three times longer once a real coach replied.",
      body: [
        "When Tobias Lund retired from sprinting he built what he thought amateur runners wanted: an app that writes a training plan automatically.",
        "People signed up and left within about seven weeks. The plans were sound. Nobody followed them.",
        "## Adding people",
        "Lund tested a version where a human coach reviewed each runner’s week and sent a short voice message. Those subscribers stayed three times as long.",
        "> The plan was never the product. Somebody noticing you skipped Thursday was the product.",
        "Stride & Co now employs 46 part-time coaches, most of them former club athletes. Each looks after about eighty runners.",
        "## The cost",
        "A subscription is $39 a month, about four times the price of automated rivals. Lund says he lost the customers who wanted cheap and kept the ones who wanted to finish a race.",
        "The company has not raised outside money. Lund says investors want him to automate the coaches, and he has seen how that ends."
      ] },

    { slug: 'climbing-gym-ninth-site', image: 'assets/img/stories/climbing-gym-ninth-site.jpg', alt: "A climber on an indoor climbing wall", credit: { name: "Nathan Cima", url: 'https://unsplash.com/@nathan_cima?utm_source=founder_tribune&utm_medium=referral' }, section: 'sports', author: 'marcus', date: '2026-11-03', read: 5,
      title: "Climbing gyms are where people go to work now, says the founder opening her ninth",
      dek: "Ascent started adding desks and coffee when members would not leave. Daytime visits now make up a third of income.",
      body: [
        "Mei Tanaka noticed laptops before she noticed the trend. Members of her climbing gym were arriving at nine, working at the cafe tables and climbing at lunch.",
        "She added proper desks, then more of them. Ascent opens its ninth site next month, and every one since the fourth has been designed with a work area.",
        "## Filling the quiet hours",
        "Climbing gyms are busy in the evening and empty by day. Daytime membership, which includes a desk, now brings in about a third of Ascent’s income.",
        "> We were paying rent on a building that slept until five.",
        "## Not for every site",
        "It works in cities with many remote workers and poorly in suburbs, Tanaka says. Two early sites removed most of their desks.",
        "She is cautious about expansion after watching rivals open quickly and close. Ascent opens one site at a time and only when the previous one covers its costs."
      ] },

    { slug: 'phone-repair-startup', image: 'assets/img/stories/phone-repair-startup.jpg', alt: "A phone opened up for repair on a workbench", credit: { name: "insung yoon", url: 'https://unsplash.com/@insungpandora?utm_source=founder_tribune&utm_medium=referral' }, section: 'startups', author: 'omar', date: '2026-11-12', read: 5,
      title: "The repair startup betting people will fix their phones again",
      dek: "Mendwell sends a technician to your desk. Its founder says the hard part is parts, not customers.",
      body: [
        "Mendwell repairs phones and laptops at the customer’s office, usually within a day. Founder Kwame Asante started it after paying more to fix a cracked screen than the phone was worth.",
        "The company has 31 technicians in four cities and says it completed 60,000 repairs in the past year.",
        "## Offices first",
        "Asante sells to employers, who pay a monthly fee per employee. One visit can fix six devices, which makes the journey worth it.",
        "## The parts problem",
        "Getting genuine parts is the main limit on growth. Some manufacturers now sell them to independent repairers and some do not, so Mendwell cannot fix every model.",
        "> Demand was never the question. Everyone has a drawer with a broken phone in it.",
        "The company raised a small seed round last year and is profitable in two of its four cities."
      ] },

    { slug: 'angel-syndicates-first-cheques', image: 'assets/img/stories/angel-syndicates-first-cheques.jpg', alt: "A glass jar of coins with a small plant growing from it", credit: { name: "Towfiqu barbhuiya", url: 'https://unsplash.com/@towfiqu999999?utm_source=founder_tribune&utm_medium=referral' }, section: 'funding', author: 'daniel', date: '2026-11-09', read: 5,
      title: "Angel syndicates are writing more first cheques, and founders say the terms are simpler",
      dek: "Groups of individual investors are filling the gap left by funds that moved to later rounds.",
      body: [
        "When Lumen Desk raised its $4 million seed round, no venture fund was involved. The money came from 38 individuals investing together through a syndicate.",
        "Founders and investors we spoke to say that is becoming more common for first rounds, as many funds concentrate on later, larger deals.",
        "## Why founders like it",
        "Syndicates usually invest on standard documents and rarely ask for a board seat. Co-founder Hugo Marchetti says his round closed in five weeks.",
        "## The trade-off",
        "There is less help afterwards. A fund has staff and a reason to support its companies; forty individuals have day jobs.",
        "> You get the money quickly and then you are on your own. Decide in advance whether that suits you.",
        "Investors point to another risk: syndicates may not have the reserves to invest again if a company needs more time."
      ] },

    { slug: 'chief-of-staff-at-15', image: 'assets/img/stories/chief-of-staff-at-15.jpg', alt: "An open notebook on a wooden desk", credit: { name: "Kelly Sikkema", url: 'https://unsplash.com/@kellysikkema?utm_source=founder_tribune&utm_medium=referral' }, section: 'leadership', author: 'tom', date: '2026-11-11', read: 5,
      title: "The case for hiring a chief of staff at 15 people",
      dek: "It sounds like a big-company job. Three founders say it was the hire that gave them their week back.",
      body: [
        "A chief of staff at a 15-person company sounds like vanity. Three founders told me it was the most useful hire they made that year.",
        "In each case the founder had become the route for every decision, and the company moved at the speed of one inbox.",
        "## What the job is",
        "At this size it is not strategy. It is running the weekly meeting, chasing the things that were agreed and noticing what is about to go wrong.",
        "> I did not need another executive. I needed someone to make sure what we decided on Monday had happened by Friday.",
        "## Who to hire",
        "All three chose someone already inside the company who knew how it worked. Two said an outside hire would have taken six months to be useful.",
        "The warning they shared: do not let the role become a gatekeeper. If people have to go through the chief of staff to reach you, you have made the original problem worse."
      ] },

    { slug: 'first-security-hire', image: 'assets/img/stories/first-security-hire.jpg', alt: "A red padlock resting on a computer keyboard", credit: { name: "FlyD", url: 'https://unsplash.com/@flyd2069?utm_source=founder_tribune&utm_medium=referral' }, section: 'technology', author: 'priya', date: '2026-11-10', read: 5,
      title: "Small firms are hiring a security person before their tenth engineer",
      dek: "Customers are asking harder questions before they sign. Founders say one early hire is cheaper than one lost contract.",
      body: [
        "Plainsight Pay hired a security engineer when it had six employees. Co-founder Samir Patel says the decision was made for him by a customer.",
        "A prospective client sent a questionnaire with 214 questions about how the company protects data. Nobody on the team could answer a third of them.",
        "## Customers are driving it",
        "Founders told us larger customers now routinely ask for evidence of security practices before signing, even with very small suppliers.",
        "## What the first hire does",
        "Mostly unglamorous work: turning on two-step login everywhere, deciding who can access what, keeping backups that have been tested and writing down what to do if something goes wrong.",
        "> Our first security hire did not stop a single hacker that I know of. She closed four deals.",
        "Firms that cannot afford a full-time hire are using part-time specialists for a day or two a week, which several described as enough for the first year."
      ] },

    { slug: 'founders-buying-homes', image: 'assets/img/stories/founders-buying-homes.jpg', alt: "A miniature model house on a table", credit: { name: "Tierra Mallorca", url: 'https://unsplash.com/@tierramallorca?utm_source=founder_tribune&utm_medium=referral' }, section: 'money', author: 'lena', date: '2026-11-09', read: 6,
      title: "Founders are rich on paper and struggling to get a mortgage",
      dek: "Lenders want salary history, not share certificates. Advisers explain what helps.",
      body: [
        "On paper, Imani Clarke is worth several million dollars. A bank turned down her mortgage application in twelve minutes.",
        "Her wealth is shares in her own company, which she cannot sell. Her salary, the number the bank cared about, is modest and has only been paid for eighteen months.",
        "## What lenders look at",
        "Mortgage advisers told us most lenders want two years of steady income and treat private company shares as worth nothing. A founder who paid themselves little in the early years has little to show.",
        "## What helps",
        "A longer salary history is the main thing, which is one reason advisers suggest founders pay themselves a consistent wage once they can.",
        "A larger deposit helps, as does a lender used to self-employed applicants. Some founders sell a small number of shares during a funding round to fund a deposit, though investors must agree.",
        "> Nobody warned me that paying myself properly was also about being able to rent a flat.",
        "This article is general information and not financial advice. Lending rules vary, so speak to a qualified adviser."
      ] },

    { slug: 'shorter-work-trips', image: 'assets/img/stories/shorter-work-trips.jpg', alt: "An aircraft parked at an airport gate", credit: { name: "Oskar Kadaksoo", url: 'https://unsplash.com/@oskark?utm_source=founder_tribune&utm_medium=referral' }, section: 'lifestyle', author: 'lena', date: '2026-11-08', read: 4,
      title: "The work trip is back, but it is shorter",
      dek: "Founders are flying out and home the same day, and saving the overnight stays for the meetings that matter.",
      body: [
        "Callum Reid flew to eleven cities last quarter and slept in a hotel twice. The Orchard Grid founder says most trips are now out in the morning and home by night.",
        "Other founders describe the same pattern. Video calls replaced the routine visit; what is left is the meeting where being in the room changes the outcome.",
        "## What earns a flight",
        "A first meeting with an important customer, a negotiation, or bad news. Several founders said they will not deliver bad news on a screen.",
        "## What it costs",
        "Day trips are tiring. Reid blocks the following morning with no meetings, a rule he says he broke twice and regretted both times.",
        "> One good dinner with a customer has done more for us than twenty video calls. So I go for the dinner and skip the rest."
      ] },

    { slug: 'founders-who-cook', image: 'assets/img/stories/founders-who-cook.jpg', alt: "A person chopping vegetables in a home kitchen", credit: { name: "Douglas Fehr", url: 'https://unsplash.com/@roninfehr?utm_source=founder_tribune&utm_medium=referral' }, section: 'lifestyle', author: 'lena', date: '2026-11-03', read: 4,
      title: "The founders who cook dinner, and why they guard the hour",
      dek: "Four people who run companies on the one evening habit they will not give up.",
      body: [
        "Rosa Delgado leaves the Kiln & Co workshop at half past five on weekdays to cook. Her team knows not to call between six and seven.",
        "She is one of four founders who told us that making dinner is the fixed point in their day.",
        "## A task with an end",
        "Running a company rarely produces anything finished by evening. A meal does. “It is the one thing all day that is done when it is done,” says Hugo Marchetti of Lumen Desk.",
        "## Keeping the hour",
        "All four put it in the calendar as a meeting. Two said they had to explain it to investors once and never again.",
        "> If I move dinner for a call, I will move it for every call. So I do not move it.",
        "None claimed it made them better at their jobs. They said it made the job easier to live with."
      ] },

    { slug: 'remote-work-lazy-managers', image: 'assets/img/stories/remote-work-lazy-managers.jpg', alt: "A person on a video call at a laptop", credit: { name: "Surface", url: 'https://unsplash.com/@surface?utm_source=founder_tribune&utm_medium=referral' }, section: 'opinion', author: 'maya', date: '2026-11-12', read: 4,
      title: "Remote work did not kill your culture. Vague management did",
      dek: "Offices hid a lot of poor communication. Take away the corridor and you find out what was never written down.",
      body: [
        "Every month a founder tells me remote work has damaged their culture. When I ask what changed, the answer is usually that people no longer know what is going on.",
        "They never did. In an office they could overhear it.",
        "## The corridor was doing your job",
        "Decisions were passed along at the coffee machine. Priorities were whatever the founder mentioned on the way to lunch. Remove the building and the system stops, because it was never a system.",
        "## Write it down",
        "The companies that do remote work well are not doing anything clever. They write decisions down, say who made them and put them where everyone can find them.",
        "That is harder than hiring an office. It is also what a well-run company should have been doing all along."
      ] },

    /* Real news stories, written with AI assistance from the listed sources on 14 November 2026. */
    { slug: 'faa-ground-stop-flights-resume', section: 'news', author: 'desk', date: '2026-11-14', read: 4, featured: true, ai: true, reviewed: false,
      title: "Flights resume after nationwide FAA ground stop, but disruption is expected to last days",
      dek: "A communications outage halted departures across the United States for more than four hours on Friday. Thousands of flights were cancelled.",
      body: [
        "Flights across the United States resumed on Friday evening after the Federal Aviation Administration lifted a nationwide ground stop that had halted departures for more than four hours.",
        "The stop was caused by a telecommunications outage affecting multiple air traffic control centers, according to CNN and NBC News. More than 3,500 aircraft were in the air when it was issued.",
        "## The scale of the disruption",
        "Flights began moving again at 8:15 p.m. on Friday, NBC News reported. By then the backlog was severe: more than 7,700 flights within, into or out of the United States were cancelled that day, according to FlightAware figures cited in news reports, and one report put the number of flights affected at more than 15,000.",
        "Fox News described it as the longest nationwide ground stop in 25 years.",
        "Some airports ran out of room. A source told NBC News that Reagan National Airport in Washington was at capacity and Chicago O’Hare was close to it, leaving arriving aircraft with nowhere to park. Passengers at Reagan National waited for hours before departures restarted, Fox News reported.",
        "## What happens next",
        "Federal officials warned that it will take time for airports and airlines to return to full capacity. The FAA said it was lifting restrictions gradually as its systems came back online. Delta said it had resumed all scheduled flights.",
        "Reuters reported on Saturday that US air travel faces days of disruption as airlines work through the backlog.",
        "Anyone travelling for work in the coming days should check their flight status with the airline before leaving for the airport, and expect rebooked flights to be full."
      ],
      takeaways: ["A telecommunications outage at air traffic control centers grounded US departures for more than four hours on Friday, November 13.", "More than 7,700 flights were cancelled that day, according to FlightAware figures cited in reports.", "Officials say it will take days for schedules to recover."],
      sources: [{ title: "CNN: Some US flights resume after hours-long ground stop", url: "https://www.cnn.com/2026/11/13/us/live-news/flights-ground-stop-faa" }, { title: "NBC News: FAA lifts ground stop as U.S. airports grapple with thousands of canceled flights", url: "https://www.nbcnews.com/news/us-news/live-blog/live-updates-flights-grounded-faa-communications-outage-rcna609268" }, { title: "Fox News: Thousands of flights canceled in wake of FAA ground stop", url: "https://www.foxnews.com/live-news/thousands-of-flights-canceled-after-longest-nationwide-ground-stop-in-25-years-rocks-us-airports" }] },

    { slug: 'cvs-glp1-break-even-350', section: 'health', author: 'desk', date: '2026-11-14', read: 4, ai: true, reviewed: false,
      title: "CVS says weight-loss drugs would pay for themselves at under $350 a month",
      dek: "An analysis of Aetna claims found employers saved on medical bills but spent more on prescriptions. Employers currently pay roughly twice the break-even price.",
      body: [
        "Employers and other health plan sponsors could break even on GLP-1 drugs if the monthly price fell below $350, CVS Health said in an analysis reported by Reuters on Saturday.",
        "The finding matters to any company that pays for staff health cover. GLP-1 medicines, used for diabetes and weight loss, have become one of the fastest-growing costs in employer health plans.",
        "## What the numbers show",
        "CVS based the analysis on claims data from Aetna, the health insurer it owns. Over three years, plan sponsors saved about $9,400 per person on medical bills but spent about $13,300 more on prescriptions, a net added cost of roughly $3,900 per person.",
        "At a price below $350 a month, CVS says, the savings would cover the cost of the drugs. That is well under what employers pay now. A 2025 study by the Employee Benefit Research Institute put the figure at $617 to $766 a month.",
        "## The caveats",
        "The break-even point depends on how sick the patient is. CVS suggests that plans see savings sooner for higher-risk patients. The report did not break out figures for people taking the drugs for obesity alone.",
        "CVS is also not a neutral party. As well as Aetna, it owns Caremark, a pharmacy benefit manager that negotiates drug prices with manufacturers, so it has a commercial interest in lower list prices.",
        "The company’s chief medical officer argued that the prices drugmakers already offer directly to consumers suggest they could still make a profit below $350 a month, according to the Reuters report.",
        "This article is general information and not medical or financial advice."
      ],
      takeaways: ["CVS says employer health plans would break even on GLP-1 drugs priced under $350 a month.", "Over three years, plans saved about $9,400 per person on medical bills and spent about $13,300 more on prescriptions.", "Employers currently pay $617 to $766 a month, according to a 2025 study."],
      sources: [{ title: "Reuters, via Investing.com: CVS says GLP-1s save money when priced below $350 per month", url: "https://www.investing.com/news/stock-market-news/cvs-says-glp1s-save-money-when-priced-below-350-per-month-5027293" }, { title: "Reuters, via AOL: CVS says GLP-1s save money when priced below $350 per month", url: "https://www.aol.com/articles/cvs-says-glp-1s-save-110514000.html" }, { title: "Traders Union: CVS Health says lower GLP-1 pricing could improve employer health plan costs", url: "https://tradersunion.com/news/companies/show/4243144-cvs-glp1-pricing-employer-costs/" }] },

    { slug: 'ss-united-states-artificial-reef', section: 'lifestyle', author: 'desk', date: '2026-11-14', read: 4, ai: true, reviewed: false,
      title: "The SS United States sinks off Florida to become the world’s largest artificial reef",
      dek: "A county bought the record-setting ocean liner and spent about $13 million sinking it for divers and anglers. It is a bet on tourism.",
      body: [
        "The SS United States, the ocean liner that set the transatlantic speed record on its maiden voyage in 1952, was deliberately sunk off the Florida Panhandle on November 11 to become the world’s largest artificial reef.",
        "The ship went down in a controlled sinking that used no explosives, about 20 nautical miles off the Gulf Coast near Destin, CBS News reported. After hours of slow descent it disappeared beneath the surface at 10 p.m., according to NPR.",
        "## A county’s tourism investment",
        "Okaloosa County bought the liner in 2024 after it had spent decades laid up in Philadelphia. The project was paid for with the county’s tourist tax revenue. Reports put the cost at about $13 million; CBS News cites that figure and the trade publication Marine Insight gives $13.5 million.",
        "The county’s aim is to draw scuba divers and anglers, and the visitors who come with them. The wreck is also expected to provide habitat for large open-water fish.",
        "## A new record",
        "The ship, about 1,000 feet long, now rests on a seabed roughly 180 feet deep, Marine Insight reported. It takes the title of largest artificial reef from the aircraft carrier USS Oriskany, which was sunk off Pensacola in 2006.",
        "The SS United States Conservancy, which campaigned for years to preserve the ship, is planning a museum in its honour in Florida."
      ],
      sources: [{ title: "CBS News: SS United States sinks off Florida’s Gulf Coast, will become world’s largest artificial reef", url: "https://www.cbsnews.com/news/ss-united-states-sinking-ocean-floor-largest-artificial-reef-world-florida-gulf-coast/" }, { title: "NPR: SS United States sunk to become world’s largest artificial reef", url: "https://www.npr.org/2026/11/11/nx-s1-6030853/ss-united-states-artificial-reef-sinking" }, { title: "Marine Insight: SS United States becomes the world’s largest artificial reef after sinking off Florida", url: "https://www.marineinsight.com/ocean-liner-ss-united-states-sunk-artificial-reef/" }] }
  ]
};
