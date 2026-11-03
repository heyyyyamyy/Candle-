# Security Specification: Lumina & Oak Corporate Gifting Platform

## 1. Data Invariants
1. **User Identity & Roles**: A user cannot escalate their role to `admin` arbitrarily. Initial profile creation assigns standard role unless confirmed by existing admin.
2. **Order Integrity**: An order's `total` must be mathematically positive. An order can only be created with `userId` matching `request.auth.uid` (or admin).
3. **Audit Immutability**: Audit logs cannot be updated or deleted once written; writes require authenticated users or admins.
4. **Product CMS Protection**: Products can be viewed by anyone (public catalog), but can only be created, updated, or deleted by authenticated `admin` users.
5. **PII and Order Privacy**: Users can only read their own orders; admins can read all orders for corporate fulfillment.

## 2. The "Dirty Dozen" Threat Payloads
1. **Spoofed Admin Escalation**: Attacker creates user profile with `"role": "admin"` directly. (Target: `/users/{userId}`) -> DENIED.
2. **Order Price Tampering**: Attacker sets total to negative or zero while submitting bulk items. (Target: `/orders/{orderId}`) -> DENIED.
3. **Ghost Field Injection**: Attacker injects extra field `"bypassStripe": true` or `"isSuperuser": true` into order documents. -> DENIED.
4. **Order Hijacking**: Non-admin user A attempts to read or update user B's corporate order. -> DENIED.
5. **Product Price Deflation**: Non-admin attempts to update product `basePrice` to `$0.01`. -> DENIED.
6. **Audit Log Erasure**: Attacker tries to `delete()` a security log documenting unauthorized access. -> DENIED.
7. **Document ID Buffer Overflow**: Attacker submits a 10KB junk-character string as document ID. -> DENIED.
8. **Email Spoofing without Verification**: Attacker presents unverified email claiming admin domain. -> DENIED.
9. **Terminal State Rollback**: Attacker attempts to update an order with status `"delivered"` back to `"received"`. -> DENIED.
10. **Cross-Tenant Notification Peeking**: User attempts to query all notifications belonging to other companies. -> DENIED.
11. **Orphaned Subcollection Writes**: Attempting to create order lines without parent order existence. -> DENIED.
12. **Mass Catalog Exfiltration**: Unauthenticated bot attempting unconstrained bulk export queries. -> DENIED.
