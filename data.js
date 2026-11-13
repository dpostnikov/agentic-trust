/*
 * Agentic Trust Standards Map — content.
 * Edit this file to change what the page shows. See README.md for the schema.
 * STD entries: n name, d description, u URL, rfc (number, if published as an RFC),
 *   track ("wg" working-group draft, "indiv" individual draft), concept (true for non-specs).
 * Loaded as a classic script so the page works when opened straight from disk.
 */

const KINDS = {
  user:     {name:"User", color:"--c-user", desc:"The human principal. Owns resources and authorises agents to act for them. Authenticated by an identity provider; their authority often derives from an organisation (employer, tenant)."},
  resource: {name:"Resource", color:"--c-resource", desc:"An API, tool or data set the agent wants to reach. Owned by a user or organisation, and must decide whether to trust both the agent and the authority it claims to carry."},
  agent:    {name:"Agent / Workload", color:"--c-agent", desc:"Software acting autonomously or semi-autonomously. Needs its own identity (what it is, who runs it) separate from the delegated authority it carries (on whose behalf it acts)."},
  org:      {name:"Organisation", color:"--c-org", desc:"A legal entity that employs users, owns resources or operates agents. Organisational identity anchors accountability: who is liable when an agent acts."},
  ta:       {name:"Trust anchor", color:"--c-ta", desc:"A party whose keys or statements others accept as a root of trust: an IdP, a federation operator, a CA or a trust-list publisher. It endorses organisations and their entities."},
  eco:      {name:"Ecosystem trust anchor", color:"--c-eco", desc:"The top of the trust hierarchy for a whole ecosystem (sector, jurisdiction, consortium). Local trust anchors are subordinates of it, which is what lets parties that never met establish trust."}
};
const COLS = ["user","resource","agent","org","ta"];

const NODES = [
  {id:"orgU", kind:"org", label:"Organisation", sub:"user's org", x:110, y:60},
  {id:"taU", kind:"ta", label:"Trust anchor", sub:"aka IdP", x:110, y:175},
  {id:"user", kind:"user", label:"User", x:340, y:115},
  {id:"resource", kind:"resource", label:"Resource", x:650, y:115},
  {id:"orgR", kind:"org", label:"Organisation", sub:"resource owner", x:870, y:60},
  {id:"taR", kind:"ta", label:"Trust anchor", sub:"resource side", x:870, y:175},
  {id:"agent", kind:"agent", label:"Agent / Workload", x:495, y:258, w:170},
  {id:"orgA", kind:"org", label:"Organisation", sub:"agent operator", x:340, y:375},
  {id:"taA", kind:"ta", label:"Trust anchor", sub:"agent side", x:650, y:375},
  {id:"eco", kind:"eco", label:"Ecosystem trust anchor", x:490, y:478, w:940, h:46}
];

