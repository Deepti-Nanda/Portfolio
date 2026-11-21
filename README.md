# Deepti Nanda — Portfolio

My personal portfolio: a single-page site that introduces who I am, the projects I've built, my skills and experience, with a few playful interactions along the way.

**Building technology that solves real-world problems.**

## Highlights

- **Water ripple hero** — tap or click the empty hero background and a soft 3D ripple spreads across the drifting gradient, like a stone dropped in water.
- **Shattering theme switch** — toggling light/dark mode cracks the page into glass shards that fall away to reveal the new theme.
- **Skills orbit** — skill logos orbit my portrait on two rings. Select a skill to see which projects use it.
- **Slingshot mini-game** — select the portrait in the orbit to play: three shots, two hits wins a treasure chest that opens my resume.
- **Animated project icons** — a sweeping radar, a beating ECG line and a hand sprinkling spice bring each project card to life.
- **Resume viewer** — view the PDF in a modal or download it from the navbar.
- **Working contact form** — messages are delivered by email through [Resend](https://resend.com), with server-side validation and basic bot protection.
- **Light and dark themes**, responsive from small phones to large desktops.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev) and TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [Resend](https://resend.com) for the contact form
- [Lucide](https://lucide.dev) and [Simple Icons](https://simpleicons.org) for icons
- Canvas and SVG animations for the interactive effects

## Getting started

Requires **Node.js 20.9 or newer**.

```bash
git clone https://github.com/Deepti-Nanda/Portfolio.git
cd Portfolio
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Contact form settings

The contact form needs a [Resend](https://resend.com) account. Create a `.env.local` file in the project root:

```bash
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TO_EMAIL=you@example.com
```

- `RESEND_FROM_EMAIL` is the sender address. Resend's test sender `onboarding@resend.dev` only delivers to the email you signed up to Resend with; verify your own domain in Resend to send from your own address.
- `RESEND_TO_EMAIL` is where messages are delivered.

`.env.local` is ignored by git — never commit your API key. The rest of the site works without these settings; only the form shows a "not configured" message.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Check the code with ESLint |

## Project structure

```
app/
  layout.tsx            Fonts, metadata, theme and resume providers
  page.tsx              The single page: all sections and the footer
  globals.css           Theme colours, background effect and shared styles
  api/contact/route.ts  Sends contact form messages through Resend
components/
  hero.tsx              Hero section with the water ripple
  about.tsx             About section and intro video
  projects.tsx          Project cards (edit your projects here)
  skills.tsx            Skills orbit and slingshot game
  experience.tsx        Experience timeline
  contact.tsx           Contact details and form
  navbar.tsx            Navigation, resume menu and theme toggle
  ...                   Theme, ripple, shatter and icon helpers
public/
  resume.pdf            The resume shown in the viewer
  game/                 Portrait images used by the orbit and game
  projects/             Project images
```

## Updating content

- **Projects** — edit the `projects` list in `components/projects.tsx`.
- **Experience** — edit the `experiences` list in `components/experience.tsx`.
- **Skills** — edit `SKILLS` in `components/skills.tsx`.
- **Resume** — replace `public/resume.pdf`.
- **Intro video** — add `public/intro-video.mp4` (and optionally `public/video-poster.jpg`). Until then, the About section shows a "Coming Soon" thumbnail.
- **Theme colours** — edit the colour variables at the top of `app/globals.css`.

## Deployment

The site deploys like any Next.js app, for example on [Vercel](https://vercel.com):

1. Import the repository.
2. Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `RESEND_TO_EMAIL` under **Settings → Environment Variables**.
3. Deploy, then send a test message through the contact form.

## Contact

- GitHub — [Deepti-Nanda](https://github.com/Deepti-Nanda)
- LinkedIn — [deepti-nanda](https://linkedin.com/in/deepti-nanda-271b352a3)