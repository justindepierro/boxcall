import React from "react";
import { Icon } from "../../components/ui/Icon/Icon";
import { Button } from "../../components/ui";

export const ContactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Have questions about BoxCall? We're here to help coaches succeed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Get in Touch
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                  <Icon name="mail" size="sm" color="primary" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Email Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
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
                <div className="w-10 h-10 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                  <Icon name="phone" size="sm" color="primary" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Phone Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Speak directly with our coaching support team
                </p>
                <p className="text-interaction-jade font-medium">
                  1-800-BOXCALL
                </p>
                <p className="text-gray-500 text-sm">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                  <Icon name="info" size="sm" color="primary" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Business Address
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
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
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Support Hours
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Monday - Friday
                </span>
                <span className="text-gray-900 dark:text-white">
                  9:00 AM - 6:00 PM EST
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Saturday
                </span>
                <span className="text-gray-900 dark:text-white">
                  10:00 AM - 2:00 PM EST
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sunday</span>
                <span className="text-gray-900 dark:text-white">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Send us a Message
          </h2>

          <form className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-jade focus:border-brand-jade dark:bg-gray-700 dark:text-white"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-jade focus:border-brand-jade dark:bg-gray-700 dark:text-white"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-jade focus:border-brand-jade dark:bg-gray-700 dark:text-white"
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
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-jade focus:border-brand-jade dark:bg-gray-700 dark:text-white"
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
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Looking for Quick Answers?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
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
    </div>
  );
};
