import React from "react";

import { Typography } from "../../components/design-system/Typography";
import { Icon } from "../../components/ui/Icon/Icon";
import { LogoIcon } from "../../components/ui/Logo";
import { PageLayout } from "../../components/layout/PageLayout";

const AboutPage: React.FC = () => {
  return (
    <PageLayout variant="detail">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <LogoIcon size="lg" color="brand" />
          <Typography
            variant="headline-xl"
            as="h1"
            className="text-interaction-jade"
          >
            About BoxCall
          </Typography>
        </div>
        <Typography
          variant="body-lg"
          color="muted"
          className="max-w-2xl mx-auto"
        >
          Revolutionizing football coaching with intelligent play management and
          team coordination tools.
        </Typography>
      </div>

      {/* Mission Section */}
      <div className="mb-12">
        <Typography variant="headline-lg" as="h2" className="mb-6">
          Our Mission
        </Typography>
        <p className="text-text-primary dark:text-border-light mb-4">
          BoxCall is dedicated to empowering football coaches at every level
          with innovative technology that simplifies play calling, enhances team
          communication, and elevates game strategy. We believe that great
          coaching tools should be accessible, intuitive, and powerful.
        </p>
        <p className="text-text-primary dark:text-border-light">
          From youth leagues to high school varsity teams, BoxCall provides the
          digital playbook and coordination platform that modern football
          demands.
        </p>
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <Typography variant="headline-lg" as="h2" className="mb-6">
          What We Offer
        </Typography>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                <Icon name="file" size="sm" color="primary" />
              </div>
              <Typography variant="headline-sm" as="h3">
                Digital Playbooks
              </Typography>
            </div>
            <p className="text-text-secondary">
              Create, organize, and access your complete playbook from any
              device. Share plays instantly with your coaching staff and
              players.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                <Icon name="calendar" size="sm" color="primary" />
              </div>
              <Typography variant="headline-sm" as="h3">
                Practice Planning
              </Typography>
            </div>
            <p className="text-text-secondary">
              Design efficient practice sessions with drill libraries, timing
              tools, and progress tracking for optimal team development.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                <Icon name="users" size="sm" color="primary" />
              </div>
              <Typography variant="headline-sm" as="h3">
                Team Management
              </Typography>
            </div>
            <p className="text-text-secondary">
              Manage rosters, track player progress, coordinate with coaching
              staff, and maintain seamless communication across your
              organization.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-surface-jade dark:bg-surface-jade-dark rounded-lg flex items-center justify-center">
                <Icon name="chart" size="sm" color="primary" />
              </div>
              <Typography variant="headline-sm" as="h3">
                Analytics & Reports
              </Typography>
            </div>
            <p className="text-text-secondary">
              Gain insights into team performance, play effectiveness, and
              player development with comprehensive analytics and reporting
              tools.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-12">
        <Typography variant="headline-lg" as="h2" className="mb-6">
          Built by Coaches, for Coaches
        </Typography>
        <p className="text-text-primary dark:text-border-light mb-4">
          BoxCall was founded by experienced football coaches who understand the
          unique challenges of modern football coaching. Our team combines
          decades of on-field experience with cutting-edge technology expertise.
        </p>
        <p className="text-text-primary dark:text-border-light">
          We're committed to continuously improving our platform based on real
          feedback from coaches in the field, ensuring BoxCall evolves with the
          game we all love.
        </p>
      </div>

      {/* Contact CTA */}
      <div className="text-center surface-subtle dark:bg-surface-secondary rounded-lg p-8">
        <Typography variant="headline-sm" as="h3" className="mb-4">
          Ready to Transform Your Coaching?
        </Typography>
        <p className="mb-6 text-text-secondary">
          Join thousands of coaches who are already using BoxCall to elevate
          their teams.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/create-team"
            className="inline-flex items-center justify-center px-6 py-3 border border-surface-primary text-base font-medium rounded-md text-text-primary bg-interaction-jade hover:bg-brand-jade-dark transition-colors"
          >
            Start Your Team
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border-subtle text-base font-medium rounded-md text-text-primary surface-card surface-subtle-hover transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutPage;