const EDGES = [
  {id:"e-deleg", from:"orgU", to:"user", label:"delegation", bend:-14, std:["delegated-authority","oidc"],
   desc:"The organisation vouches for the user's role and entitlements, for example an employee acting within their job function."},
  {id:"e-authn", from:"taU", to:"user", label:"authentication", bend:14, std:["oidc","passkeys","oauth2"],
   desc:"The IdP authenticates the user and issues identity assertions others can rely on."},
  {id:"e-taU-org", from:"taU", to:"orgU", label:"endorses", bend:0, std:["oidfed","trust-marks"],
   desc:"The trust anchor stands behind the organisation, so relying parties can trust the identities it issues."},
  {id:"e-owns", from:"user", to:"resource", label:"owns", bend:0, std:["grant-mgmt","oauth2"],
   desc:"The user controls the resource and can grant or revoke access to it."},
  {id:"e-ownedby", from:"resource", to:"orgR", label:"owned by", bend:-14, std:["prm","entity-stmt"],
   desc:"The resource belongs to an organisation, which publishes its metadata and access policy."},
  {id:"e-taR-res", from:"taR", to:"resource", label:"endorses", bend:14, std:["oidfed","x509"],
   desc:"A trust anchor certifies the resource endpoint (TLS certificate, federation entity statement)."},
  {id:"e-taR-org", from:"taR", to:"orgR", label:"endorses", bend:0, std:["oidfed","lei"],
   desc:"The trust anchor vouches for the resource owner's organisational identity."},
  {id:"e-authorises", from:"user", to:"agent", label:"authorises", bend:16, std:["oauth2","ciba","grant-mgmt","token-exchange","par","rar","mission-shaping","mission-approval","mission-consent","mission-oauth"],
   desc:"The user grants the agent scoped authority. CIBA covers approvals the agent requests asynchronously; grant management lets the user review and revoke them."},
  {id:"e-accesses", from:"agent", to:"resource", label:"accesses", bend:22, std:["mtls","wpt","httpsig","authzen","mcp","a2a","mission-runtime","mission-authzen","mission-resource-access"],
   desc:"The agent calls the resource, proving its own identity per request, and the resource makes an authorisation decision."},
  {id:"e-operates", from:"orgA", to:"agent", label:"owns / operates", bend:-16, std:["spiffe-id","x509-svid","wit","cimd","client-instance-id"],
   desc:"The operating organisation issues the agent its workload identity and is accountable for its behaviour."},
  {id:"e-taA-agent", from:"taA", to:"agent", label:"endorses", bend:16, std:["oidfed","trust-marks","a2a-card"],
   desc:"A trust anchor attests to the agent: its metadata, its operator, possibly its certification (trust marks)."},
  {id:"e-taA-org", from:"taA", to:"orgA", label:"endorses", bend:0, std:["oidfed","lei"],
   desc:"The trust anchor vouches for the agent operator's organisational identity."},
  {id:"s-obo", from:"agent", to:"resource", label:"on behalf of user", bend:-40, suggested:true, std:["token-exchange","txn-tokens","id-jag","actor-profile","mission-oauth","mission-child","mission-cross-domain"],
   desc:"Suggested addition: the user's authority must travel with the agent's request so the resource can see both who is calling and for whom. This is the delegation chain the authorisation row covers."},
  {id:"s-fedU", from:"taU", to:"eco", label:"federates", suggested:true, std:["oidfed","entity-stmt"],
   desc:"Suggested addition: the user-side trust anchor is a subordinate of the ecosystem anchor, forming a verifiable trust chain."},
  {id:"s-fedA", from:"taA", to:"eco", label:"federates", suggested:true, std:["oidfed","entity-stmt","etsi-tl"],
   desc:"Suggested addition: the agent-side trust anchor chains up to the ecosystem anchor."},
  {id:"s-fedR", from:"taR", to:"eco", label:"federates", suggested:true, std:["oidfed","entity-stmt"],
   desc:"Suggested addition: the resource-side trust anchor chains up to the ecosystem anchor."}
];

const LAYERS = [
  {id:"discovery", name:"Discovery, metadata & policy", cells:{user:[], resource:["prm","as-meta","poppy-json"], agent:["cimd","dcr","oidfed","a2a-card"], org:["entity-stmt"], ta:["entity-stmt"]}},
  {id:"ident", name:"Identification", note:"external", cells:{user:["jwt-sub"], resource:["uri"], agent:["spiffe-id","wimse-id","did","client-id","client-instance-id"], org:["lei","entity-id"], ta:["entity-id"]}},
  {id:"creds", name:"Credentials", note:"issuance & provisioning", cells:{user:["access-token","refresh-token","passkeys"], resource:[], agent:["wit","wic","x509-svid","jwt-svid","x509","mission-mandate"], org:["x509","pkjwt"], ta:["x509","oidfed"]}},
  {id:"authn", name:"Authentication", cells:{user:["oauth2","oidc","pkce","device-grant","passkeys"], resource:["mtls","tls"], agent:["mtls","wpt","httpsig","pkjwt","spiffe-client-auth"], org:[], ta:["oidfed"]}},
  {id:"authz", name:"Authorisation & delegation", cells:{user:["oauth2","par","rar","grant-mgmt","ciba","mission-shaping","mission-approval","mission-consent"], resource:["authzen","introspection","jwt-at","mission-resource-access","mission-runtime","mission-authzen"], agent:["oauth2","dpop","txn-tokens","id-jag","identity-chaining","token-exchange","mission-oauth","mission-child","actor-profile"], org:["delegated-authority","mission-mas"], ta:["trust-marks","id-assertion-framework","mission-cross-domain"]}},
  {id:"protocols", name:"Protocols", cells:{user:["oauth2","oidc","passkeys"], resource:["mcp","a2a","openapi"], agent:["oauth2"], org:[], ta:["oidfed","etsi-tl"]}},
  {id:"domain", name:"Domain extensions", cells:{user:[], resource:["x402"], agent:[], org:[], ta:[]}}
];
const COMPLIANCE = {name:"Compliance & governance", std:["ssf","caep","risc","wise","oauth-bcp","fapi2","status-list","mission-status","mission-signals","mission-status-list","mission-containment","mission-audit"]};

