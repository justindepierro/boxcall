import React from "react";

import { Typography } from "../../components/design-system/Typography";
import { Button } from "../../components/ui";
import { Icon } from "../../components/ui/Icon/Icon";
import { PageLayout } from "../../components/layout/PageLayout";

export const ContactPage: React.FC = () => {
  return (
    <PageLayout
      title="Contact Us"
      subtitle="Have questions about BoxCall? We're here to help coaches succeed."
      variant="detail"
    >
      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-6 text-primary"
          >
            Get in Touch
          </Typography>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-accent dark:bg-accent-dark rounded-lg flex items-center justify-center">
                  <Icon name="mail" size="sm" color="primary" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-primary">Email Support</h3>
                <p className="text-sm mt-1 text-secondary">
                  Get help with your account, billing, or technical issues
                </p>
                <a
                  href="mailto:support@boxcall.com"
                  className="text-interaction-jade hover:text-brand-jade-dark font-medium"
                >
                  support@boxcall.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-accent dark:bg-accent-dark rounded-lg flex items-center justify-center">
                  <Icon name="phone" size="sm" color="primary" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-primary">Phone Support</h3>
                <p className="text-sm mt-1 text-secondary">
                  Speak directly with our coaching support team
                </p>
                <p className="text-interaction-jade font-medium">
                  1-800-BOXCALL
                </p>
                <p className="text-muted text-sm">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-accent dark:bg-accent-dark rounded-lg flex items-center justify-center">
                  <Icon name="info" size="sm" color="primary" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-primary">
                  Business Address
                </h3>
                <p className="text-sm mt-1 text-secondary">
                  BoxCall, Inc.
                  <br />
                  123 Football Drive
                  <br />
                  Coaching City, ST 12345
                  <br />
                  United States
                </p>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="mt-8 p-4 bg-subtle dark:bg-muted rounded-lg">
            <h3 className="font-medium mb-3 text-primary">
              Support Hours
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Monday - Friday</span>
                <span className="text-primary">9:00 AM - 6:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Saturday</span>
                <span className="text-primary">
                  10:00 AM - 2:00 PM EST
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Sunday</span>
                <span className="text-primary">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <Typography
            variant="headline-sm"
            as="h2"
            className="mb-6 text-primary"
          >
            Send us a Message
          </Typography>

          <form className="space-y-6">
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-primary dark:text-border-light mb-2"
              >
                Name
              </Typography>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-secondary dark:border-text-tertiary rounded-lg shadow-sm focus:outline-none focus:ring-brand-jade focus:border-brand-jade dark:bg-muted dark:text-inverse"
                placeholder="Your full name"
              />
            </div>

            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-primary dark:text-border-light mb-2"
              >
                Email
              </Typography>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-secondary dark:border-text-tertiary rounded-lg shadow-sm focus:outline-none focus:ring-brand-jade focus:border-brand-jade dark:bg-muted dark:text-inverse"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-primary dark:text-border-light mb-2"
              >
                Subject
              </Typography>
              <select
                id="subject"
                name="subject"
                className="w-full px-3 py-2 border border-secondary dark:border-text-tertiary rounded-lg shadow-sm focus:outline-none focus:ring-brand-jade focus:border-brand-jade dark:bg-muted dark:text-inverse"
              >
                <option value="">Select a topic</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-primary dark:text-border-light mb-2"
              >
                Message
              </Typography>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full px-3 py-2 border border-secondary dark:border-text-tertiary rounded-lg shadow-sm focus:outline-none focus:ring-brand-jade focus:border-brand-jade dark:bg-muted dark:text-inverse"
                placeholder="Tell us how we can help..."
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
            >
              Send Message
            </Button>
          </form>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="mt-12 text-center">
        <div className="bg-subtle dark:bg-muted rounded-lg p-6">
          <Typography
            variant="headline-sm"
            as="h3"
            className="mb-2 text-primary"
          >
            Looking for Quick Answers?
          </Typography>
          <p className="mb-4 text-secondary">
            Check out our FAQ section for common questions about BoxCall
            features and usage.
          </p>
          <Button variant="link" size="sm" className="px-4 py-2">
            <a href="/faq" className="hover:underline">
              View FAQ
            </a>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};
