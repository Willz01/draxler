// ✏️ Edit this file to update the whole site. Live GitHub data (stats, repos, PRs) is fetched automatically.
export const me = {
    name: 'wills',
    fullName: 'Wills Ekanem',
    github: 'Willz01',
    orgs: ['homedork-se2'],
    linkedin: 'https://www.linkedin.com/in/ekanem-wills-17we/',
    vsco: 'draxler606',
    email: 'ekanemwills1@gmail.com',
    intro: "i like building the parts of software you don't see: apis, servers, and the plumbing that lets services talk to each other.\n" +
        "\n" +
        "day to day i work in java, python, node.js and javascript, flutter, with kotlin for android. i enjoy distributed communication and clean backends.\n" +
        "\n" +
        "away from the keyboard i take photos. you can see them in the photos tab.",
    building: 'ogadrop',
    buildDesc: 'Shopping, transportation and logistics super app',
    buildingUrl: 'https://ogadrop.com',
}

export const ascii = String.raw`
__      __(_) | |___
\ \ /\ / /| | | / __|
 \ V  V / | | | \__ \
  \_/\_/  |_|_|_|___/`

export const skills = ['.NET', 'python', 'bun/node.js', 'kotlin', 'c++', 'flutter', 'rest apis', 'android', 'distributed systems', 'git', 'android studio', 'spring.io']

// DRAFT entries based on your public repos. LinkedIn can't be read automatically, so replace these with your real roles.
export const experience = [
    {
        title: 'publicis sapient ab[PS]',
        dates: 'september 2022 – september 2025',
        desc: 'worked on enhancing and optimizing internal systems for global brands. involved in key projects like email transaction systems, large microservices, and cloud solutions.',
    },
    {
        title: '[pandora] — junior software engineer · bloomreach engineer',
        dates: 'september 2022 – july 2023',
        sub: true,
    },
    {
        title: '[ecrf codeaid] — associate software engineer · software engineer',
        dates: 'september 2023 – august 2024',
        sub: true,
    },
    {
        title: '[ncp national car parks] — associate software engineer · backend engineer',
        dates: 'february 2024 – july 2025',
        sub: true,
    },
]

export const why = [
    'i care about the parts of software you do not see: apis, servers and the communication between services.',
    'i have shipped a backend and api that real clients (web and android) talk to, in a team.',
    'i like learning properly: i read the docs, build the thing, then clean it up. I love what i do.',
    'i enjoy working with people, and i write docs so others can follow & flow properly.',
]

export const ogadrop = {
    name: 'ogadrop',
    url: 'https://ogadrop.com',
    tagline: 'shop from local vendors, send parcels, track deliveries and access everyday logistics services in one app.',
    stack: ['flutter', 'dart', 'firebase/firestore', 'node.js', 'react/vite'],
    apps: [
        {
            name: 'ogadrop',
            role: 'customer app',
            desc: 'shop from local vendors, send parcels and track deliveries.',
            url: ''
        },
        {
            name: 'drop vendor',
            role: 'vendor app',
            desc: 'for local vendors to receive and manage customer orders.',
            url: ''
        },
        {name: 'drop rider', role: 'rider app', desc: 'for delivery riders to pick up and deliver orders.', url: ''},
    ],
}

export const certifications = [
    {
        title: 'Microsoft Certified: Azure Fundamentals',
        issuer: 'microsoft',
        date: 'september 2023',
        skills: ["azure", "cloud"],
        url: 'https://learn.microsoft.com/en-gb/users/willsekanem-6040/credentials/ce24f6c65f425ae4',
    },
]
