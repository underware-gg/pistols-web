import { useEffect, useLayoutEffect, useRef } from 'react'
import PageMetadata from '@/components/PageMetadata'
import styles from '@/styles/discord.module.scss'

/* eslint-disable @next/next/no-img-element -- This page's art uses CSS responsive sizing rather than Vercel image optimisation. */

// Run before paint on the client (so reveal hiding applies without a flash),
// but fall back to useEffect on the server to avoid Next's SSR warning.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const DISCORD_INVITE =
  'https://discord.com/oauth2/authorize?client_id=1477211104454377613&permissions=277025770560&scope=bot%20applications.commands'

// Discord logo mark used inside the CTA buttons
function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
    </svg>
  )
}

// ASCII duel animation frames (ported verbatim from the standalone landing)
const FRAMES: string[][] = [
  [
    '      PISTOLS ROUND       ',
    '   o ]            [ o     ',
    '  /|\\            /|\\   ',
    '  < \\            / >    ',
    '   lzg          PARSA     ',
  ],
  [
    '      ⚡ DMG UP ⚡          ',
    '   o ]            [ o     ',
    '  /|\\            /|\\   ',
    '  < \\            / >    ',
    '   lzg          PARSA     ',
  ],
  [
    '        STEP 3            ',
    '   o ]━━━▶        [ o     ',
    '  /|\\            /|\\   ',
    '  < \\            / >    ',
    '   lzg   FIRE!  PARSA     ',
  ],
  [
    '          HIT!            ',
    '   o ]          ✦  o     ',
    '  /|\\           \\|\\   ',
    '  < \\            / >    ',
    '   lzg   ♥♥♡   PARSA     ',
  ],
  [
    '    ⚡ CHANCES UP ⚡       ',
    '   o ]            [ o     ',
    '  /|\\            /|\\   ',
    '  < \\            / >    ',
    '   lzg   ♥♥♡   PARSA     ',
  ],
  [
    '        STEP 7            ',
    '   o      ◀━━━[ [ o     ',
    '  /|\\            /|\\   ',
    '  < \\            / >    ',
    '   lzg   FIRE!  PARSA     ',
  ],
  [
    '         MISS!            ',
    '   o ]            [ o     ',
    '  /|\\            /|\\   ',
    '  < \\            / >    ',
    '   lzg   ♥♥♡   PARSA     ',
  ],
  [
    '     ⚔ BLADES ROUND ⚔     ',
    '   o  ]────────[  o     ',
    '  /|\\            /|\\   ',
    '  < \\            / >    ',
    '   lzg          PARSA     ',
  ],
  [
    '       BEHEAD!            ',
    '       o  ⚔  o            ',
    '      /|\\ /|\\           ',
    '      / \\ / \\           ',
    '   lzg       PARSA        ',
  ],
  [
    '       VICTORY            ',
    '  \\o/           _o_      ',
    '   |            /|        ',
    '  / \\             \\     ',
    '   lzg  WINS!  PARSA      ',
  ],
]