/* Profiles: named subsets of STD, selectable above the map (also via #aims / #poppy in the URL) */
const PROFILES = {
  aims: {
    name:"AIMS", full:"Agent Identity Management System", by:"IETF WIMSE working group",
    u:"https://datatracker.ietf.org/doc/draft-ietf-wimse-aims/",
    summary:"Treats an AI agent as a workload. Composes WIMSE/SPIFFE identity and credentials with OAuth for authorisation and delegation, and Shared Signals for monitoring and remediation. Layers: identifier, credentials, provisioning, authentication, authorisation, monitoring, policy, compliance.",
    open:["No specific attestation or posture evidence format","Policy language and compliance criteria left to deployments","Organisation and trust-anchor layers out of scope"],
    std:["wimse-id","spiffe-id","client-id","wit","wic","x509-svid","jwt-svid","mtls","wpt","httpsig","pkjwt","spiffe-client-auth",
         "oauth2","jwt-at","introspection","dpop","txn-tokens","token-exchange","identity-chaining","id-jag","ciba","authzen",
         "as-meta","prm","cimd","dcr","a2a","mcp","ssf","caep","risc","wise","oauth-bcp","fapi2"]
  },
  poppy: {
    name:"Poppy", full:"Personal Agent Protocol", by:"Sierra and Meta (draft)",
    u:"https://personalagentprotocol.org/",
    summary:"How a user's personal agent discovers a business, signs in to it with the user's approval, and talks to its agent, website or APIs. Built on OAuth, JWT, HTTPS, OpenAPI and MCP: CIMD for agent identity, DPoP-bound session tokens, refresh tokens as account tokens.",
    open:["Payments not yet addressed","Mediated sign-in defines its own exchange, no existing standard","Format of the signed session-start assertion not named","No workload identity or federation layer"],
    std:["cimd","client-id","oauth2","access-token","refresh-token","dpop","pkce","device-grant","as-meta","poppy-json","mcp","openapi"]
  },
  mission: {
    name:"Mission-Bound", full:"Mission-Bound Authorization", by:"Karl McGuinness (individual drafts)",
    u:"https://notes.karlmcguinness.com/mission-handbook/",
    summary:"Adds a durable, human-approved Mission: the approved task that authority is derived from, bound to and gated on. A client submits a Mission Intent via PAR, the authorization server derives RAR authorization details, records the Mission, and every token carries a mission claim. Runtime enforcement checks each consequential action against the Mission through AuthZEN; lifecycle changes propagate by status lookups, Status Lists and Shared Signals. A family of 52 drafts; the key ones are shown.",
    open:["Individual drafts from one author; none adopted by a working group","Turning a request into a Mission Intent is a client-side component, not a wire protocol","Revoking a Mission stops new tokens but doesn't recall tokens already issued","Agent workload identity left to AIMS / WIMSE"],
    std:["oauth2","par","rar","pkce","dpop","token-exchange","introspection","jwt-at","as-meta","prm","uri","mtls","oauth-bcp","oidc","device-grant","authzen","id-jag","ssf","status-list",
         "mission-oauth","mission-shaping","mission-approval","mission-consent","mission-resource-access","mission-runtime","mission-authzen","mission-child","mission-cross-domain","mission-mas","mission-mandate",
         "mission-status","mission-signals","mission-status-list","mission-containment","mission-audit","actor-profile","client-instance-id","id-assertion-framework"]
  }
};

