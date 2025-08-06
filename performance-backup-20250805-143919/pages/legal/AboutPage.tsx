import React from "react";
import { Icon } from "../../components/ui/Icon/Icon";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Icon name="boxcall" size="lg" color="jade" />
          <h1 className="text-4xl font-bold text-interaction-jade font-display">
            About BoxCall
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Revolutionizing football coaching with intelligent play management and
          team coordination tools.
        </p>
      </div>

      {/* Mission Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Our Mission
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          BoxCall is dedicated to empowering football coaches at every level
          with innovative technology that simplifies play calling, enhances team
          communication, and elevates game strategy. We believe that great
          coaching tools should be accessible, intuitive, and powerful.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          From youth leagues to high school varsity teams, BoxCall provides the
          digital playbook and coordination platform that modern football
          demands.
        </p>
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          What We Offer
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                <Icon name="file" size="sm" color="jade" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Digital Playbooks
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Create, organize, and access your complete playbook from any
              device. Share plays instantly with your coaching staff and
              players.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                <Icon name="calendar" size="sm" color="jade" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Practice Planning
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Design efficient practice sessions with drill libraries, timing
              tools, and progress tracking for optimal team development.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                <Icon name="users" size="sm" color="jade" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Team Management
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage rosters, track player progress, coordinate with coaching
              staff, and maintain seamless communication across your
              organization.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                <Icon name="chart" size="sm" color="jade" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Analytics & Reports
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Gain insights into team performance, play effectiveness, and
              player development with comprehensive analytics and reporting
              tools.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Built by Coaches, for Coaches
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          BoxCall was founded by experienced football coaches who understand the
          unique challenges of modern football coaching. Our team combines
          decades of on-field experience with cutting-edge technology expertise.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          We're committed to continuously improving our platform based on real
          feedback from coaches in the field, ensuring BoxCall evolves with the
          game we all love.
        </p>
      </div>

      {/* Contact CTA */}
      <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Ready to Transform Your Coaching?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Join thousands of coaches who are already using BoxCall to elevate
          their teams.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/create-team"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-interaction-jade hover:bg-brand-jade-dark transition-colors"
          >
            Start Your Team
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};
