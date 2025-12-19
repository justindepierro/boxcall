import React from "react";

import { Typography } from "../../components/design-system/Typography";
import { PageLayout } from "../../components/layout/PageLayout";

type TermsSectionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

const LAST_UPDATED = "August 4, 2025";

const TermsSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="mb-8">
    <Typography variant="headline-sm" as="h2" className="mb-4 text-primary">
      {title}
    </Typography>
    {children}
  </section>
);

const termsSections: TermsSectionItem[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <>
        <p className="text-primary dark:text-border-light mb-4">
          By accessing and using BoxCall ("the Service"), you accept and agree
          to be bound by the terms and provision of this agreement. If you do
          not agree to abide by the above, please do not use this service.
        </p>
        <p className="text-primary dark:text-border-light">
          These Terms of Service ("Terms") govern your use of the BoxCall
          football coaching management platform operated by BoxCall, Inc.
          ("Company," "we," "us," or "our").
        </p>
      </>
    ),
  },
  {
    id: "description",
    title: "2. Description of Service",
    content: (
      <>
        <p className="text-primary dark:text-border-light mb-4">
          BoxCall is a comprehensive football coaching management platform that
          provides:
        </p>
        <ul className="list-disc pl-6 text-primary dark:text-border-light">
          <li>Digital playbook creation and management tools</li>
          <li>Practice planning and drill organization</li>
          <li>Team roster and player management</li>
          <li>Communication and coordination features</li>
          <li>Analytics and performance tracking</li>
          <li>File storage and sharing capabilities</li>
        </ul>
      </>
    ),
  },
  {
    id: "accounts",
    title: "3. User Accounts and Registration",
    content: (
      <>
        <p className="text-primary dark:text-border-light mb-4">
          To access certain features of the Service, you must register for an
          account. You agree to:
        </p>
        <ul className="list-disc pl-6 text-primary dark:text-border-light mb-4">
          <li>
            Provide accurate, current, and complete information during
            registration
          </li>
          <li>Maintain and promptly update your account information</li>
          <li>Maintain the security and confidentiality of your password</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Notify us immediately of unauthorized use of your account</li>
        </ul>
        <p className="text-primary dark:text-border-light">
          You must be at least 18 years old to create an account and use our
          services.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "4. Acceptable Use Policy",
    content: (
      <>
        <p className="text-primary dark:text-border-light mb-4">
          You agree not to use the Service to:
        </p>
        <ul className="list-disc pl-6 text-primary dark:text-border-light mb-4">
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon intellectual property rights</li>
          <li>Upload malicious code, viruses, or harmful content</li>
          <li>Harass, abuse, or harm other users</li>
          <li>Share inappropriate or offensive content</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use the service for commercial purposes outside of coaching</li>
          <li>Reverse engineer or attempt to extract source code</li>
        </ul>
      </>
    ),
  },
  {
    id: "subscription",
    title: "5. Subscription and Payment Terms",
    content: (
      <>
        <Typography variant="headline-sm" as="h3" className="mb-3 text-primary">
          Team Subscriptions ($199/year)
        </Typography>
        <ul className="list-disc pl-6 text-primary dark:text-border-light mb-4">
          <li>Annual subscription fee for full team management features</li>
          <li>
            Includes unlimited playbooks, roster management, and analytics
          </li>
          <li>Automatic renewal unless cancelled before renewal date</li>
        </ul>

        <Typography variant="headline-sm" as="h3" className="mb-3 text-primary">
          Coach Accounts ($9.99/month)
        </Typography>
        <ul className="list-disc pl-6 text-primary dark:text-border-light mb-4">
          <li>Individual coach access to personal playbooks and tools</li>
          <li>Monthly subscription with automatic renewal</li>
          <li>Limited team management features</li>
        </ul>

        <p className="text-primary dark:text-border-light">
          All fees are non-refundable except as required by law. We reserve the
          right to change pricing with 30 days' notice.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    title: "6. Intellectual Property Rights",
    content: (
      <>
        <p className="text-primary dark:text-border-light mb-4">
          The Service and its original content, features, and functionality are
          owned by BoxCall and are protected by international copyright,
          trademark, patent, trade secret, and other intellectual property laws.
        </p>
        <p className="text-primary dark:text-border-light mb-4">
          You retain ownership of the content you create and upload to the
          Service (playbooks, practice plans, etc.), but grant us a license to
          use, store, and process this content to provide our services.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "7. Privacy and Data Protection",
    content: (
      <p className="text-primary dark:text-border-light">
        Your privacy is important to us. Please review our Privacy Policy, which
        also governs your use of the Service, to understand our practices
        regarding the collection and use of your information.
      </p>
    ),
  },
  {
    id: "termination",
    title: "8. Termination",
    content: (
      <>
        <p className="text-primary dark:text-border-light mb-4">
          We may terminate or suspend your account and access to the Service
          immediately, without prior notice, for conduct that we believe
          violates these Terms or is harmful to other users, us, or third
          parties.
        </p>
        <p className="text-primary dark:text-border-light">
          You may terminate your account at any time by contacting us. Upon
          termination, your right to use the Service will cease immediately.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "9. Disclaimers and Limitation of Liability",
    content: (
      <>
        <p className="text-primary dark:text-border-light mb-4">
          The Service is provided "as is" and "as available" without warranties
          of any kind. We disclaim all warranties, express or implied, including
          but not limited to implied warranties of merchantability and fitness
          for a particular purpose.
        </p>
        <p className="text-primary dark:text-border-light">
          In no event shall BoxCall be liable for any indirect, incidental,
          special, consequential, or punitive damages, including without
          limitation, loss of profits, data, use, goodwill, or other intangible
          losses.
        </p>
      </>
    ),
  },
  {
    id: "indemnification",
    title: "10. Indemnification",
    content: (
      <p className="text-primary dark:text-border-light">
        You agree to defend, indemnify, and hold harmless BoxCall and its
        officers, directors, employees, and agents from and against any claims,
        damages, obligations, losses, liabilities, costs, or debt arising from
        your use of the Service or violation of these Terms.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "11. Governing Law",
    content: (
      <p className="text-primary dark:text-border-light">
        These Terms shall be interpreted and governed by the laws of
        [State/Country], without regard to conflict of law provisions. Any
        disputes shall be resolved in the courts of [Jurisdiction].
      </p>
    ),
  },
  {
    id: "changes",
    title: "12. Changes to Terms",
    content: (
      <p className="text-primary dark:text-border-light">
        We reserve the right to modify these Terms at any time. We will notify
        users of any material changes via email or platform notification. Your
        continued use of the Service after changes constitutes acceptance of the
        new Terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "13. Contact Information",
    content: (
      <>
        <p className="text-primary dark:text-border-light mb-4">
          If you have any questions about these Terms of Service, please contact
          us:
        </p>
        <div className="bg-subtle dark:bg-secondary p-4 rounded-lg">
          <p className="text-primary dark:text-border-light">
            <strong>BoxCall Legal Team</strong>
            <br />
            Email: legal@boxcall.com
            <br />
            Address: [Company Address]
            <br />
            Phone: [Phone Number]
          </p>
        </div>
      </>
    ),
  },
];

export const TermsOfServicePage: React.FC = () => {
  return (
    <PageLayout title="Terms of Service" variant="detail">
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm mb-8 text-secondary">
          Last updated: {LAST_UPDATED}
        </p>

        {termsSections.map((section) => (
          <TermsSection key={section.id} title={section.title}>
            {section.content}
          </TermsSection>
        ))}
      </div>
    </PageLayout>
  );
};