const STD = {
  "prm":{rfc:9728, n:"Protected Resource Metadata", d:"A resource publishes which authorization servers it trusts, the scopes it supports and how tokens must be presented, so agents can discover how to get access.", u:"https://www.rfc-editor.org/rfc/rfc9728"},
  "cimd":{track:"wg", n:"Client ID Metadata Document", d:"The client_id is an HTTPS URL that resolves to the client's metadata, removing the need for dynamic registration with every server. Adopted by MCP.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/"},
  "oidfed":{n:"OpenID Federation", d:"Builds trust chains of signed entity statements from a leaf entity up to a trust anchor, with metadata policy applied along the chain.", u:"https://openid.net/specs/openid-federation-1_0.html"},
  "entity-stmt":{n:"Entity Statement", d:"A signed JWT in OpenID Federation describing an entity's keys, metadata and policy, issued by itself or by a superior.", u:"https://openid.net/specs/openid-federation-1_0.html"},
  "entity-id":{n:"Entity Identifier", d:"An HTTPS URL that identifies an entity in OpenID Federation and from which its configuration can be fetched.", u:"https://openid.net/specs/openid-federation-1_0.html"},
  "trust-marks":{n:"Trust Marks", d:"Signed statements in OpenID Federation that an entity meets a profile or certification, issued by an accredited trust mark issuer.", u:"https://openid.net/specs/openid-federation-1_0.html"},
  "a2a-card":{n:"A2A Agent Card", d:"A JSON document describing an agent's skills, endpoints and authentication requirements, used for discovery in the Agent2Agent protocol.", u:"https://a2a-protocol.org/"},
  "a2a":{n:"Agent2Agent (A2A)", d:"A protocol for agents to discover each other and exchange tasks and messages, using standard web authentication schemes.", u:"https://a2a-protocol.org/"},
  "mcp":{n:"Model Context Protocol", d:"A protocol for agents to call tools and read resources. Its authorization profile builds on OAuth 2.1, Protected Resource Metadata and client ID metadata documents.", u:"https://modelcontextprotocol.io/"},
  "jwt-sub":{rfc:7519, n:"JWT sub claim", d:"The subject identifier in a JWT, unique within its issuer. Paired with iss it identifies the user.", u:"https://www.rfc-editor.org/rfc/rfc7519"},
  "uri":{rfc:8707, n:"Resource URI", d:"The resource's absolute URI, also used as an OAuth resource indicator to audience-restrict tokens.", u:"https://www.rfc-editor.org/rfc/rfc8707"},
  "spiffe-id":{n:"SPIFFE ID", d:"A URI of the form spiffe://trust-domain/path naming a workload within a trust domain.", u:"https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/"},
  "x509-svid":{n:"X.509-SVID", d:"A SPIFFE identity document carried as an X.509 certificate, used for mTLS between workloads.", u:"https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/"},
  "jwt-svid":{n:"JWT-SVID", d:"A SPIFFE identity document carried as a JWT, for cases where mTLS isn't available end to end.", u:"https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/"},
  "wimse-id":{track:"wg", n:"WIMSE workload identifier", d:"The IETF WIMSE working group's URI-based workload identifier, designed to work across platforms and trust domains.", u:"https://datatracker.ietf.org/wg/wimse/about/"},
  "wit":{track:"wg", n:"WIMSE Workload Identity Token", d:"A JWT binding a workload identifier to a public key, issued by the workload's identity server.", u:"https://datatracker.ietf.org/wg/wimse/about/"},
  "wpt":{track:"wg", n:"WIMSE Workload Proof Token", d:"A per-request proof of possession of the key in the identity token, so stolen tokens can't be replayed.", u:"https://datatracker.ietf.org/wg/wimse/about/"},
  "did":{n:"Decentralized Identifier", d:"W3C DID: an identifier resolvable to a document of keys and endpoints, without a central registry.", u:"https://www.w3.org/TR/did-core/"},
  "client-id":{rfc:6749, n:"OAuth client_id", d:"The identifier an authorization server assigns to, or accepts for, a client application.", u:"https://www.rfc-editor.org/rfc/rfc6749"},
  "lei":{n:"Legal Entity Identifier", d:"ISO 17442 identifier for legal entities, administered by GLEIF. The vLEI variant packages it as verifiable credentials, including role credentials.", u:"https://www.gleif.org/"},
  "access-token":{rfc:6749, n:"OAuth access token", d:"The credential an agent presents to a resource on the user's behalf. Should be audience-restricted and sender-constrained.", u:"https://www.rfc-editor.org/rfc/rfc6749"},
  "passkeys":{n:"Passkeys", d:"FIDO2 / WebAuthn credentials for phishing-resistant user authentication.", u:"https://fidoalliance.org/passkeys/"},
  "x509":{rfc:5280, n:"X.509 certificates", d:"Public-key certificates chained to a certificate authority. The base of TLS and many organisational credentials.", u:"https://www.rfc-editor.org/rfc/rfc5280"},
  "pkjwt":{rfc:7523, n:"private_key_jwt", d:"Client authentication by a JWT signed with the client's private key (OIDC Core and the JWT client-auth profile).", u:"https://www.rfc-editor.org/rfc/rfc7523"},
  "oauth2":{rfc:6749, n:"OAuth 2.x", d:"The delegated authorization framework, consolidated with its security updates in the OAuth 2.1 draft.", u:"https://www.rfc-editor.org/rfc/rfc6749"},
  "oidc":{n:"OpenID Connect", d:"Identity layer on OAuth 2.0: authenticates the user and issues an ID token.", u:"https://openid.net/specs/openid-connect-core-1_0.html"},
  "mtls":{rfc:8705, n:"Mutual TLS", d:"Both sides present certificates. RFC 8705 defines this for OAuth client authentication and binds tokens to the client certificate.", u:"https://www.rfc-editor.org/rfc/rfc8705"},
  "tls":{rfc:8446, n:"TLS", d:"Transport security that authenticates the resource's endpoint to the caller.", u:"https://www.rfc-editor.org/rfc/rfc8446"},
  "httpsig":{rfc:9421, n:"HTTP Message Signatures", d:"Signs selected components of an HTTP request, proving the sender and integrity across proxies.", u:"https://www.rfc-editor.org/rfc/rfc9421"},
  "grant-mgmt":{n:"Grant Management", d:"OpenID FAPI extension to query, update and revoke the grants a user has given a client.", u:"https://openid.net/specs/fapi-grant-management.html"},
  "ciba":{n:"CIBA", d:"Client-Initiated Backchannel Authentication: the client asks for approval and the user confirms on a separate device. A natural fit for agents seeking human sign-off.", u:"https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html"},
  "authzen":{n:"AuthZEN", d:"OpenID standard API between policy enforcement and policy decision points, so resources can ask a PDP for access decisions.", u:"https://openid.net/wg/authzen/"},
  "txn-tokens":{track:"wg", n:"Transaction Tokens", d:"Short-lived tokens that carry user identity and request context through a chain of internal workloads.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/"},
  "id-jag":{track:"wg", n:"Identity Assertion Authorization Grant", d:"ID-JAG: the user's IdP issues an assertion the agent exchanges for an access token in another domain, keeping the enterprise IdP in control of cross-app access.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/"},
  "token-exchange":{rfc:8693, n:"Token Exchange", d:"Trades one token for another, with act and may_act claims expressing delegation chains.", u:"https://www.rfc-editor.org/rfc/rfc8693"},
  "delegated-authority":{n:"Delegated authority", concept:true, d:"How an organisation expresses that a person or agent may act for it. No single standard covers this; vLEI role credentials and federation metadata are partial approaches."},
  "etsi-tl":{n:"ETSI Trusted Lists", d:"ETSI TS 119 612 lists of qualified trust service providers, used in the EU eIDAS ecosystem.", u:"https://www.etsi.org/"},
  "x402":{n:"x402", d:"An open payments protocol built on HTTP 402 Payment Required, letting agents pay for resources per request.", u:"https://www.x402.org/"},
  "ssf":{n:"Shared Signals Framework", d:"OpenID framework for exchanging security events between parties in near real time.", u:"https://openid.net/wg/sharedsignals/"},
  "caep":{n:"CAEP", d:"Continuous Access Evaluation Profile: session and credential change events so access can be revoked mid-session.", u:"https://openid.net/wg/sharedsignals/"},
  "risc":{n:"RISC", d:"Risk Incident Sharing and Coordination: account-level security events such as compromise or credential change.", u:"https://openid.net/wg/sharedsignals/"},
  "wise":{n:"WISE", d:"Workload Identity Security Events: a Shared Signals profile for events about workloads and their credentials.", u:"https://openid.net/wg/sharedsignals/"},
  "as-meta":{rfc:8414, n:"AS Metadata", d:"An authorization server publishes its endpoints, supported grants and keys at a well-known URL.", u:"https://www.rfc-editor.org/rfc/rfc8414"},
  "dcr":{rfc:7591, n:"Dynamic Client Registration", d:"A client registers itself with an authorization server at runtime.", u:"https://www.rfc-editor.org/rfc/rfc7591"},
  "wic":{track:"wg", n:"WIMSE Workload Identity Certificate", d:"The X.509 form of a WIMSE workload credential, used for mTLS.", u:"https://datatracker.ietf.org/doc/draft-ietf-wimse-workload-creds/"},
  "spiffe-client-auth":{track:"wg", n:"OAuth SPIFFE Client Authentication", d:"Lets a workload authenticate to an OAuth server with its SPIFFE credential instead of a client secret.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-spiffe-client-auth/"},
  "introspection":{rfc:7662, n:"Token Introspection", d:"A resource asks the authorization server whether a token is active and what it allows.", u:"https://www.rfc-editor.org/rfc/rfc7662"},
  "jwt-at":{rfc:9068, n:"JWT Access Tokens", d:"A standard JWT format for access tokens so resources can validate them locally.", u:"https://www.rfc-editor.org/rfc/rfc9068"},
  "dpop":{rfc:9449, n:"DPoP", d:"Binds tokens to a key the client holds, proven per request, so stolen tokens can't be replayed.", u:"https://www.rfc-editor.org/rfc/rfc9449"},
  "identity-chaining":{track:"wg", n:"Identity & Authorization Chaining", d:"Carries identity and authority across trust domains by combining token exchange with a JWT authorization grant.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/"},
  "oauth-bcp":{rfc:9700, n:"OAuth Security BCP", d:"Current best practice for securing OAuth deployments.", u:"https://www.rfc-editor.org/rfc/rfc9700"},
  "fapi2":{n:"FAPI 2.0 Security Profile", d:"OpenID high-assurance OAuth profile: sender-constrained tokens, PAR, strict client authentication.", u:"https://openid.net/wg/fapi/"},
  "poppy-json":{n:"poppy.json discovery", d:"Poppy's /.well-known/poppy.json document, telling a personal agent how to sign in to and interact with a business.", u:"https://personalagentprotocol.org/"},
  "refresh-token":{rfc:6749, n:"OAuth refresh token", d:"Long-lived credential for getting new access tokens. Poppy uses it as the agent's account token.", u:"https://www.rfc-editor.org/rfc/rfc6749#section-1.5"},
  "pkce":{rfc:7636, n:"Auth code + PKCE", d:"The authorization code flow with proof key, for interactive sign-in by public clients.", u:"https://www.rfc-editor.org/rfc/rfc7636"},
  "device-grant":{rfc:8628, n:"Device Authorization Grant", d:"The user approves on a second device, useful when the agent has no browser.", u:"https://www.rfc-editor.org/rfc/rfc8628"},
  "openapi":{n:"OpenAPI", d:"Machine-readable description of HTTP APIs, so agents can call them without custom integration.", u:"https://spec.openapis.org/oas/latest.html"},
  "par":{rfc:9126, n:"Pushed Authorization Requests", d:"The client pushes its authorization request to the server before redirecting the user, so the request is integrity-protected and can be large.", u:"https://www.rfc-editor.org/rfc/rfc9126"},
  "rar":{rfc:9396, n:"Rich Authorization Requests", d:"Fine-grained authorization_details objects in place of flat scopes: which resource, which actions, under which constraints.", u:"https://www.rfc-editor.org/rfc/rfc9396"},
  "status-list":{track:"wg", n:"Token Status List", d:"A signed, compressed bit array publishing the status (valid, revoked, suspended) of many tokens at once.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/"},
  "mission-oauth":{track:"indiv", n:"Mission-Bound Authorization for OAuth 2.0", d:"The core binding. A client submits a Mission Intent via PAR; the authorization server derives RAR authority, binds it to the approver's consent, records a durable Mission and gates every token issuance on its state. Tokens carry a mission claim.", u:"https://datatracker.ietf.org/doc/draft-mcguinness-oauth-mission/"},
  "mission-shaping":{track:"indiv", n:"Mission Intent Shaping", d:"Informational. Describes the client-side Mission Shaper that turns an open-ended user request into a candidate Mission Intent and authority proposal.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-mission-shaping.md"},
  "mission-approval":{track:"indiv", n:"Mission Deferred Approval", d:"Lets a human's review of a proposed Mission be asynchronous, by profiling deferred token responses.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-oauth-mission-approval.md"},
  "mission-consent":{track:"indiv", n:"Mission Consent Evidence", d:"Commits exactly what consent disclosure the approver was shown, with a rendering hash and a signed evidence object.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-oauth-mission-consent-evidence.md"},
  "mission-resource-access":{track:"indiv", n:"Mission Resource Access Profile", d:"A general-purpose RAR authorization_details type: one resource, its permitted actions and machine-checkable constraints.", u:"https://datatracker.ietf.org/doc/draft-mcguinness-oauth-mission-resource-access/"},
  "mission-runtime":{track:"indiv", n:"Mission-Bound Runtime Enforcement", d:"No consequential action runs until an enforcement point gets a permit from a decision point that checks the action and its parameters against the Mission.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-mission-runtime.md"},
  "mission-authzen":{track:"indiv", n:"Mission AuthZEN Profile", d:"Maps Mission runtime decisions onto the OpenID AuthZEN Authorization API.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-mission-authzen.md"},
  "mission-child":{track:"indiv", n:"Mission Child Delegation", d:"A parent Mission authorizes a Child Mission for a sub-agent, with explicit lineage and strictly narrower authority.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-oauth-mission-child-delegation.md"},
  "mission-cross-domain":{track:"indiv", n:"Mission Cross-Domain Projection", d:"Lets an authorization server in another trust domain honor a Mission it did not issue, via audience-scoped projections from the Mission Issuer.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-oauth-mission-cross-domain.md"},
  "mission-mas":{track:"indiv", n:"Mission Authority Server", d:"A standalone service that validates Mission Intents, runs approvals, records Missions and serves their state beside existing authorization servers. It issues no tokens itself.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-mission-authority-server.md"},
  "mission-mandate":{track:"indiv", n:"Mission Mandate", d:"A signed, portable statement of a Mission's committed facts (task, consented authority, principals, expiry) that parties outside the issuing domain can verify.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-mission-mandate.md"},
  "mission-status":{track:"indiv", n:"Mission Status and Lifecycle", d:"Signed Mission status lookups by mission_id, freshness rules and lifecycle states.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-oauth-mission-status.md"},
  "mission-signals":{track:"indiv", n:"Mission Lifecycle Signals", d:"A Shared Signals profile: the Mission Issuer emits a security event whenever a Mission changes state, bounding revocation latency.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-oauth-mission-signals.md"},
  "mission-status-list":{track:"indiv", n:"Mission Status List", d:"Publishes Mission state for a whole fleet as an OAuth Token Status List.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-oauth-mission-status-list.md"},
  "mission-containment":{track:"indiv", n:"Mission Containment", d:"Narrows a live Mission without ending it when a protected event fires, such as a tainted read or an anomaly signal.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-oauth-mission-containment.md"},
  "mission-audit":{track:"indiv", n:"Mission Audit Transparency", d:"Makes Mission evidence records tamper-evident, append-only and independently verifiable.", u:"https://github.com/mcguinness/mission-bound-authorization/blob/main/draft-mcguinness-mission-audit.md"},
  "actor-profile":{track:"indiv", n:"OAuth Actor Profile for Delegation", d:"Consistent rules for the act claim across assertion grants, token exchange and JWT access tokens, so delegation chains read the same everywhere.", u:"https://datatracker.ietf.org/doc/draft-mcguinness-oauth-actor-profile/"},
  "client-instance-id":{track:"indiv", n:"Client Instance Identification", d:"Identifies individual instances of one OAuth client, building on attestation-based client authentication.", u:"https://datatracker.ietf.org/doc/draft-mcguinness-oauth-client-instance-id/"},
  "id-assertion-framework":{track:"indiv", n:"Identity Assertion Trust Framework", d:"How a resource's authorization server publishes which assertion issuers it trusts, for ID-JAG and similar cross-domain grants.", u:"https://datatracker.ietf.org/doc/draft-mcguinness-oauth-id-assertion-framework/"}
};
