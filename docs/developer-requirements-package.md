# Planet Motors — Developer Requirements Package

---

## 1. The Website Blueprint (Information Architecture)

- **Visual Sitemap:** A hierarchical diagram showing all pages (Home, Search, Vehicle Details, Financing, Checkout) and how they connect.
- **User Flow Diagrams:** Step-by-step maps of the customer journey, such as the exact path a user takes from "browsing a car" to "completing a trade-in".
- **Wireframes:** Low-fidelity "skeletons" of key pages that show the placement of elements (buttons, filters, search bars) without any design or color.

---

## 2. Website Specification Document (The "Booklet")

This is a detailed written guide outlining the project's goals and technical constraints.

- **Functional Requirements:** A text-only list of exactly what the site must do (e.g., "The system must verify a user's credit score in under 10 seconds").
- **Technical Requirements:** Definitions of the technology stack, security measures (like SSL certificates), and third-party API integrations (e.g., payment gateways like Stripe or PayPal).
- **Business Logic:** Clear rules for complex processes, such as how vehicle pricing is calculated or how delivery windows are assigned.

---

## 3. Schema & Data Blueprint

Because a site like Carvana relies on massive amounts of data, you need to define the "brain" before building the "body".

- **Entity Relationship Diagram (ERD):** A graphical map of your database showing how users, vehicles, loans, and orders relate to each other.
- **API Documentation:** A guide for how different parts of the system (like the front-end and the inventory database) will talk to each other.

---

## 4. Brand & UI Style Guide

To maintain a high-end feel, consistency is key.

- **Design System:** A library of approved colours, typography, buttons, and form styles.
- **Content Strategy:** Guidelines on the tone of voice and high-quality photography standards for vehicle listings.

---

## 5. Compliance & Legal Requirements

For high-end e-commerce, these are non-negotiable.

- **Data Privacy (GDPR/CCPA):** Documentation on how you collect and secure customer data.
- **Accessibility Standards:** A commitment to meeting requirements so the site is usable for everyone.

---

## Functional Requirements Document (FRD) Outline

### 1. Project Overview & Scope

- **Purpose & Goals:** High-level vision (e.g., "Enable 100% online car buying with home delivery").
- **Target Audience:** Definitions for different user roles: Guest, Registered Buyer, Seller/Dealer, and Admin.
- **System Scope:** What the platform will and will not do (e.g., excluding heavy commercial trucks).

### 2. Core User Modules (The "Must-Haves")

**Advanced Vehicle Inventory & Search:**
- Filters: Capacity to filter by make, model, year, price, mileage, body style, and fuel type.
- Visual Inspection: Requirements for 360-degree virtual tours and high-definition image galleries.
- Vehicle Comparison: Side-by-side spec comparison tool for up to 3 vehicles.

**Digital Financing & Transaction:**
- Loan Calculator: Real-time monthly payment estimates based on credit tiers.
- Trade-In Evaluation: Integrated tool to provide instant, data-driven offers for a user's current vehicle.
- Secure Checkout: One-step or multi-step flow including digital signature (e-sign) integration for contracts.

**User Account & Personalization:**
- Saved Searches & Wishlists: Ability to "heart" vehicles and receive price-drop notifications.
- Order Tracking: Real-time status updates from "Order Placed" to "Out for Delivery".

### 3. Data & Third-Party Integrations

- Vehicle History Reports: Automated pulling of data from sources like CARFAX or AutoCheck.
- Payment Gateways: Integration with processors like Stripe for deposits or Plaid for bank verification.
- Logistics & Scheduling: API connection to delivery partners to offer real-time delivery windows based on zip code.

### 4. Administrative & Operational Requirements

- Inventory Management (PIM/ERP): Backend tools to add, edit, or remove VINs and update reconditioning status.
- CRM Integration: Syncing user leads and purchase history with systems like Salesforce or HubSpot.

### 5. Non-Functional Requirements (Performance & Security)

- System Speed: Search results must load within 0.5 to 2 seconds to prevent user drop-off.
- Mobile Responsiveness: Full parity between desktop and mobile browser features.
- Security & Compliance: Encryption standards (SSL/TLS), PCI compliance for payments, and SOC2 for data privacy.

### 6. Acceptance Criteria

- Testing Scenarios: Specific "Pass/Fail" conditions for each feature (e.g., "The user cannot checkout if their credit application is denied").

