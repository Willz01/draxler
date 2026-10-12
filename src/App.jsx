import {useEffect, useState} from 'react'
import {me, ascii, skills, experience, why, ogadrop, certifications} from './data.js'

const vscoUrl = `https://vsco.co/${me.vsco}`
const j = url => fetch(url).then(r => {
    if (!r.ok) throw new Error(r.status);
    return r.json()
})

let ghPromise

function loadGithub() {
    if (ghPromise) return ghPromise
    const u = me.github
    ghPromise = Promise.all([
        j(`https://api.github.com/users/${u}`),
        j(`https://api.github.com/users/${u}/repos?per_page=100&sort=pushed`),
        Promise.all(me.orgs.map(o => j(`https://api.github.com/orgs/${o}/repos?per_page=100`).catch(() => []))),
        j(`https://github-contributions-api.jogruber.de/v4/${u}?y=last`).catch(() => null),
        j(`https://api.github.com/search/issues?q=author:${u}+type:pr+-user:${u}&per_page=30&sort=updated`).catch(() => ({items: []})),
    ]).then(([user, repos, orgRepos, contrib, prs]) => {
        const all = [...repos.filter(r => !r.fork && r.name.toLowerCase() !== u.toLowerCase()), ...orgRepos.flat().filter(r => !r.fork)]
        const sorted = [...all].sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
        const latest = [...all].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0]
        return {user, all: sorted, latest, contrib, prs: prs.items || []}
    }).catch(e => {
        ghPromise = null;
        throw e
    })
    return ghPromise
}

function useGithub() {
    const [s, setS] = useState({loading: true})
    useEffect(() => {
        loadGithub().then(setS).catch(() => setS({error: true}))
    }, [])
    return s
}

const Cmd = ({c}) => <p className="cmd"><b>$</b> {c}</p>
const Tila = ({c}) => <p style={{color: "greenyellow", fontSize: "11px"}} className="tmd"><b>~</b> {c}</p>


function Intro({g}) {
    return (
        <>
            <p>
                <Tila c={'whoami'}/>
                <h2>{me.name} 👋 <span className="cursor">_</span></h2>
            </p>

            <p style={{fontSize: '11px', color: "grey"}}>{me.intro}</p>
            <p className="build">▸ building <a target={"_blank"} href={me.buildingUrl}>[{me.building}]
                - {me.buildDesc}</a></p>
            <Cmd c="cat skills.md"/>
            <div className="chips">{skills.map(s => <span className="chip" style={{fontSize: '11px'}}
                                                          key={s}>{s}</span>)}</div>
            <hr/>
            {g.contrib && (
                <>
                    <p style={{fontSize: '11px'}} className="muted">{g.contrib.total?.lastYear ?? 0} contributions in
                        the last year</p>
                    <div className="heat">{g.contrib.contributions.map(c => <i key={c.date} className={`l${c.level}`}
                                                                               title={`${c.date}: ${c.count}`}/>)}</div>
                </>
            )}
            {g.user &&
                <p style={{fontSize: '11px'}} className="muted small">{g.user.public_repos} public repos
                    · {g.user.followers} followers · live from
                    github</p>}
        </>
    )
}

function Experience() {
    return (
        <section id="experience"><Cmd c="cat experience.log"/>
            {experience.map(e => <div className="entry" key={e.title}><b>{e.title}</b><p
                style={{fontSize: '11px', color: "grey"}}>{e.desc}</p><p style={{fontSize: '12px'}}>{e.dates}</p>
            </div>)}
        </section>
    )
}

function Projects() {
    const o = ogadrop
    return (
        <section id="projects"><Cmd c="cat ogadrop.md"/>
            <div className="box">
                <div className="box-head">
                    <div>
                        <h3>{o.name}<span className="live"><i/> in-progress</span></h3>
                        <p style={{fontSize: '12px'}} className="muted"> - {o.tagline}</p>
                    </div>
                    <a className="visit" href={o.url} target="_blank" rel="noreferrer">ogadrop.com ↗</a>
                </div>
                <div className="apps">
                    {o.apps.map(a => {
                        const Tag = a.url ? 'a' : 'div'
                        return (
                            <Tag key={a.name} className="app" {...(a.url ? {
                                href: a.url,
                                target: '_blank',
                                rel: 'noreferrer'
                            } : {})}>
                                <span className="role">{a.role}</span>
                                <b>{a.name}</b>
                                <p>{a.desc}</p>
                            </Tag>
                        )
                    })}
                </div>
                <div className="box-foot">
                    <span className="muted small">built with</span>
                    {o.stack.map(t => <span className="chip" key={t}>{t}</span>)}
                    <span className="muted small">· 3 apps</span>
                </div>
            </div>
        </section>
    )
}

function Certifications() {
    return (
        <section id="certifications"><Cmd c="cat certifications.md"/>
            <div className="certs">
                {certifications.map(c => (
                    <a key={c.url} className="cert" href={c.url} target="_blank" rel="noreferrer">
                        <span className="seal">✓</span>
                        <div>
                            <b>{c.title}</b>
                            <p>{c.issuer} · {c.date}</p>
                            {c.skills.length > 0 && <div className="chips">{c.skills.map(s => <span className="chip"
                                                                                                    key={s}>{s}</span>)}</div>}
                        </div>
                        <span className="verify">verify ↗</span>
                    </a>
                ))}
            </div>
        </section>
    )
}

