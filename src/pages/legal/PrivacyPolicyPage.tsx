import React from "react";
import { Typography } from "../../components/design-system/Typography";
import { PageLayout } from "../../components/layout/PageLayout";

const IntroSection: React.FC = () => (
  <section className="mb-8">
    <Typography variant="headline-sm" as="h2" className="mb-4 text-primary">
      Introduction
    </Typography>
    <p className="text-primary dark:text-secondary mb-4">
      BoxCall ("we," "our," or "us") is committed to protecting your privacy.
      This Privacy Policy explains how we collect, use, disclose, and safeguard
      your information when you use our football coaching management platform
      and related services.
    </p>
    <p className="text-primary dark:text-secondary">
      By using BoxCall, you consent to the data practices described in this
      Privacy Policy.
    </p>
  </section>
);

const InformationCollectionSection: React.FC = () => (
  <section className="mb-8">
    <Typography variant="headline-sm" as="h2" className="mb-4 text-primary">
      Information We Collect
    </Typography>

    <Typography variant="headline-sm" as="h3" className="mb-3 text-primary">
      Personal Information
    </Typography>
    <ul className="list-disc pl-6 text-primary dark:text-secondary mb-4">
      <li>Account information (name, email address, phone number)</li>
      <li>Team and coaching information</li>
      <li>Player roster data (names, positions, contact information)</li>
      <li>Payment and billing information</li>
      <li>Profile photos and team logos</li>
    </ul>

    <Typography variant="headline-sm" as="h3" className="mb-3 text-primary">
      Usage Information
    </Typography>
    <ul className="list-disc pl-6 text-primary dark:text-secondary mb-4">
      <li>How you use our platform and services</li>
      <li>Device information (IP address, browser type, operating system)</li>
      <li>Log data and analytics</li>
      <li>Cookies and similar tracking technologies</li>
    </ul>

    <Typography variant="headline-sm" as="h3" className="mb-3 text-primary">
      Team and Playbook Data
    </Typography>
    <ul className="list-disc pl-6 text-primary dark:text-secondary">
      <li>Playbook content and formations</li>
      <li>Practice plans and drill information</li>
      <li>Team statistics and performance data</li>
      <li>Communication within the platform</li>
    </ul>
  </section>
);

const DataUsageSection: React.FC = () => (
  <section className="mb-8">
    <Typography variant="headline-sm" as="h2" className="mb-4 text-primary">
      How We Use Your Information
    </Typography>
    <ul className="list-disc pl-6 text-primary dark:text-secondary">
      <li>Provide and maintain our coaching platform services</li>
      <li>Process payments and manage subscriptions</li>
      <li>Communicate with you about your account and our services</li>
      <li>Improve our platform functionality and user experience</li>
      <li>Ensure platform security and prevent fraud</li>
      <li>Comply with legal obligations</li>
      <li>Send updates about new features and platform improvements</li>
    </ul>
  </section>
);

const DataSharingSection: React.FC = () => (
  <section className="mb-8">
    <Typography variant="headline-sm" as="h2" className="mb-4 text-primary">
      Information Sharing and Disclosure
    </Typography>
    <p className="text-primary dark:text-secondary mb-4">
      We do not sell, trade, or otherwise transfer your personal information to
      third parties, except in the following circumstances:
    </p>
    <ul className="list-disc pl-6 text-primary dark:text-secondary">
      <li>
        <strong>With your consent:</strong> When you explicitly authorize us to
        share information
      </li>
      <li>
        <strong>Service providers:</strong> Third-party vendors who assist in
        operating our platform
      </li>
      <li>
        <strong>Legal requirements:</strong> When required by law or legal
        process
      </li>
      <li>
        <strong>Safety and security:</strong> To protect rights, property, or
        safety
      </li>
      <li>
        <strong>Business transfers:</strong> In connection with mergers or
        acquisitions
      </li>
    </ul>
  </section>
);

const SecuritySection: React.FC = () => (
  <section className="mb-8">
    <Typography variant="headline-sm" as="h2" className="mb-4 text-primary">
      Data Security
    </Typography>
    <p className="text-primary dark:text-secondary mb-4">
      We implement appropriate technical and organizational security measures to
      protect your personal information against unauthorized access, alteration,
      disclosure, or destruction.
    </p>
    <ul className="list-disc pl-6 text-primary dark:text-secondary">
      <li>Encryption of data in transit and at rest</li>
      <li>Regular security audits and updates</li>
      <li>Access controls and authentication measures</li>
      <li>Secure data centers and infrastructure</li>
    </ul>
  </section>
);

const UserRightsSection: React.FC = () => (
  <section className="mb-8">
    <Typography variant="headline-sm" as="h2" className="mb-4 text-primary">
      Your Rights and Choices
    </Typography>
    <p className="text-primary dark:text-secondary mb-4">
      You have the following rights regarding your personal information:
    </p>
    <ul className="list-disc pl-6 text-primary dark:text-secondary">
      <li>
        <strong>Access:</strong> Request a copy of your personal information
      </li>
      <li>
        <strong>Correction:</strong> Update or correct inaccurate information
      </li>
      <li>
        <strong>Deletion:</strong> Request deletion of your personal information
      </li>
      <li>
        <strong>Data portability:</strong> Receive your data in a portable
        format
      </li>
      <li>
        <strong>Opt-out:</strong> Unsubscribe from marketing communications
      </li>
    </ul>
  </section>
);

const ChildrensPrivacySection: React.FC = () => (
  <section className="mb-8">
    <Typography variant="headline-sm" as="h2" className="mb-4 text-primary">
      Children's Privacy
    </Typography>
    <p className="text-primary dark:text-secondary">
      BoxCall is designed for use by coaches and team administrators. We do not
      knowingly collect personal information from children under 13. If you
      believe we have collected information from a child under 13, please
      contact us immediately.
    </p>
  </section>
);

const ChangesSection: React.FC = () => (
  <section className="mb-8">
    <Typography variant="headline-sm" as="h2" className="mb-4 text-primary">
      Changes to This Privacy Policy
    </Typography>
    <p className="text-primary dark:text-secondary">
      We may update this Privacy Policy from time to time. We will notify you of
      any changes by posting the new Privacy Policy on this page and updating
      the "Last updated" date. Your continued use of BoxCall after any changes
      constitutes acceptance of the new Privacy Policy.
    </p>
  </section>
);

const ContactSection: React.FC = () => (
  <section className="mb-8">
    <Typography variant="headline-sm" as="h2" className="mb-4 text-primary">
      Contact Us
    </Typography>
    <p className="text-primary dark:text-secondary mb-4">
      If you have any questions about this Privacy Policy or our data practices,
      please contact us:
    </p>
    <div className="bg-subtle dark:bg-secondary p-4 rounded-lg">
      <p className="text-primary dark:text-secondary">
        <strong>BoxCall Privacy Team</strong>
        <br />
        Email: privacy@boxcall.com
        <br />
        Address: [Company Address]
        <br />
        Phone: [Phone Number]
      </p>
    </div>
  </section>
);

export const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = "August 4, 2025";

  return (
    <PageLayout title="Privacy Policy" variant="detail">
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm mb-8 text-secondary">
          Last updated: {lastUpdated}
        </p>

        <IntroSection />
        <InformationCollectionSection />
        <DataUsageSection />
        <DataSharingSection />
        <SecuritySection />
        <UserRightsSection />
        <ChildrensPrivacySection />
        <ChangesSection />
        <ContactSection />
      </div>
    </PageLayout>
  );
};
