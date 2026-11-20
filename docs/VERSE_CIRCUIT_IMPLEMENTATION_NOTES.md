# Verse Circuit · By heart lab

Play the standalone John 15:12 level at `/verse-circuit-lab.html`. From a checkout, build and serve the same static files used by the Deploy Preview.

```sh
npm ci
npm run build
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173/verse-circuit-lab.html`.

## Play the level

1. **Trace.** Read the lit opening phrase. Follow the questions to reveal the instruction and ending, then read the whole path before starting Link.
2. **Link.** The phrase modules begin in shuffled order. Choose the next phrase to dock it into the highlighted socket. A wrong choice keeps your connections in place. **Get a hint** highlights the next module and explains its role.
3. **Echo.** Type the missing words in order, then recall the whole closing phrase. You can finish there or try the full verse from memory. Capitalization, punctuation and extra spaces are optional. A hint or **Study the verse** marks help for that step and keeps your draft. **Finish with study** preserves any steps you already recalled.
4. **Complete.** Review the verse and see which recall steps you finished from memory or with help. **Play again** changes the order of the Link modules. **Restart round** clears the current attempt and keeps its layout.

Use Tab to reach any control, then Enter or Space to activate it. The lab announces hints, corrections and completed connections. Reduced-motion mode keeps the same progress cues.

## Implementation

- The review branch starts at `fcc7d6d` on `rally-point/verse-circuit-spike-v01`. The first By heart implementation is preserved at `a25d9c3` on `rally-point/scripture-memory`.
- The lab reads the existing BSB record in `rallypoint-memorize.js`. Its passage definition selects the phrase boundaries and missing words; the circuit and recall rules use that data to handle different phrase counts. Only John 15:12 is configured. The Berean Standard Bible is dedicated to the public domain. [Publisher terms](https://berean.bible/terms.htm)
- The lab saves the current round in `rallypoint-verse-circuit-lab-v1`, including the docked phrases, recall draft and result for each step. Earlier saved rounds open at their original stage with their original phrase order. Earlier Echo drafts and outcomes carry over as closing-phrase practice. Data is local to this browser and preview origin.
- Recall is marked as assisted when you view a clue or re-study that recall step. Link hints are tracked separately. An optional full-verse attempt counts as a result only after a successful check.
- The first By heart design contributes deliberate pacing, tactile phrase controls, live feedback, forgiving text matching and a quiet replay. Its red-and-cream editorial art and whole-verse recall remain available in the preserved commit for later design review.

## Verification

```sh
npm test
npm run build
npm run test:verse-circuit
npm run test:browser
npm run test:onboarding
```

The lab browser suite plays the real build with touch and keyboard and captures 390 × 844 screenshots. It checks 320 px layout, touch target dimensions, mid-round resume, reduced motion, and automated accessibility. Physical iPhone Safari, dictation and VoiceOver still need a playtest.

[TRACE](verse-circuit/screenshots/trace.png) · [LINK](verse-circuit/screenshots/link.png) · [ECHO words](verse-circuit/screenshots/echo-words.png) · [ECHO phrase](verse-circuit/screenshots/echo-phrase.png) · [ECHO full verse](verse-circuit/screenshots/echo-full.png) · [COMPLETE](verse-circuit/screenshots/complete.png)
