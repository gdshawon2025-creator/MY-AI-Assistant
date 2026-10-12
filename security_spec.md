# Security Specification for Portfolio Hub

## 1. Data Invariants
- Anyone can read/list portfolio projects and the creator profile so that visitors on any device can explore the portfolio.
- Only authenticated creators or admin (`gdyounus2025@gmail.com`) can create, edit, or delete projects and update the profile.
- All documents must adhere strictly to length limits, schema definitions, and non-empty required fields.
- Contact messages can be created by any visitor with valid name, email, and message, but only the admin/owner can read or delete them.

## 2. Dirty Dozen Payloads
1. Anonymous user trying to delete a project.
2. Unauthenticated user trying to overwrite the profile.
3. Authenticated user trying to create a project with missing title.
4. User trying to create a project with 500-character category.
5. User trying to inject a 10MB string into client or role.
6. User trying to inject invalid characters into document ID.
7. Unauthenticated user trying to list all private contact inquiries.
8. Non-admin trying to update another user's project without permission.
9. Contact message payload with empty message.
10. Contact message with invalid email format or oversized content.
11. Attempting to set admin privileges or bypass auth checks.
12. Attempting to tamper with timestamps or shadow fields.

## 3. Policy Summary
- `match /projects/{projectId}`: read allowed for all; write allowed for signed-in verified creator or admin `gdyounus2025@gmail.com`.
- `match /profile/{profileId}`: read allowed for all; write allowed for signed-in verified creator or admin.
- `match /contact_messages/{messageId}`: create allowed with valid payload; read/delete only for admin `gdyounus2025@gmail.com`.