---

## Core Database Schema Entities

A robust schema for this scale is typically normalized to at least the Third Normal Form (3NF) to ensure data integrity and minimize redundancy.

### 1. Vehicle Management (The Product Catalog)

- **Vehicles:** This is the primary table. Each record is a specific, individual car identified by its VIN (Vehicle Identification Number) as the primary key.
  - Attributes: Mileage, current price, color, reconditioning status, and location (showroom/hub).
- **Vehicle_Models & Brands:** To avoid repeating data, "Make" (e.g., Ford) and "Model" (e.g., F-150) should be in separate lookup tables linked via foreign keys.
- **Vehicle_Features:** A many-to-many relationship table that links specific options (e.g., Sunroof, Backup Camera) to individual VINs.
- **Vehicle_History:** Links to external reports from CARFAX or AutoCheck.

### 2. Customer & User Profiles

- **Users:** Stores core credentials like UserID, Email, and PasswordHash.
- **Customers:** A more detailed table linked to the User record.
  - Attributes: Full name, verified address, phone number, and driver's license details.
- **Wishlists:** A separate table that links a CustomerID to multiple VehicleIDs (VINs) for "saved" cars.

### 3. Transactions & Financing

- **Orders/Sales:** The bridge between a customer and a specific vehicle.
  - Attributes: Purchase date, total cost, and delivery/pickup method.
- **Financing_Applications:** Captures credit application data, linked to a specific Order and Customer. It stores status (Pending, Approved, Denied) and lender details.
- **Trade_Ins:** Stores information about a customer's current vehicle being sold back to the platform, linked to the main Sales record.

### Critical Technical Considerations

- **Concurrency:** Use database locking to ensure two users cannot "buy" the same unique VIN at the exact same time.
- **Indexing:** High-performance search requires heavy indexing on columns like make, model, price, and zip_code.
- **Scalability:** For a platform of this size, consider using cloud-native solutions like Databricks for data pipelines or AWS RDS for reliable database hosting.

---

## Security and Compliance Protocols

### 1. Payment Security (PCI DSS)

Since you are processing credit cards and large down payments, you must comply with PCI DSS (Payment Card Industry Data Security Standard).

- Compliance Level: Depending on your volume, you'll need a Self-Assessment Questionnaire (SAQ) or an external audit.
- Tokenization Strategy: Document how you will use services like Stripe or Braintree so that raw card data never touches your servers.
- Encryption at Rest & Transit: Requirement to use AES-256 for stored data and TLS 1.2+ for data moving between the user and the server.

### 2. Data Privacy (SOC 2 Type II)

SOC 2 (System and Organization Controls) is the gold standard for tech companies. It proves to partners (like banks and lenders) that you manage data securely.

- The Five Trust Principles: Your docs must cover Security, Availability, Processing Integrity, Confidentiality, and Privacy.
- Audit Trail: You must document how you log every action in the system—who accessed what data and when.

### 3. Identity & Access Management (IAM)

You need a strict policy on who can "touch" the car inventory or customer financial profiles.

- Multi-Factor Authentication (MFA): Mandatory for all administrative staff.
- Principle of Least Privilege: Documentation showing that a "Delivery Driver" role cannot see a customer's full "Social Security Number."
- KYC (Know Your Customer): Procedures for verifying identities to prevent "identity theft" during the car buying process (often using tools like Jumio or Onfido).

### 4. Legal Privacy Compliance

Depending on where your customers live, you must have approved:

- CCPA (California Consumer Privacy Act): If operating in the US, giving users the "Right to be Forgotten."
- GDPR: If you have any European users, ensuring strict data portability and consent.
- GLBA (Gramm-Leach-Bliley Act): Specific to the US, this governs how financial institutions (including auto lenders) protect "Non-Public Personal Information" (NPI).

### 5. Vulnerability & Recovery Plans

- Incident Response Plan: A "playbook" for what happens if the site is hacked.
- Penetration Testing Schedule: A commitment to have "ethical hackers" try to break into the site at least once a year.
- Disaster Recovery (DR): How quickly can the site be back online if a data center (like AWS or Azure) goes down?

### Summary Checklist for Approval

| Document | Purpose | Key Focus |
|---|---|---|
| Data Retention Policy | Legal | How long you keep customer data before deleting it. |
| Vulnerability Disclosure | Public | How researchers can report bugs to you safely. |
| Privacy Policy / TOS | User-Facing | Legal "fine print" that protects you from lawsuits. |
| API Security Schema | Technical | How you secure the "pipes" between you and the banks. |