export default function Discord() {
  const animRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = animRef.current
    if (!el) return

    let idx = 0
    let hold = 0

    const step = () => {
      el.textContent = FRAMES[idx].join('\n')
      if (idx === FRAMES.length - 1) {
        hold++
        if (hold >= 3) {
          idx = 0
          hold = 0
        }
      } else {
        idx++
      }
    }

    step()
    const timer = setInterval(step, 1200)
    return () => clearInterval(timer)
  }, [])

  // Reveal sections and cards as they scroll into view. Scoped to this page;
  // a no-op under prefers-reduced-motion (the CSS keeps everything visible).
  useIsomorphicLayoutEffect(() => {
    const root = pageRef.current
    if (!root) return
    const els = Array.from(
      root.querySelectorAll<HTMLElement>(`.${styles.reveal}, .${styles.revealStagger}`)
    )
    if (els.length === 0) return
    if (!('IntersectionObserver' in window)) {
      // No observer support: leave everything visible (never add animReady).
      return
    }
    // Enable the hiding rules only now that JS is running and can reveal.
    root.classList.add(styles.animReady)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.inView)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <PageMetadata
        title="Pistols at Dawn: Discord Bot"
        description="Settle your disputes in Discord. A duelling game where honour is earned at ten paces."
        canonicalUrl="https://pistols.gg/discord"
      />
      <main className={styles.page} ref={pageRef}>
        {/* ── HERO ─────────────────────────────────────────── */}
        <div className={styles.hero}>
          <img src="/images/discord/logo_text.png" alt="Pistols at Dawn" className={styles.logo} />
          <h1>Settle it in Discord</h1>
          <p>
            A duelling game that lives entirely in your Discord. Challenge someone and the whole
            duel plays out right there in the channel, for everyone to watch. No app to install,
            no wallet, nothing to learn before your first shot.
          </p>

          <a href={DISCORD_INVITE} className={styles.cta}>
            <DiscordIcon />
            Add to Discord
          </a>

          <p className={styles.heroSub}>
            Free to use · No wallet required · <a href="https://pistols.gg">pistols.gg</a>
          </p>
        </div>

        {/* ── WHAT IS IT (approachable pitch, before any mechanics) ── */}
        <section className={styles.revealStagger}>
          <h2>The whole game, in your channel</h2>
          <p className={styles.sub}>
            Two players, ten paces, one shot to settle it. No download, no rules to memorize. You can
            be in your first duel thirty seconds after adding the bot.
          </p>

          <div
            className={styles.cards}
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
          >
            <div className={styles.card}>
              <div className={styles.icon}>🎯</div>
              <h3>Challenge anyone</h3>
              <p>
                One command starts it. Call out a specific player, or throw an open challenge any
                member of the channel can accept. Then pick your premise: honour, blood, or nothing at
                all.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>🎬</div>
              <h3>Watch it play out</h3>
              <p>
                The duel resolves live, right in the channel, as an ASCII animation. Paces count down,
                shots ring out, someone is left standing. Everyone watching gets the show.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>🎴</div>
              <h3>It plays itself at first</h3>
              <p>
                New players don&apos;t pick a thing. Your first duels are played for you, so you just
                accept, watch, and pick up the game by seeing it. Full manual control unlocks the more
                you duel.
              </p>
            </div>
          </div>
        </section>

        {/* ── WHY IT WORKS ─────────────────────────────────── */}
        <section className={styles.revealStagger}>
          <h2>Why it works</h2>
          <p className={styles.sub}>A duel bot that pulls its own weight in your server.</p>

          <div
            className={styles.cards}
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            <div className={styles.card}>
              <div className={styles.icon}>🔥</div>
              <h3>Keeps your server active</h3>
              <p>
                Duels are public. Every challenge plays out in the channel, pulling in spectators and
                sparking rematches. The bot does the community management for you.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>⚡</div>
              <h3>Zero friction to start</h3>
              <p>
                One invite link, one <code>/setup</code> command to pick your duel channel, and
                you&apos;re live. No dashboards. No configuration calls.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>🔐</div>
              <h3>No wallets required</h3>
              <p>
                Players don&apos;t need crypto, accounts, or anything outside Discord. If they&apos;re
                in your server, they can duel.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>🛡️</div>
              <h3>Works with your moderation setup</h3>
              <p>
                Compatible with Wick, Dyno, MEE6, and similar bots. One whitelist command and it runs
                clean alongside your existing setup.
              </p>
            </div>
          </div>
        </section>

        {/* ── CLASSIC DUEL ─────────────────────────────────── */}
        <section className={styles.revealStagger}>
          <h2>Classic Duel</h2>
          <p className={styles.sub}>
            Both duelists secretly pick four cards. Cards lock. The duel resolves step by step. Three
            HP. One round. Someone falls.
          </p>

          <div className={styles.cards} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className={styles.card}>
              <div className={styles.icon}>🔫</div>
              <h3>The Pistols Round</h3>
              <p>
                Each duelist picks a step to fire (1–10) and a step to dodge. A 34-card environment
                deck shuffles fresh every duel, one card drawn per step, swinging damage and hit
                chance as the paces count down. Fire early for a clean shot before the deck turns on
                you, or fire late and let the cards stack in your favour. You also pick a tactic card
                that modifies the field before the first step: an Insult rattles their aim, a Coin
                Toss blocks the first nasty surprise, Vengeful adds raw damage. Three HP each. No
                healing. Whoever&apos;s still standing moves on.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>⚔️</div>
              <h3>The Blades Round</h3>
              <p>
                If both duelists survive the pistols, the blades come out. Each player picks one of
                four blades before the duel begins: Pocket Pistol, Behead, Grapple, or Seppuku. Every
                blade gives a passive stat modifier during the pistols round, then resolves as
                sudden-death rock-paper-scissors if it reaches this phase. Pocket Pistol beats Behead.
                Behead beats Grapple. Grapple beats Pocket Pistol. Same blade vs same: both die.
                Seppuku gives the strongest pre-shot buff in the game, +20% hit and +1 damage, but you
                always die in the blade clash. Win in pistols or don&apos;t win at all.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ──────────────────────────────────────── */}
        <div className={`${styles.divider} ${styles.reveal}`}>
          <img src="/images/discord/pistol_shot.jpg" alt="" className={styles.dividerShot} />
        </div>

        {/* ── HOW A DUEL WORKS ─────────────────────────────── */}
        <section className={styles.revealStagger}>
          <h2>How a duel works</h2>
          <p className={styles.sub}>Four decisions. All chosen blind. All revealed at once.</p>

          <div className={styles.steps}>
            <div className={styles.step}>
              <h3>Challenge</h3>
              <p>
                Type <code>/duel @opponent</code> for a specific target, or <code>/duel public</code>{' '}
                to throw an open callout anyone in the channel can claim. Pick your premise, honour,
                blood, or nothing at all.
              </p>
            </div>
            <div className={styles.step}>
              <h3>Pick your cards</h3>
              <p>Fire step, dodge step, tactic, and blade. Private selection; nobody sees your hand.</p>
            </div>
            <div className={styles.step}>
              <h3>Watch the duel</h3>
              <p>
                ASCII animation plays step by step. Environment cards shift the odds. Bullets fly.
                Someone falls.
              </p>
            </div>
            <div className={styles.step}>
              <h3>Result</h3>
              <p>Winner declared. Full combat log available. Rematch button ready.</p>
            </div>
          </div>

          <p className={styles.noteCenter}>
            Want the full mechanics? <a href="#card-reference">See the card reference below</a>.
          </p>
        </section>

        {/* ── ASCII PREVIEW ────────────────────────────────── */}
        <section style={{ paddingTop: 0 }} className={styles.reveal}>
          <div ref={animRef} className={styles.preview} style={{ minHeight: '7.5em' }} />
          <p className={styles.previewCaption}>
            Duels play out as ASCII animations, right in your Discord channel.
          </p>
        </section>

        {/* ── WHAT'S INCLUDED ──────────────────────────────── */}
        <section className={styles.revealStagger}>
          <h2>What&apos;s included</h2>
          <p className={styles.sub}>Everything you need to run duels in your server.</p>

          <div className={styles.cards}>
            <div className={styles.card}>
              <div className={styles.icon}>📋</div>
              <h3>Duel Queue</h3>
              <p>
                Challenge multiple opponents. If someone&apos;s busy, the duel queues and auto-fires
                when both are free. Optionally pre-commit your cards so the duel resolves the instant
                your turn comes up. No lost challenges.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>📊</div>
              <h3>Stats &amp; streaks</h3>
              <p>
                <code>/mystats</code> tracks your record and your current and best win streak. Every
                duel is saved to your history.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>🔒</div>
              <h3>Private Interactions</h3>
              <p>
                Card selection is ephemeral; only you see your picks. Accept, refuse, and combat logs
                are all private to the relevant player.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>🔄</div>
              <h3>Replay &amp; Combat Log</h3>
              <p>
                Missed the duel? Replay the animation or view the full combat log with every env card,
                damage number, and stat change.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>🎴</div>
              <h3>Starts on auto-play</h3>
              <p>
                First-time players are handed a starter pistol that plays the round for them. Accept,
                watch, and learn the game by seeing it. Manual control unlocks after a few duels.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>🔫</div>
              <h3>A pistol for every style</h3>
              <p>
                Each pistol plays the round its own way: one holds its fire, one shoots early, one
                keeps you guessing. Swap between duels with <code>/pistols</code> and find your match.
              </p>
            </div>
          </div>
        </section>

        {/* ── STATS (hidden until numbers are worth showing) ── */}
        <section id="stats-section" style={{ paddingTop: 20, paddingBottom: 20, display: 'none' }}>
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <div className={styles.num}>?</div>
              <div className={styles.label}>Servers</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.num}>?</div>
              <div className={styles.label}>Duels Fought</div>
            </div>
          </div>
        </section>

        {/* ── SERVER ADMIN GUIDE ───────────────────────────── */}
        <section className={`${styles.adminGuide} ${styles.reveal}`}>
          <div className={styles.adminInner}>
            <div className={styles.eyebrow}>For server admins</div>
            <h2>Server Admin Guide</h2>
            <p className={styles.sub}>Everything you need to get Pistols at Dawn running in your server.</p>

            <div className={styles.adminSteps}>
              <div className={styles.adminStep}>
                <div className={styles.stepNum}>1</div>
                <div>
                  <h3>Add the bot</h3>
                  <p>
                    Use the invite link above, or the CTA below. It requests the exact permissions the
                    bot needs: send messages, manage messages, embed links, attach files, read message
                    history, and use slash commands.
                  </p>
                  <p className={styles.tip}>
                    Don&apos;t reduce them, the duel animation relies on rapid message edits and
                    won&apos;t work without manage-messages.
                  </p>
                </div>
              </div>

              <div className={styles.adminStep}>
                <div className={styles.stepNum}>2</div>
                <div>
                  <h3>Pick a duel channel</h3>
                  <p>
                    After adding the bot, run <code>/setup</code> and set <code>duel_channel</code> to
                    the channel where duels should play out. <strong>This is required</strong>, the bot
                    won&apos;t post duel animations until a channel is set.
                  </p>
                  <p className={styles.tip}>
                    Pick a dedicated channel like <code>#the-duelling-grounds</code>. Duels generate a
                    burst of message edits during the animation; a dedicated channel keeps it contained.
                  </p>
                </div>
              </div>

              <div className={styles.adminStep}>
                <div className={styles.stepNum}>3</div>
                <div>
                  <h3>Whitelist the bot in your moderation bot</h3>
                  <p>
                    If your server runs <strong>Wick</strong>, <strong>Dyno</strong>,{' '}
                    <strong>MEE6</strong>, or a similar moderation bot, whitelist Pistols at Dawn before
                    your first duel. The live ASCII animation uses rapid message edits, and anti-spam
                    rules will flag and silence the bot mid-duel if it isn&apos;t trusted.
                  </p>
                  <p className={styles.tip}>
                    <strong>Wick:</strong> <code>w!trust bot add 1477211104454377613</code>
                    <br />
                    <strong>Dyno &amp; MEE6:</strong> add Pistols at Dawn to the trusted-bots list in
                    their dashboards.
                    <br />
                    Also place the <strong>Pistols at Dawn role above your moderation bot&apos;s role</strong>{' '}
                    under Server Settings → Roles. This prevents the mod bot from overriding the
                    bot&apos;s permissions.
                  </p>
                </div>
              </div>

              <div className={styles.adminStep}>
                <div className={styles.stepNum}>4</div>
                <div>
                  <h3>Available settings</h3>
                  <p>
                    All settings are configured with <code>/setup</code>. Only users with the{' '}
                    <strong>Manage Server</strong> permission can run <code>/setup</code>.
                  </p>
                  <table className={styles.settingsTable}>
                    <thead>
                      <tr>
                        <th>Setting</th>
                        <th>Default</th>
                        <th>What it does</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={styles.setting}>duel_channel</td>
                        <td className={styles.default}>none, required</td>
                        <td>
                          The channel where duel animations post. Must be set before duels can run.
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.setting}>animation</td>
                        <td className={styles.default}>On</td>
                        <td>
                          Enables the live ASCII duel animation. Turn off only if your mod bot keeps
                          silencing the bot despite whitelisting.
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.setting}>speed</td>
                        <td className={styles.default}>Normal</td>
                        <td>
                          <strong>Normal</strong>, full animation. <strong>Compact</strong>, slower
                          frames, fewer shot/death frames. <strong>Minimal</strong>, most aggressive
                          pacing (1s/frame floor). Use Compact or Minimal if your server has rate-limit
                          issues.
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.setting}>accept_timeout</td>
                        <td className={styles.default}>5 minutes</td>
                        <td>
                          How long a challenge stays open before it expires unaccepted. Valid range:{' '}
                          <strong>5 to 2880 minutes</strong> (48h). Increase for servers where people
                          aren&apos;t always online. Set to <code>0</code> to clear a guild override and
                          revert to the global default.
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.setting}>enabled</td>
                        <td className={styles.default}>On</td>
                        <td>
                          Master on/off switch. When off, all bot commands are disabled server-wide.
                          Useful during maintenance or if you need to pause the bot temporarily.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.adminStep}>
                <div className={styles.stepNum}>5</div>
                <div>
                  <h3>What the bot does and doesn&apos;t do</h3>
                  <div className={styles.doesDoesnt}>
                    <div className={styles.does}>
                      <h4>Does</h4>
                      <ul>
                        <li>
                          Post duel animations and results to the configured <code>duel_channel</code>
                        </li>
                        <li>Track win/loss stats per user (accessible with <code>/mystats</code>)</li>
                        <li>
                          Queue challenges if an opponent is busy, duels auto-fire when both players are
                          free
                        </li>
                        <li>
                          Use ephemeral (private) messages for card selection, no spoilers in the channel
                        </li>
                      </ul>
                    </div>
                    <div className={styles.doesnt}>
                      <h4>Doesn&apos;t</h4>
                      <ul>
                        <li>Read or store message content outside of slash-command interactions</li>
                        <li>
                          Require any channel permissions beyond the configured <code>duel_channel</code>
                        </li>
                        <li>DM users unprompted</li>
                        <li>Assign or modify roles</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CARD REFERENCE ───────────────────────────────── */}
        <section id="card-reference" className={styles.revealStagger}>
          <div className={styles.eyebrow}>Reference</div>
          <h2>Card reference</h2>
          <p className={styles.sub}>
            Full mechanics for players who want to go deep. Skim it now or come back to it before your
            first serious duel.
          </p>

          <div className={styles.cardFan}>
            <img src="/images/discord/card_back.png" alt="" />
            <img src="/images/discord/card_back.png" alt="" />
            <img src="/images/discord/card_back.png" alt="" />
          </div>

          <div className={styles.detailGrid}>
            {/* ENV CARDS */}
            <div className={styles.detailBlock}>
              <h3>🃏 Environment Deck: 34 Cards</h3>
              <p>
                Shuffled fresh every duel. One card drawn per step. Affects both duelists
                independently, but only until they fire. The longer you wait, the more the deck shapes
                your fate.
              </p>
              <table className={styles.cardTable}>
                <tbody>
                  <tr>
                    <th>Card</th>
                    <th>Copies</th>
                    <th>Effect</th>
                  </tr>
                  <tr>
                    <td><strong>Damage Up</strong></td>
                    <td className={styles.copies}>7</td>
                    <td>+1 damage</td>
                  </tr>
                  <tr>
                    <td><strong>Damage Down</strong></td>
                    <td className={styles.copies}>5</td>
                    <td>-1 damage</td>
                  </tr>
                  <tr>
                    <td><strong>Chances Up</strong></td>
                    <td className={styles.copies}>7</td>
                    <td>+10% hit chance</td>
                  </tr>
                  <tr>
                    <td><strong>Chances Down</strong></td>
                    <td className={styles.copies}>5</td>
                    <td>-10% hit chance</td>
                  </tr>
                  <tr>
                    <td><strong>Double Damage Up</strong></td>
                    <td className={styles.copies}>3</td>
                    <td>+2 damage</td>
                  </tr>
                  <tr>
                    <td><strong>Double Chances Up</strong></td>
                    <td className={styles.copies}>3</td>
                    <td>+20% hit chance</td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: 'var(--gold)' }}>All Shots Hit</strong></td>
                    <td className={styles.copies}>1</td>
                    <td>100% hit from now on. Suppresses further chance mods.</td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: 'var(--red)' }}>All Shots Miss</strong></td>
                    <td className={styles.copies}>1</td>
                    <td>0% hit from now on. The anti-greed card.</td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: '#9b7dd4' }}>Double Tactics</strong></td>
                    <td className={styles.copies}>1</td>
                    <td>Your tactic card fires twice.</td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: '#9b7dd4' }}>No Tactics</strong></td>
                    <td className={styles.copies}>1</td>
                    <td>Your tactic card is erased.</td>
                  </tr>
                </tbody>
              </table>
              <p className={styles.tableNote}>
                20 positive. 10 negative. 4 specials. The deck is 2:1 in your favour; but All Shots
                Miss only needs to show up once.
              </p>
            </div>

            {/* TACTICS CARDS */}
            <div className={styles.detailBlock}>
              <h3>🃏 Tactics: Pick 1 of 6</h3>
              <p>
                Applied before the shooting starts. Shape the gunfight before the first step. No skip
                option; you commit to a tactic.
              </p>
              <table className={styles.cardTable}>
                <tbody>
                  <tr>
                    <th>Card</th>
                    <th>Effect</th>
                    <th>Detail</th>
                  </tr>
                  <tr>
                    <td><strong>Insult</strong></td>
                    <td>Opponent -10% hit, +1 dmg to them</td>
                    <td>Rattles their aim; sharpens their anger.</td>
                  </tr>
                  <tr>
                    <td><strong>Coin Toss</strong></td>
                    <td>Blocks the first special env card</td>
                    <td>Insurance against All Shots Miss or No Tactics.</td>
                  </tr>
                  <tr>
                    <td><strong>Vengeful</strong></td>
                    <td>+1 damage to your shot</td>
                    <td>Straightforward. More powder, more pain.</td>
                  </tr>
                  <tr>
                    <td><strong>Thick Coat</strong></td>
                    <td>Opponent -1 damage</td>
                    <td>Their bullet hurts less. Sometimes not at all.</td>
                  </tr>
                  <tr>
                    <td><strong>Reversal</strong></td>
                    <td>Flips next negative env card to positive</td>
                    <td>Affects both duelists. Damage Down becomes Damage Up for everyone.</td>
                  </tr>
                  <tr>
                    <td><strong>Bananas</strong></td>
                    <td>Both players -10% hit</td>
                    <td>Mutual sabotage. Nobody aims well on a banana.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BLADES CARDS */}
            <div className={styles.detailBlock}>
              <h3>⚔️ Blades: Pick 1 of 4</h3>
              <p>
                Blades do two jobs at once: modify your stats before the shots phase, and resolve as
                sudden-death if both survive. No skip. You bring a blade to every duel.
              </p>
              <table className={styles.cardTable}>
                <tbody>
                  <tr>
                    <th>Card</th>
                    <th>Pre-Shot Effect</th>
                    <th>Clash</th>
                    <th>Strategy</th>
                  </tr>
                  <tr>
                    <td><strong style={{ color: 'var(--red)' }}>Seppuku</strong></td>
                    <td>+20% hit, +1 damage</td>
                    <td>You always die</td>
                    <td>Strongest buff in the game. Win during shots or don&apos;t win at all.</td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: '#5865f2' }}>Pocket Pistol</strong></td>
                    <td>Opponent -10% hit</td>
                    <td>Beats Behead</td>
                    <td>Defensive. Reduces their accuracy before the first step.</td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: 'var(--gold)' }}>Behead</strong></td>
                    <td>+1 damage</td>
                    <td>Beats Grapple</td>
                    <td>Aggressive. Your shot hits harder.</td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: '#00cc77' }}>Grapple</strong></td>
                    <td>Opponent -1 damage</td>
                    <td>Beats Pocket Pistol</td>
                    <td>Can reduce opponent to 0 damage. Base is 1; Grapple makes it nothing.</td>
                  </tr>
                </tbody>
              </table>
              <p className={styles.tableNote}>
                Same card vs same: both die. Seppuku vs anything: Seppuku dies. The triangle: Pocket
                Pistol beats Behead beats Grapple beats Pocket Pistol.
              </p>
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ───────────────────────────────────── */}
        <div className={styles.bottomCta}>
          <img src="/images/discord/duelist_male.png" alt="" className={styles.duelistLeft} />
          <img src="/images/discord/duelist_female.png" alt="" className={styles.duelistRight} />
          <div className={`${styles.bottomInner} ${styles.revealStagger}`}>
            <h2>Settle your disputes</h2>
            <p>Add the bot. Challenge someone. Let the flintlock do the talking.</p>
            <a href={DISCORD_INVITE} className={styles.cta}>
              <DiscordIcon />
              Add to Discord
            </a>
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer>
          <div className={styles.footerLinks}>
            <a href="https://pistols.gg">pistols.gg</a>
            <a href="https://x.com/underware_gg">@underware_gg</a>
            <a href="https://discord.gg/pistolsatdawn">Discord</a>
          </div>
          <p>
            Built by <a href="https://underware.gg">Underware</a> · Pistols at Dawn · 2026
          </p>
        </footer>
      </main>
    </>
  )
}
