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
    social: { LinkedIn: '#', X: '#', Instagram: '#', YouTube: '#' }
  },
  sections: [
    { id: 'startups',   name: 'Startups',   color: '#1F4FD8', blurb: 'New companies, early traction and the decisions that shape the first three years.' },
    { id: 'funding',    name: 'Funding',    color: '#0A6B43', blurb: 'Who raised, from whom, on what terms, and what the money is for.' },
    { id: 'leadership', name: 'Leadership', color: '#7A2E8E', blurb: 'Hiring, firing, culture and the daily work of running a company.' },
    { id: 'technology', name: 'Technology', color: '#C9410B', blurb: 'The tools and platforms founders are betting their companies on.' },
    { id: 'money',      name: 'Money',      color: '#0B7285', blurb: 'Founder pay, equity, taxes and personal finance when your net worth is on paper.' },
    { id: 'lifestyle',  name: 'Lifestyle',  color: '#C2255C', blurb: 'Health, family, travel and life outside the cap table.' },
    { id: 'opinion',    name: 'Opinion',    color: '#3B4540', blurb: 'Arguments from founders, investors and our columnists.' }
  ],
  authors: {
    maya:   { name: 'Maya Okafor',   role: 'Editor in chief',       bio: 'Maya edits Founder Tribune and writes about how early teams make decisions.' },
    daniel: { name: 'Daniel Reyes',  role: 'Funding reporter',      bio: 'Daniel covers venture capital, term sheets and the companies on both sides of them.' },
    priya:  { name: 'Priya Nair',    role: 'Technology editor',     bio: 'Priya reports on the software and infrastructure that startups are built on.' },
    tom:    { name: 'Tom Whitfield', role: 'Leadership columnist',  bio: 'Tom spent twelve years as an operator before writing about management.' },
    lena:   { name: 'Lena Fischer',  role: 'Money and life writer', bio: 'Lena writes about founder finances and the cost of building a company.' },
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
      ] }
  ]
};