---

## Automotive E-Commerce Risk Assessment Matrix

This matrix ranks risks by Likelihood (how often it might happen) and Impact (how much damage it would cause to the business or customers).

### Top Priority Risks (Red Zone)

**Account Takeover (ATO):**
- The Risk: Hackers use stolen credentials to access buyer accounts, potentially rerouting vehicle deliveries or changing bank info.
- Mitigation: Mandatory Multi-Factor Authentication (MFA) and Stripe Identity verification.

**Phishing & Social Engineering:**
- The Risk: Employees or customers are tricked into revealing passwords or clicking malicious links.
- Mitigation: Regular employee training and robust Cisco Secure Email filtering.

**API & Database Breach:**
- The Risk: Direct attack on the servers to steal millions of customer records, including Social Security Numbers (SSNs) and VINs.
- Mitigation: Implement Zero Trust architecture and use AWS Shield for DDoS and API protection.

### Secondary Strategic Risks

**Fraudulent Trade-ins:**
- The Risk: Sellers misrepresenting a car's condition or title status (e.g., title washing).
- Mitigation: Real-time integration with CARFAX and physical inspection protocols upon pickup.

**Vehicle Control Exploit (Safety):**
- The Risk: In extremely rare cases, exploiting a platform's connection to a vehicle to manipulate its systems remotely.
- Mitigation: Following NHTSA Cybersecurity Best Practices and isolating e-commerce servers from vehicle telematics.

---

## Pre-Launch Security & Compliance Checklist

| Category | Item | Verification Method |
|---|---|---|
| Data Protection | SSL/TLS 1.3 Encryption | Verify all traffic is forced to HTTPS via DigiCert or Let's Encrypt. |
| | Database Encryption | Confirm "Encryption at Rest" is enabled for all PII (Personally Identifiable Info). |
| Authentication | MFA for Admins | Ensure no one can access the backend without a second factor (Authy, Google Authenticator). |
| | Password Hashing | Verify passwords are saved using Argon2 or BCrypt (never plain text). |
| Financial | PCI Compliance Scan | Run a vulnerability scan through an Approved Scanning Vendor (ASV). |
| | Stripe/Payment Sandbox | Conduct 5+ test transactions to ensure no credit card data is stored on your local DB. |
| Infrastructure | WAF Deployment | Activate a Web Application Firewall like Cloudflare or AWS WAF. |
| | DDoS Protection | Confirm rate-limiting is active to prevent bot attacks from crashing the search engine. |
| Legal | Privacy Policy & ToS | Ensure links are visible in the footer and during the account creation flow. |
| | Cookie Consent | Implement a "Consent Manager" for users in strict jurisdictions (CCPA/GDPR). |
| Validation | Penetration Test | Review the final report from your "Ethical Hacking" firm and fix all "High" risks. |
| | API Key Audit | Ensure all API keys (Google Maps, Carfax, Plaid) are restricted to your specific domain. |

### The "Big Red Button" Test

Before going live, perform a "Chaos Test":

- **Simulate a Failed Payment:** Does the system gracefully tell the user without locking their account?
- **Simulate a Database Outage:** Does the site show a professional "Maintenance" page instead of raw code?
- **Simulate a Data Request:** Can you manually delete a user's data within 48 hours if they invoke their "Right to be Forgotten"?

**Pro-Tip:** Use a service like Vanta or Drata to automate your SOC 2 and PCI compliance monitoring so you don't have to check these manually every month.

---

## Post-Launch Maintenance Schedule

Building a high-end platform like Carvana means your "grand opening" is just the beginning. To maintain 99.9% uptime and handle thousands of simultaneous users, you must move from a "build" mindset to an "operate" mindset.

