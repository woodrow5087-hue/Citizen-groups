# Verse Circuit · By heart lab

Play the standalone John 15:12 level at `/verse-circuit-lab.html`. From a checkout, build and serve the same static files used by the Deploy Preview.

```sh
npm ci
npm run build
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173/verse-circuit-lab.html`.

## Play the level

1. **Trace.** Tap the three phrases from top to bottom. The path lights at each stage. Choose **Start connecting** when all three are active.
2. **Link.** The three phrase modules are shuffled on the circuit. Tap the phrases in verse order to move them into place. A wrong selection leaves every correct connection in place. **Get a hint** highlights the next phrase and explains its role.
3. **Echo.** Read the full verse again, then choose **Hide the verse**. Type or dictate only the closing phrase. The check ignores capitalization, punctuation and extra spaces. **Show me the verse** lets you study again. **Finish with study** ends the round without recording a successful recall.
4. **Complete.** Review the verse and your recall outcome. **Play again** changes the order of the Link modules. **Restart round** clears the current attempt and keeps its layout.

Use Tab to reach any control, then Enter or Space to activate it. The lab announces hints, corrections and completed connections. Reduced-motion mode keeps the same progress cues.

## Implementation

- The review branch starts at `fcc7d6d` on `rally-point/verse-circuit-spike-v01`. The first By heart implementation is preserved at `a25d9c3` on `rally-point/scripture-memory`.
- The lab reads the existing BSB record in `rallypoint-memorize.js` and splits it into three phrases without changing the wording. The Berean Standard Bible is dedicated to the public domain. [Publisher terms](https://berean.bible/terms.htm)
- The lab saves the current round in `rallypoint-verse-circuit-lab-v1`, including partial connections, hints and the recall draft. Data is local to this browser and preview origin. The lab leaves the integrated app and its storage alone.
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

[TRACE](verse-circuit/screenshots/trace.png) · [LINK](verse-circuit/screenshots/link.png) · [ECHO](verse-circuit/screenshots/echo.png) · [COMPLETE](verse-circuit/screenshots/complete.png)
