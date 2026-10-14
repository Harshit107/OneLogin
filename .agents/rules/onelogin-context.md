# OneLogin Project Knowledge & Context

## Project Summary
- **Type**: OAuth 2.0 Centralized Identity Provider & SSO Authorization Server.
- **Entry point**: `app.js`.
- **Main documentation**: Refer to `docs/ARCHITECTURE.md` for complete technical details, endpoint schemas, and data models.
- **Code Intelligence**: CodeGraph is installed and indexed in `.codegraph/`. You can use `codegraph query <term>`, `codegraph explore <task>`, or `codegraph context <task>` in CLI.

## Key Architecture & Data Stores
- **OAuth Engine**: `src/controllers/oauth/oauthController.js` and `src/services/oauth/tokenService.js`.
- **MongoDB Models**: `src/model/` (User, OAuthClient, OAuthAuthCode, OAuthSession, OAuthToken, QRCode, VerificationLink).
- **Firebase Realtime Database**: `src/database/FirebaseHelper.js` handles developer project records and API keys.

## Critical Gotchas
1. **User.js Typo**: `userSchema.statics.findByCredentails` in `src/model/User.js` has a typo ('a' before 'i').
2. **Missing stringHelper.js**: `src/middlewares/userAuth.js` requires `../utils/stringHelper.js` which does not exist in `src/utils/`.
3. **JWT Env casing**: `.env` specifies `jwt=...` in lowercase while code checks `process.env.JWT`.
