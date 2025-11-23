'use client';

import { Container, Tabs, Text, Title } from '@mantine/core';
import { motion } from 'motion/react';
import { useState } from 'react';
import classes from './styles/ProductShowcase.module.css';

interface Screenshot {
  id: string;
  label: string;
  title: string;
  description: string;
}

const screenshots: Screenshot[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    title: 'Product Grid View',
    description: 'Browse and manage all your products in a clean, organized grid layout',
  },
  {
    id: 'create',
    label: 'Create Product',
    title: 'Quick Product Creation',
    description: 'Add new products with an intuitive modal interface in seconds',
  },
  {
    id: 'projects',
    label: 'Projects',
    title: 'Project Management',
    description: 'Switch between projects instantly and keep everything organized',
  },
  {
    id: 'search',
    label: 'Search',
    title: 'Real-Time Search',
    description: 'Find any product instantly with powerful search and filtering',
  },
];

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Static ID required for scroll-to functionality from HeroSection handleWatchDemo
    <section id="product-showcase" className={classes.section}>
      <Container size="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={classes.header}
        >
          <Title order={2} className={classes.title}>
            See NextStack SaaS Starter in Action
          </Title>
          <Text className={classes.subtitle} mt="md">
            Intuitive interface designed for productivity
          </Text>
        </motion.div>

        <Tabs
          defaultValue="dashboard"
          value={activeTab}
          onChange={(value) => setActiveTab(value || 'dashboard')}
          className={classes.tabs}
          classNames={{
            list: classes.tabsList,
            tab: classes.tab,
            panel: classes.tabPanel,
          }}
        >
          <Tabs.List>
            {screenshots.map((screenshot) => (
              <Tabs.Tab key={screenshot.id} value={screenshot.id}>
                {screenshot.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {screenshots.map((screenshot) => (
            <Tabs.Panel key={screenshot.id} value={screenshot.id} pt="xl">
              <BrowserMockup screenshot={screenshot} />
            </Tabs.Panel>
          ))}
        </Tabs>
      </Container>
    </section>
  );
}

interface BrowserMockupProps {
  screenshot: Screenshot;
}

function BrowserMockup({ screenshot }: BrowserMockupProps) {
  return (
    <motion.div
      className={classes.browserMockup}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      key={screenshot.id}
    >
      <div className={classes.browserBar}>
        <div className={classes.browserDots}>
          <span className={classes.dot} />
          <span className={classes.dot} />
          <span className={classes.dot} />
        </div>
        <div className={classes.browserUrl}>nextstack-saas-starter.com/{screenshot.id}</div>
        <div className={classes.browserSpacer} />
      </div>
      <div className={classes.screenshotWrapper}>
        <div className={classes.screenshotPlaceholder}>
          <div className={classes.screenshotContent}>
            <Title order={3} className={classes.screenshotTitle}>
              {screenshot.title}
            </Title>
            <Text className={classes.screenshotDescription} mt="sm">
              {screenshot.description}
            </Text>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