function Contributions({g}) {
    const [tab, setTab] = useState('open')
    const state = p => (p.pull_request?.merged_at ? 'merged' : p.state)
    const prs = (g.prs || []).filter(p => (tab === 'open' ? p.state === 'open' : p.state === 'closed'))
    return (
        <section id="contributions"><Cmd c="cat contributions.md"/>
            <div className="tabs">{['open', 'closed'].map(t => <button key={t} className={tab === t ? 'on' : ''}
                                                                       onClick={() => setTab(t)}>/{t}</button>)}</div>
            {prs.length === 0 &&
                <p className="muted">{g.loading ? 'fetching…' : `no ${tab} pull requests to other repos yet.`}</p>}
            {prs.map(p => (
                <a key={p.id} className="line" href={p.html_url} target="_blank" rel="noreferrer">
                    <span>{p.repository_url.split('/').slice(-2).join('/')} · {p.title}</span><span
                    className={`st ${state(p)}`}>{state(p)}</span>
                </a>
            ))}
        </section>
    )
}

function Photos() {
    const [items, setItems] = useState([])
    const [done, setDone] = useState(false)
    const [open, setOpen] = useState(null)
    useEffect(() => {
        fetch('/photos.json').then(r => (r.ok ? r.json() : [])).then(d => Array.isArray(d) && setItems(d)).catch(() => {
        }).finally(() => setDone(true))
    }, [])
    return (
        <section id="photos"><Cmd c="ls photos/"/>
            <p className="muted small">from my vsco · <a href={vscoUrl} target="_blank"
                                                         rel="noreferrer">vsco.co/{me.vsco} ↗</a></p>
            <div className="gallery">
                {items.length
                    ? items.map(p => <img key={p.id} src={p.src} alt={p.alt || 'photo from vsco'} loading="lazy"
                                          onClick={() => setOpen(p)}/>)
                    : done && Array.from({length: 6}).map((_, i) => <a key={i} className="ph" href={vscoUrl}
                                                                       target="_blank" rel="noreferrer">view on vsco
                    ↗</a>)}
            </div>
            {open && (
                <div className="lightbox" onClick={() => setOpen(null)}>
                    <img src={open.src} alt={open.alt || ''}/>
                    {open.link &&
                        <a href={open.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>open on
                            vsco ↗</a>}
                </div>
            )}
        </section>
    )
}

function Why() {
    return (
        <section id="why"><Cmd c="cat why-hire-me.md"/>
            <div className="card-win">
                <div className="card-bar">
                    <span className="dots"><i/><i/><i/></span>
                    <span className="card-title">why-hire-me.md</span>
                </div>
                <div className="card-body">
                    <ul className="why">{why.map(w => <li style={{fontSize: '11px'}} key={w}>{w}</li>)}</ul>
                </div>
            </div>
        </section>
    )
}


function Hire() {
    const [f, setF] = useState({from: '', subject: '', msg: ''})
    const set = k => e => setF({...f, [k]: e.target.value})
    const send = () => {
        const body = `${f.msg}\n\n— ${f.from}`
        location.href = `mailto:${me.email}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(body)}`
    }
    return (
        <section style={{fontSize: "11px"}} id="hire"><Cmd c="cat hire.me"/>
            <div className="card-win">
                <div className="card-bar">
                    <span className="dots"><i/><i/><i/></span>
                    <span className="card-title">hire.me</span>
                </div>
                <div className="card-body">
                    <div className="field"><label>to:</label><span>{me.email}</span></div>
                    <div className="field"><label>from:</label><input value={f.from} onChange={set('from')}
                                                                      placeholder="your email"/></div>
                    <div className="field"><label>subject:</label><input value={f.subject} onChange={set('subject')}
                                                                         placeholder="hey wills…"/></div>
                    <div className="field top"><label>message:</label><textarea rows={4} value={f.msg}
                                                                                onChange={set('msg')}/></div>
                    <div className="card-actions">
                        <span className="muted small">opens your mail app with the message filled in.</span>
                        <button className="send" onClick={send}>send →</button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default function App() {
    const g = useGithub()
    return (
        <div className="wrap" style={{fontSize: "10px"}}>
            <nav className="nav">
                <span className="logo">~/wills</span>
                {[['experience', 'experience'], ['certifications', 'certs'], ['projects', 'projects'], ['photos', 'photos'], ['hire', 'hire.me']].map(([id, l]) =>
                    <a style={{fontSize: "10px"}} key={id} href={`#${id}`}>{l}</a>)}
            </nav>
            <Intro g={g}/>
            <Experience/>
            <Certifications/>
            <Projects g={g}/>
            <Photos/>
            <Why/>
            <Hire/>
            <footer className="muted small">
                <span>© {new Date().getFullYear()} {me.fullName}</span>
                <span><a target={"_blank"} href={`https://github.com/${me.github}`}>github</a> · <a target={"_blank"} href={me.linkedin}>linkedin</a> · <a
                    target={"_blank"} href={vscoUrl}>vsco</a> · <a target={"_blank"} href={`mailto:${me.email}`}>email</a></span>
            </footer>
        </div>
    )
}
