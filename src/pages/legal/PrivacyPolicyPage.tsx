import React from "react";

import { Typography } from "../../components/design-system/Typography";

export const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = "August 4, 2025";

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose dark:prose-invert max-w-none">
        <Typography
          variant="headline-lg"
          as="h1"
          className="mb-2 text-text-primary"
        >
          Privacy Policy
        </Typography>
        <p className="text-sm mb-8 text-text-secondary">
          Last updated: {lastUpdated}
        </p>

        <section className="mb-8">
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-4 text-text-primary"
          >
            Introduction
          </Typography>
          <p className="text-text-primary dark:text-gray-300 mb-4">
            BoxCall ("we," "our," or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our football coaching
            management platform and related services.
          </p>
          <p className="text-text-primary dark:text-gray-300">
            By using BoxCall, you consent to the data practices described in
            this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-4 text-text-primary"
          >
            Information We Collect
          </Typography>

          <Typography
            variant="headline-sm"
            as="h3"
            className="mb-3 text-text-primary"
          >
            Personal Information
          </Typography>
          <ul className="list-disc pl-6 text-text-primary dark:text-gray-300 mb-4">
            <li>Account information (name, email address, phone number)</li>
            <li>Team and coaching information</li>
            <li>Player roster data (names, positions, contact information)</li>
            <li>Payment and billing information</li>
            <li>Profile photos and team logos</li>
          </ul>

          <Typography
            variant="headline-sm"
            as="h3"
            className="mb-3 text-text-primary"
          >
            Usage Information
          </Typography>
          <ul className="list-disc pl-6 text-text-primary dark:text-gray-300 mb-4">
            <li>How you use our platform and services</li>
            <li>
              Device information (IP address, browser type, operating system)
            </li>
            <li>Log data and analytics</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <Typography
            variant="headline-sm"
            as="h3"
            className="mb-3 text-text-primary"
          >
            Team and Playbook Data
          </Typography>
          <ul className="list-disc pl-6 text-text-primary dark:text-gray-300">
            <li>Playbook content and formations</li>
            <li>Practice plans and drill information</li>
            <li>Team statistics and performance data</li>
            <li>Communication within the platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-4 text-text-primary"
          >
            How We Use Your Information
          </Typography>
          <ul className="list-disc pl-6 text-text-primary dark:text-gray-300">
            <li>Provide and maintain our coaching platform services</li>
            <li>Process payments and manage subscriptions</li>
            <li>Communicate with you about your account and our services</li>
            <li>Improve our platform functionality and user experience</li>
            <li>Ensure platform security and prevent fraud</li>
            <li>Comply with legal obligations</li>
            <li>Send updates about new features and platform improvements</li>
          </ul>
        </section>

        <section className="mb-8">
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-4 text-text-primary"
          >
            Information Sharing and Disclosure
          </Typography>
          <p className="text-text-primary dark:text-gray-300 mb-4">
            We do not sell, trade, or otherwise transfer your personal
            information to third parties, except in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-text-primary dark:text-gray-300">
            <li>
              <strong>With your consent:</strong> When you explicitly authorize
              us to share information
            </li>
            <li>
              <strong>Service providers:</strong> Third-party vendors who assist
              in operating our platform
            </li>
            <li>
              <strong>Legal requirements:</strong> When required by law or legal
              process
            </li>
            <li>
              <strong>Safety and security:</strong> To protect rights, property,
              or safety
            </li>
            <li>
              <strong>Business transfers:</strong> In connection with mergers or
              acquisitions
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-4 text-text-primary"
          >
            Data Security
          </Typography>
          <p className="text-text-primary dark:text-gray-300 mb-4">
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction.
          </p>
          <ul className="list-disc pl-6 text-text-primary dark:text-gray-300">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Secure data centers and infrastructure</li>
          </ul>
        </section>

        <section className="mb-8">
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-4 text-text-primary"
          >
            Your Rights and Choices
          </Typography>
          <p className="text-text-primary dark:text-gray-300 mb-4">
            You have the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 text-text-primary dark:text-gray-300">
            <li>
              <strong>Access:</strong> Request a copy of your personal
              information
            </li>
            <li>
              <strong>Correction:</strong> Update or correct inaccurate
              information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal
              information
            </li>
            <li>
              <strong>Data portability:</strong> Receive your data in a portable
              format
            </li>
            <li>
              <strong>Opt-out:</strong> Unsubscribe from marketing
              communications
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-4 text-text-primary"
          >
            Children's Privacy
          </Typography>
          <p className="text-text-primary dark:text-gray-300">
            BoxCall is designed for use by coaches and team administrators. We
            do not knowingly collect personal information from children under
            13. If you believe we have collected information from a child under
            13, please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-4 text-text-primary"
          >
            Changes to This Privacy Policy
          </Typography>
          <p className="text-text-primary dark:text-gray-300">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date. Your continued use of BoxCall
            after any changes constitutes acceptance of the new Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-4 text-text-primary"
          >
            Contact Us
          </Typography>
          <p className="text-text-primary dark:text-gray-300 mb-4">
            If you have any questions about this Privacy Policy or our data
            practices, please contact us:
          </p>
          <div className="surface-subtle dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-text-primary dark:text-gray-300">
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
      </div>
    </div>
  );
};
