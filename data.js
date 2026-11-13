/*
 * Agentic Trust Map — content.
 * Edit this file to change what the page shows. See README.md for the schema.
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
  {id:"e-authorises", from:"user", to:"agent", label:"authorises", bend:16, std:["oauth2","ciba","grant-mgmt","token-exchange"],
   desc:"The user grants the agent scoped authority. CIBA covers approvals the agent requests asynchronously; grant management lets the user review and revoke them."},
  {id:"e-accesses", from:"agent", to:"resource", label:"accesses", bend:22, std:["mtls","wpt","httpsig","authzen","mcp","a2a"],
   desc:"The agent calls the resource, proving its own identity per request, and the resource makes an authorisation decision."},
  {id:"e-operates", from:"orgA", to:"agent", label:"owns / operates", bend:-16, std:["spiffe-id","x509-svid","wit","cimd"],
   desc:"The operating organisation issues the agent its workload identity and is accountable for its behaviour."},
  {id:"e-taA-agent", from:"taA", to:"agent", label:"endorses", bend:16, std:["oidfed","trust-marks","a2a-card"],
   desc:"A trust anchor attests to the agent: its metadata, its operator, possibly its certification (trust marks)."},
  {id:"e-taA-org", from:"taA", to:"orgA", label:"endorses", bend:0, std:["oidfed","lei"],
   desc:"The trust anchor vouches for the agent operator's organisational identity."},
  {id:"s-obo", from:"agent", to:"resource", label:"on behalf of user", bend:-40, suggested:true, std:["token-exchange","txn-tokens","id-jag"],
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
  {id:"ident", name:"Identification", note:"external", cells:{user:["jwt-sub"], resource:["uri"], agent:["spiffe-id","wimse-id","did","client-id"], org:["lei","entity-id"], ta:["entity-id"]}},
  {id:"creds", name:"Credentials", note:"issuance & provisioning", cells:{user:["access-token","refresh-token","passkeys"], resource:[], agent:["wit","wic","x509-svid","jwt-svid","x509"], org:["x509","pkjwt"], ta:["x509","oidfed"]}},
  {id:"authn", name:"Authentication", cells:{user:["oauth2","oidc","pkce","device-grant","passkeys"], resource:["mtls","tls"], agent:["mtls","wpt","httpsig","pkjwt","spiffe-client-auth"], org:[], ta:["oidfed"]}},
  {id:"authz", name:"Authorisation & delegation", cells:{user:["oauth2","grant-mgmt","ciba"], resource:["authzen","introspection","jwt-at"], agent:["oauth2","dpop","txn-tokens","id-jag","identity-chaining","token-exchange"], org:["delegated-authority"], ta:["trust-marks"]}},
  {id:"protocols", name:"Protocols", cells:{user:["oauth2","oidc","passkeys"], resource:["mcp","a2a","openapi"], agent:["oauth2"], org:[], ta:["oidfed","etsi-tl"]}},
  {id:"domain", name:"Domain extensions", cells:{user:[], resource:["x402"], agent:[], org:[], ta:[]}}
];
const COMPLIANCE = {name:"Compliance & governance", std:["ssf","caep","risc","wise","oauth-bcp","fapi2"]};

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
    u:"https://www.descope.com/learn/post/personal-agent-protocol",
    summary:"How a user's personal agent discovers a business, signs in to it with the user's approval, and talks to its agent, website or APIs. Built almost entirely on OAuth: CIMD for agent identity, DPoP-bound session tokens, refresh tokens as account tokens.",
    open:["Payments not yet addressed","Mediated sign-in defines its own exchange, no existing standard","Format of the signed session-start assertion not named","No workload identity or federation layer"],
    std:["cimd","client-id","oauth2","access-token","refresh-token","dpop","pkce","device-grant","as-meta","poppy-json","mcp","openapi"]
  }
};

const STD = {
  "prm":{n:"Protected Resource Metadata", d:"RFC 9728. A resource publishes which authorization servers it trusts, the scopes it supports and how tokens must be presented, so agents can discover how to get access.", u:"https://www.rfc-editor.org/rfc/rfc9728"},
  "cimd":{n:"Client ID Metadata Document", d:"The client_id is an HTTPS URL that resolves to the client's metadata, removing the need for dynamic registration with every server. Adopted by MCP.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/"},
  "oidfed":{n:"OpenID Federation", d:"Builds trust chains of signed entity statements from a leaf entity up to a trust anchor, with metadata policy applied along the chain.", u:"https://openid.net/specs/openid-federation-1_0.html"},
  "entity-stmt":{n:"Entity Statement", d:"A signed JWT in OpenID Federation describing an entity's keys, metadata and policy, issued by itself or by a superior.", u:"https://openid.net/specs/openid-federation-1_0.html"},
  "entity-id":{n:"Entity Identifier", d:"An HTTPS URL that identifies an entity in OpenID Federation and from which its configuration can be fetched.", u:"https://openid.net/specs/openid-federation-1_0.html"},
  "trust-marks":{n:"Trust Marks", d:"Signed statements in OpenID Federation that an entity meets a profile or certification, issued by an accredited trust mark issuer.", u:"https://openid.net/specs/openid-federation-1_0.html"},
  "a2a-card":{n:"A2A Agent Card", d:"A JSON document describing an agent's skills, endpoints and authentication requirements, used for discovery in the Agent2Agent protocol.", u:"https://a2a-protocol.org/"},
  "a2a":{n:"Agent2Agent (A2A)", d:"A protocol for agents to discover each other and exchange tasks and messages, using standard web authentication schemes.", u:"https://a2a-protocol.org/"},
  "mcp":{n:"Model Context Protocol", d:"A protocol for agents to call tools and read resources. Its authorization profile builds on OAuth 2.1, Protected Resource Metadata and client ID metadata documents.", u:"https://modelcontextprotocol.io/"},
  "jwt-sub":{n:"JWT sub claim", d:"The subject identifier in a JWT, unique within its issuer. Paired with iss it identifies the user.", u:"https://www.rfc-editor.org/rfc/rfc7519"},
  "uri":{n:"Resource URI", d:"The resource's absolute URI, also used as an OAuth resource indicator (RFC 8707) to audience-restrict tokens.", u:"https://www.rfc-editor.org/rfc/rfc8707"},
  "spiffe-id":{n:"SPIFFE ID", d:"A URI of the form spiffe://trust-domain/path naming a workload within a trust domain.", u:"https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/"},
  "x509-svid":{n:"X.509-SVID", d:"A SPIFFE identity document carried as an X.509 certificate, used for mTLS between workloads.", u:"https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/"},
  "jwt-svid":{n:"JWT-SVID", d:"A SPIFFE identity document carried as a JWT, for cases where mTLS isn't available end to end.", u:"https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/"},
  "wimse-id":{n:"WIMSE workload identifier", d:"The IETF WIMSE working group's URI-based workload identifier, designed to work across platforms and trust domains.", u:"https://datatracker.ietf.org/wg/wimse/about/"},
  "wit":{n:"WIMSE Workload Identity Token", d:"A JWT binding a workload identifier to a public key, issued by the workload's identity server.", u:"https://datatracker.ietf.org/wg/wimse/about/"},
  "wpt":{n:"WIMSE Workload Proof Token", d:"A per-request proof of possession of the key in the identity token, so stolen tokens can't be replayed.", u:"https://datatracker.ietf.org/wg/wimse/about/"},
  "did":{n:"Decentralized Identifier", d:"W3C DID: an identifier resolvable to a document of keys and endpoints, without a central registry.", u:"https://www.w3.org/TR/did-core/"},
  "client-id":{n:"OAuth client_id", d:"The identifier an authorization server assigns to, or accepts for, a client application.", u:"https://www.rfc-editor.org/rfc/rfc6749"},
  "lei":{n:"Legal Entity Identifier", d:"ISO 17442 identifier for legal entities, administered by GLEIF. The vLEI variant packages it as verifiable credentials, including role credentials.", u:"https://www.gleif.org/"},
  "access-token":{n:"OAuth access token", d:"The credential an agent presents to a resource on the user's behalf. Should be audience-restricted and sender-constrained.", u:"https://www.rfc-editor.org/rfc/rfc6749"},
  "passkeys":{n:"Passkeys", d:"FIDO2 / WebAuthn credentials for phishing-resistant user authentication.", u:"https://fidoalliance.org/passkeys/"},
  "x509":{n:"X.509 certificates", d:"Public-key certificates chained to a certificate authority. The base of TLS and many organisational credentials.", u:"https://www.rfc-editor.org/rfc/rfc5280"},
  "pkjwt":{n:"private_key_jwt", d:"Client authentication by a JWT signed with the client's private key (OIDC Core, RFC 7523).", u:"https://www.rfc-editor.org/rfc/rfc7523"},
  "oauth2":{n:"OAuth 2.x", d:"The delegated authorization framework (RFC 6749, consolidated in the OAuth 2.1 draft).", u:"https://oauth.net/2.1/"},
  "oidc":{n:"OpenID Connect", d:"Identity layer on OAuth 2.0: authenticates the user and issues an ID token.", u:"https://openid.net/specs/openid-connect-core-1_0.html"},
  "mtls":{n:"Mutual TLS", d:"Both sides present certificates. RFC 8705 also binds OAuth tokens to the client certificate.", u:"https://www.rfc-editor.org/rfc/rfc8705"},
  "tls":{n:"TLS", d:"Transport security that authenticates the resource's endpoint to the caller.", u:"https://www.rfc-editor.org/rfc/rfc8446"},
  "httpsig":{n:"HTTP Message Signatures", d:"RFC 9421. Signs selected components of an HTTP request, proving the sender and integrity across proxies.", u:"https://www.rfc-editor.org/rfc/rfc9421"},
  "grant-mgmt":{n:"Grant Management", d:"OpenID FAPI extension to query, update and revoke the grants a user has given a client.", u:"https://openid.net/specs/fapi-grant-management.html"},
  "ciba":{n:"CIBA", d:"Client-Initiated Backchannel Authentication: the client asks for approval and the user confirms on a separate device. A natural fit for agents seeking human sign-off.", u:"https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html"},
  "authzen":{n:"AuthZEN", d:"OpenID standard API between policy enforcement and policy decision points, so resources can ask a PDP for access decisions.", u:"https://openid.net/wg/authzen/"},
  "txn-tokens":{n:"Transaction Tokens", d:"Short-lived tokens that carry user identity and request context through a chain of internal workloads.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/"},
  "id-jag":{n:"Identity Assertion Authorization Grant", d:"ID-JAG: the user's IdP issues an assertion the agent exchanges for an access token in another domain, keeping the enterprise IdP in control of cross-app access.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/"},
  "token-exchange":{n:"Token Exchange", d:"RFC 8693. Trades one token for another, with act and may_act claims expressing delegation chains.", u:"https://www.rfc-editor.org/rfc/rfc8693"},
  "delegated-authority":{n:"Delegated authority", concept:true, d:"How an organisation expresses that a person or agent may act for it. No single standard covers this; vLEI role credentials and federation metadata are partial approaches."},
  "etsi-tl":{n:"ETSI Trusted Lists", d:"ETSI TS 119 612 lists of qualified trust service providers, used in the EU eIDAS ecosystem.", u:"https://www.etsi.org/"},
  "x402":{n:"x402", d:"An open payments protocol built on HTTP 402 Payment Required, letting agents pay for resources per request.", u:"https://www.x402.org/"},
  "ssf":{n:"Shared Signals Framework", d:"OpenID framework for exchanging security events between parties in near real time.", u:"https://openid.net/wg/sharedsignals/"},
  "caep":{n:"CAEP", d:"Continuous Access Evaluation Profile: session and credential change events so access can be revoked mid-session.", u:"https://openid.net/wg/sharedsignals/"},
  "risc":{n:"RISC", d:"Risk Incident Sharing and Coordination: account-level security events such as compromise or credential change.", u:"https://openid.net/wg/sharedsignals/"},
  "wise":{n:"WISE", d:"Workload Identity Security Events: a Shared Signals profile for events about workloads and their credentials.", u:"https://openid.net/wg/sharedsignals/"},
  "as-meta":{n:"AS Metadata", d:"RFC 8414. An authorization server publishes its endpoints, supported grants and keys at a well-known URL.", u:"https://www.rfc-editor.org/rfc/rfc8414"},
  "dcr":{n:"Dynamic Client Registration", d:"RFC 7591. A client registers itself with an authorization server at runtime.", u:"https://www.rfc-editor.org/rfc/rfc7591"},
  "wic":{n:"WIMSE Workload Identity Certificate", d:"The X.509 form of a WIMSE workload credential, used for mTLS.", u:"https://datatracker.ietf.org/doc/draft-ietf-wimse-workload-creds/"},
  "spiffe-client-auth":{n:"OAuth SPIFFE Client Authentication", d:"Lets a workload authenticate to an OAuth server with its SPIFFE credential instead of a client secret.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-spiffe-client-auth/"},
  "introspection":{n:"Token Introspection", d:"RFC 7662. A resource asks the authorization server whether a token is active and what it allows.", u:"https://www.rfc-editor.org/rfc/rfc7662"},
  "jwt-at":{n:"JWT Access Tokens", d:"RFC 9068. A standard JWT format for access tokens so resources can validate them locally.", u:"https://www.rfc-editor.org/rfc/rfc9068"},
  "dpop":{n:"DPoP", d:"RFC 9449. Binds tokens to a key the client holds, proven per request, so stolen tokens can't be replayed.", u:"https://www.rfc-editor.org/rfc/rfc9449"},
  "identity-chaining":{n:"Identity & Authorization Chaining", d:"Carries identity and authority across trust domains by combining token exchange with a JWT authorization grant.", u:"https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/"},
  "oauth-bcp":{n:"OAuth Security BCP", d:"RFC 9700. Current best practice for securing OAuth deployments.", u:"https://www.rfc-editor.org/rfc/rfc9700"},
  "fapi2":{n:"FAPI 2.0 Security Profile", d:"OpenID high-assurance OAuth profile: sender-constrained tokens, PAR, strict client authentication.", u:"https://openid.net/wg/fapi/"},
  "poppy-json":{n:"poppy.json discovery", d:"Poppy's /.well-known/poppy.json document, telling a personal agent how to sign in to and interact with a business.", u:"https://www.descope.com/learn/post/personal-agent-protocol"},
  "refresh-token":{n:"OAuth refresh token", d:"Long-lived credential for getting new access tokens. Poppy uses it as the agent's account token.", u:"https://www.rfc-editor.org/rfc/rfc6749#section-1.5"},
  "pkce":{n:"Auth code + PKCE", d:"RFC 7636. The authorization code flow with proof key, for interactive sign-in by public clients.", u:"https://www.rfc-editor.org/rfc/rfc7636"},
  "device-grant":{n:"Device Authorization Grant", d:"RFC 8628. The user approves on a second device, useful when the agent has no browser.", u:"https://www.rfc-editor.org/rfc/rfc8628"},
  "openapi":{n:"OpenAPI", d:"Machine-readable description of HTTP APIs, so agents can call them without custom integration.", u:"https://spec.openapis.org/oas/latest.html"}
};
