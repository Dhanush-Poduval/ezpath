# Ezpath UI behavior

Visual identity is documented in DESIGN.md. This redesign changes presentation, not route-solving rules or persistence.

| Capability | Canonical owner | Contract |
| --- | --- | --- |
| Navigation | Navbar and React Router | Planner, saved journeys and operator routes remain reachable on desktop and mobile. Mobile menu closes on navigation and Escape; Escape restores toggle focus. Route changes reset document scroll to the top. |
| Journey form | SearchControls, ProfileBuilder and journeyStore | Preserve existing validation, mobility constraints, pending and error behavior. |
| Select | Existing native form controls | Retain platform keyboard and popup behavior. |
| Saved journeys | journeyStore and idbStorage | Keep storage identifiers stable across branding changes. |
| Disruption simulation | operatorStore and shared Navbar toolbar | Keep simulation controls on application routes, with busy state and reset behavior. |
| Scrollbars | src/styles/index.css | Global visible scrollbar colors and forced-colors fallback. |
| Example comparison | LandingPage | Buttons expose pressed state; summary announces changes. Example data is labeled and does not mutate journey state. |

English is the current interface locale. Existing currency and route data remain unchanged. Reduced-motion preferences suppress GSAP and Framer Motion transitions. Scroll reveals run once per mounted content block and preserve readable content before activation; new route results are registered without replaying existing content. Operator scenarios expose pressed and busy states through native buttons. No new permission, external side effect or destructive workflow is introduced.