| Frequency | Task | Purpose |
|---|---|---|
| Daily | Uptime & Backup Monitoring | Verify the site is live and daily automated backups (database & files) were successful. |
| Daily | Order & Inquiry Audit | Ensure no "stuck" orders in the funnel and respond to high-priority customer support tickets. |
| Weekly | Inventory & Data Sync | Audit vehicle stock levels and sync with third-party logistics/pricing tools (e.g., KBB or Black Book). |
| Weekly | Broken Link & Error Scan | Use tools like Ahrefs or Screaming Frog to catch 404 errors before they hurt SEO. |
| Monthly | Security & Core Updates | Patch CMS, plugins, and third-party libraries (e.g., React or Next.js) to close vulnerabilities. |
| Monthly | Speed Benchmarking | Run Google PageSpeed Insights to ensure high-res car images aren't slowing down mobile users. |
| Monthly | Full Checkout Test | Manually walk through the entire buying flow on iOS, Android, and desktop to ensure no new bugs appeared. |
| Quarterly | Security & SEO Audits | Perform a deep-dive security audit and review keyword rankings to adjust your content strategy. |
| Quarterly | Scalability Assessment | Analyze server resource usage (CPU/RAM) via Datadog or New Relic to decide if you need to upgrade hosting. |
| Annually | Legal & Policy Review | Update Privacy Policies, Terms of Service, and renew your SSL certificates and domain name. |

### Critical Success Factors for 24/7 Operations

- **Managed Hosting:** For a complex site, don't use basic shared hosting. Invest in Managed Cloud Hosting (like AWS or Google Cloud) that offers auto-scaling for traffic spikes.
- **Database Optimization:** Regularly "defragment" and clean up your database (archiving old car listings) to keep search queries fast.
- **CDN Implementation:** Use a Content Delivery Network like Cloudflare to serve heavy vehicle images and 360-tours from servers closest to the user.
- **A/B Testing:** Continuously test variations of your "Apply for Financing" buttons or car filters using tools like Optimizely to improve conversion rates.

---

## Estimated Monthly Costs

### 1. Enterprise Infrastructure & Hosting

Standard web hosting isn't enough; you need high-availability cloud infrastructure with auto-scaling to handle vehicle 360-tours and high traffic.

- Managed Cloud (AWS/Azure/GCP): Expect to pay $1,000 to $5,000+ monthly for production environments with clustering, multiple micro-services, and auto-scaling.
- Variable Usage Fees: High-traffic sites can see bandwidth (egress) fees cost between $60–$90 per TB.
- CDN & Image Storage: Delivering HD car images globally via a Cloudflare or AWS CloudFront adds $200–$800 monthly.

### 2. Security & Compliance (Non-Negotiable)

Maintaining trust is your most expensive recurring "invisible" cost.

- SOC 2 Maintenance: Ongoing monitoring, internal audits, and preparation for annual recertification cost $10,000 to $40,000 per year (approx. $800–$3,300/mo).
- PCI DSS Level 1 Compliance: For high-volume merchants, enterprise programs can cost $70,000 to $200,000+ per year (approx. $5,800–$16,600/mo).
- Managed Security Services (MSP): Outsourced 24/7 security monitoring often starts at $1,500/mo.

### 3. Third-Party API "Fuel" Costs

Your site is a hub connecting multiple data services, most of which charge per request or via monthly retainers.

- Banking & Credit (Plaid/Stripe):
  - Plaid (Bank verification): Minimum business plans often start at $500–$1,000/mo.
  - Stripe (Payments): While there is no monthly fee, processing 2.9% + $0.30 on a $30,000 car sale is $870 in fees per transaction.
- Vehicle Data (Carfax/VinAudit): Expect custom enterprise pricing for bulk VIN lookups, often running $2,000–$5,000/mo depending on inventory turnover.

### 4. Technical Payroll & Support

A site of this complexity requires a dedicated "pit crew."

- Core Engineering/DevOps: A baseline monthly commitment for three key technical roles (DevOps, Senior Full-Stack, and Security) starts at roughly $28,750/mo.
- Maintenance Retainers: If using an agency, enterprise-level SLAs for 24/7 monitoring and performance tuning range from $2,000 to $6,000+ monthly.

### Summary Monthly Burn Estimate (2026)

| Expense Category | Low Estimate (Scaling) | High Estimate (Established) |
|---|---|---|
| Hosting & Cloud Ops | $1,000 | $5,000+ |
| Security & Compliance | $2,500 | $15,000+ |
| Technical Payroll | $28,750 | $57,500+ |
| SaaS & API Tools | $3,300 | $10,000+ |
| **TOTAL** | **~$35,550/mo** | **~$87,500+/mo** |

**Note:** This does not include acquisition marketing (ads), which typically requires an additional $25,000–$30,000/mo to drive sufficient car-buying traffic.
