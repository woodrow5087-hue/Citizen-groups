# F-06 follow-up — Today / Groups shared conversation read model

**Status:** Draft review slice on `rally-point/develop` only. No production release, real member integration, or legacy data migration.

## Data ownership and behavior

- Today’s **latest conversation** teaser now reads the same validated F-02 versioned Wednesday conversation snapshot as the actual **Groups → Conversation** screen.
- Display the **latest sent message** by the repository’s canonical date/id order. Use its verified-in-fixture author name, original UTC `createdAt` converted to the browser’s local display time, and escaped body. Pending/failed messages cannot become teasers.
- Unread is the repository’s **per-user F-02 read cursor**. Count only sent messages from **other** participants after that cursor; never infer a receipt from opening Today, a prayer post, the old `groupMessages` array, or `seenGroupSignature`.
- Opening Groups → Conversation marks the modern thread read through its existing controller. Today and the contextual Groups conversation-tab label reflect the same saved cursor on next render. The Today attention indicator, notifications sheet and all-caught-up copy use that same source.
- If modern storage is corrupt, unsupported, or inaccessible, explicitly show a preview-unavailable state and avoid claiming the conversation is read or empty. The versioned snapshot is **not rewritten** in this case.
- Member discovery/revocation hides private preview and unread indicators. This is still fictional local access, not production authentication.
- The explicit **All caught up** demo control advances the actual mock read cursor while preserving drafts, replies, messages and prior stored data. A subsequent Connected fixture does **not** synthesize a new message just to display an unread badge.
- Cross-tab storage changes refresh Today or a non-chat Groups pane without resetting an active chat composer.

## Legacy and scope boundaries

- `rallypoint-phase1-2026` → `groupMessages` remains intact, rendered and writable under **Your earlier saved messages** in its original author/time labels and saved order.
- `rallypoint-wednesday-chat-lab-v1` remains the modern v1 storage key for sent/pending/failed messages, reactions, read cursors, replies and drafts.
- **No conversion** of old records to modern messages; no historical timestamp invention, ID guesses, migration, cross-user receipts, network traffic, or backend synchronization.
- Existing red/cream/charcoal styling, Today hierarchy, four-tab navigation, Team/Read features, and standalone F-06 lab are preserved.

## Acceptance checklist

- [ ] Run `npm test` (including `test/conversation-read-model.test.cjs`).
- [ ] Run `npm run build`.
- [ ] Run `npm run test:groups-integrated`, `npm run test:chat-lab`, and existing browser/axe fixtures.
- [ ] In preview, validate: first-load Today shows the same newest sent message as Groups; opening chat clears unread; sending a legacy archive message **does not replace** Today’s teaser; new modern message updates it; own/pending/failed messages do not inflate unread.
- [ ] Verify malformed saved modern state leaves its bytes intact and preserved legacy messages remain accessible.
- [ ] Owner reviews on iPhone and approves before merging into `rally-point/develop`. `main`/production are untouched.
