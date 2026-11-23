# Rally One development baseline

[Draft design proof #100](https://github.com/woodrow5087-hue/Citizen-groups/pull/100) supplies the title artwork, charcoal and Citizen red identity, Today card layout, and portrait and community imagery. The integration applies that design to the shared Rally Point app on Develop. Today uses the existing priority board and Ask Rally. Groups, Team, and Read use their existing screen renderers, and Blank Battle retains its own presentation.

## Review the first visit

A Netlify pull request preview opens Rally One by default. The first visit presents the title, then Welcome. Choose Create account, select a campus and connection, personalize the local demo profile, and open Today. Today displays the saved name and campus and uses the selected group and team preferences to determine which fixture cards to show.

Sign in opens a locked demo. Selecting Leader during setup does not grant leader permissions. Account setup creates a profile on the current browser only. Returning profiles open Today, and using the Back button retains the current setup choices until confirmation.

| Review route | Experience |
| --- | --- |
| `/` | Default Rally One in a pull request deploy preview |
| `/?rallyOne=1&welcome=1` | Replay the title and first-visit screens |
| `/?rallyOne=0` | Previous Develop preview default |
| `/?f09=legacy` or `/?f09=1` | Compare original Today or Smart Stack |

Run `CONTEXT=deploy-preview npm run build` to reproduce the review default locally. The Preview QA workflow checks the account journey and shared app actions at 320, 390, and 430 px, and saves the title, onboarding steps, and tab screenshots under `test-results/preview-today`. Develop branch deployments can adopt the review default after approval. Production builds keep their current default.
