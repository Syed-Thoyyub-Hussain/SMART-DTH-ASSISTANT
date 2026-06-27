# Security Specification - Raja Communications DTH Gateway

This document outlines the security architecture, data invariants, test payloads, and verification patterns for the Google Cloud Firestore security rule enforcement.

## 1. Data Invariants
1. **User Ownership**: Standard customers must only access their own user document, service requests, and clearance ledgers.
2. **Admin Supremacy**: The administrator `raja.sundirect@gmail.com` has absolute read and write authorization across all records.
3. **Immutability**: Crucial structural values (e.g., `userId`, `customerId`, `role`) must remain immutable during updates by standard users.
4. **Local Preview Continuity**: Unauthenticated sessions utilizing simulated `local-user-` prefixes are granted access specifically to those records to ensure frictionless local sandboxing while real auth is disabled.

## 2. The "Dirty Dozen" Malicious Payloads
The following payloads are explicitly designed to breach database constraints but will be rejected with `PERMISSION_DENIED` by the hardened security rules:

1. **Self-Promoting Admin**: A user attempts to create/update their user profile setting `role` to `admin`.
2. **PII Extraction (Scraping)**: An authenticated customer queries other users' profile documents.
3. **Orphaned Service Ticket**: A user tries to create a service request with a mismatching `userId`.
4. **Balance Manipulation**: A customer attempts to alter their `outstandingBalance` in their clearance document.
5. **SmartCard Hijacking**: A customer tries to claim someone else's smartcard ID.
6. **Fake UTR Submission**: Standard customer attempts to mark their clearance document as "Cleared" directly without submitting a pending verification UTR.
7. **Email Logs Intrusion**: A customer attempts to list all records from the `sent_emails` collection.
8. **Malicious ID Injection**: A client attempts to write a document with a massive 1MB string or invalid characters as the document ID.
9. **Timestamp Spoofing**: A user submits a client-side timestamp instead of a synchronized server timestamp.
10. **State Skipping**: A user attempts to update a closed/completed service request ticket.
11. **Cross-Tenant Intrusion**: Customer A attempts to fetch or edit a clearance ledger belonging to Customer B.
12. **Anonymous Admin Impersonation**: An anonymous or unverified session attempts to access administrative endpoints.

## 3. Firestore Rules Structure
The production-grade security rules are deployed at `firestore.rules` and enforce these barriers mathematically.
