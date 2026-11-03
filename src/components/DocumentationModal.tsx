import React from 'react';
import { X, FileText, Database, Shield, Zap, Server, Code, CheckCircle2 } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-stone-100 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                Lumina &amp; Oak — Full-Stack Architecture &amp; System Docs
              </h3>
              <p className="text-[11px] text-stone-400">
                A-to-Z Technical Blueprint: Firebase Backend, Stripe API, Three.js 3D Studio &amp; Vercel CI/CD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 text-xs leading-relaxed text-stone-300">
          {/* Section 1: Architecture Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
              <Server className="w-4 h-4" />
              1. System Architecture &amp; Data Pipeline
            </div>
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 font-mono text-[11px] text-stone-300 space-y-1">
              <div>[Client: React 19 + Tailwind CSS + Three.js PBR WebGL Canvas]</div>
              <div className="text-amber-500">  │  ├── HTTPS / WSS WebGL Render Pipeline (RoomEnvironment)</div>
              <div className="text-amber-500">  │  ├── Dynamic CanvasTexture Procedural Laser Engraving</div>
              <div className="text-emerald-500">  ▼</div>
              <div>[API &amp; Security Layer: Express Server + Firebase SDK Client / Server]</div>
              <div className="text-emerald-500">  │  ├── RBAC: Admin vs Corporate Client vs Employee Recipient</div>
              <div className="text-emerald-500">  │  ├── Immutable Audit Logs Engine (/auditLogs)</div>
              <div className="text-blue-500">  ▼</div>
              <div>[Cloud Storage &amp; Database: Firebase Firestore Enterprise]</div>
              <div className="text-blue-500">  │  ├── Collection paths: /users, /products, /orders, /auditLogs, /notifications</div>
              <div className="text-purple-500">  ▼</div>
              <div>[External Integrations: Stripe PaymentIntents + FedEx/DHL Tracking Telemetry]</div>
            </div>
          </div>

          {/* Section 2: Three.js Craft & Procedural Modeling */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
              <Zap className="w-4 h-4" />
              2. Three.js 3D Studio &amp; Procedural Shader Craft
            </div>
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <p>
                As required by the Three.js technical guidelines, 3D models avoid single default primitives. Subjects are composed of 3–12 distinct procedural elements:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-400">
                <li>
                  <strong>Luxury Candle (8 parts):</strong> Heavy base glass jar, solid base disc, brushed metallic collar rim (gold/brass), poured soy wax core, braided cotton wick, animated flickering flame, dynamic corporate logo label (CanvasTexture), turned wooden lid with laser engraved emblem.
                </li>
                <li>
                  <strong>Gift Hamper Crate (9 parts):</strong> Solid pine wooden box, shredded crinkle paper nest, nested mini candle, apothecary amber match bottle, cork stopper, gold confection tin, foil-stamped corporate greeting card, sliding engraved lid with brass clasps.
                </li>
                <li>
                  <strong>Lighting &amp; Reflections:</strong> ACESFilmicToneMapping, PMREMGenerator with RoomEnvironment, 3-point studio lighting rig (Directional Key + Hemisphere Fill + Rim Light), and soft contact shadow disc.
                </li>
                <li>
                  <strong>Software WebGL Resilience:</strong> Automatic detection of SwiftShader/llvmpipe with frame pacing via <code>afterDraw</code> sync fences to maintain 60fps without starving headless browsers.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: Firebase Security & ABAC */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
              <Shield className="w-4 h-4" />
              3. Firebase Database, Rules &amp; Zero-Trust Access
            </div>
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <p>
                Deployed rules enforce Attribute-Based Access Control (ABAC):
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-400">
                <li>
                  <strong>Default Deny:</strong> Root wildcard catch-all blocks unauthorized reads/writes.
                </li>
                <li>
                  <strong>Public Catalog:</strong> <code>/products/{`{productId}`}</code> has public read access so corporate clients can browse offerings, but mutations require verified admin authentication.
                </li>
                <li>
                  <strong>Corporate Order Protection:</strong> Clients can only inspect and list orders matching their own <code>userId</code>. Admin accounts can inspect all corporate fulfillment batches.
                </li>
                <li>
                  <strong>Immutable Audit Logs:</strong> Security audit logs in <code>/auditLogs</code> are append-only; update and delete operations are strictly forbidden.
                </li>
                <li>
                  <strong>Error Handling Context:</strong> Errors are intercepted with structured JSON payloads containing operation type, path, and auth claims for rapid diagnostic auditing.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4: Stripe & Corporate Procurement */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
              <Database className="w-4 h-4" />
              4. Stripe Payment Processing &amp; Tax Exemption
            </div>
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <p>
                The platform integrates enterprise checkout handling:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-400">
                <li>
                  <strong>Tiered Volume Discounts:</strong> 10-49 units (10%), 50-199 units (18%), 200-499 units (25% + free branding), 500+ units (35% + free branding).
                </li>
                <li>
                  <strong>Corporate PO &amp; Tax IDs:</strong> Supports client Purchase Order references and corporate 501(c)(3) / wholesale resale exemption certificates.
                </li>
                <li>
                  <strong>Instant Invoicing:</strong> Auto-generates formal downloadable tax receipts with line-item customization specs and tracking codes.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 5: High-Concurrency & Vercel Deployment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
              <Code className="w-4 h-4" />
              5. High-Concurrency &amp; Vercel Deployment Optimization
            </div>
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <p>
                Optimized for high-traffic seasonal gifting spikes (Q4 Holidays &amp; Annual Summits):
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-400">
                <li>
                  <strong>Vercel Edge CDN:</strong> Static assets, compiled chunks, and procedural canvas scripts cached at Edge locations with <code>stale-while-revalidate</code> headers.
                </li>
                <li>
                  <strong>Firestore Indexing &amp; Query Bounds:</strong> Queries indexed on <code>userId</code> and <code>createdAt</code> with explicit page limits to minimize document read costs.
                </li>
                <li>
                  <strong>Automated Testing:</strong> Decoupled pure logic tested via Node.js native test runner (<code>npx --yes tsx --test src/utils/pricing.test.ts</code>).
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950 flex justify-between items-center text-xs">
          <span className="text-stone-400">Version 2.4.0 • Enterprise Cloud Run / Vercel Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
