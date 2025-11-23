'use client';

import { Button, Container, Group, Text, Title } from '@mantine/core';
import { IconArrowRight, IconPlayerPlay } from '@tabler/icons-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAnalytics } from '~/hooks/analytics/useAnalytics';
import classes from './styles/HeroSection.module.css';

export function HeroSection() {
  const analytics = useAnalytics();

  const handleGetStarted = () => {
    analytics.trackUserAction({
      action: 'click',
      category: 'landing_page',
      label: 'hero_get_started',
    });
  };

  const handleWatchDemo = () => {
    analytics.trackUserAction({
      action: 'click',
      category: 'landing_page',
      label: 'hero_watch_demo',
    });
    const showcaseElement = document.getElementById('product-showcase');
    showcaseElement?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={classes.hero}>
      <Container size="lg">
        <div className={classes.inner}>
          <motion.div
            className={classes.content}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Title order={1} className={classes.title}>
              Organize Products
              <br />
              <span className={classes.highlight}>Across Projects.</span>
              <br />
              Effortlessly.
            </Title>

            <Text size="xl" className={classes.subtitle} mt="md">
              Track inventory, manage projects, and collaborate with your team in one beautiful
              platform.
            </Text>

            <Group mt={40} gap="md">
              <Button
                component={Link}
                href="/sign-up"
                size="lg"
                radius="md"
                className={classes.ctaPrimary}
                rightSection={<IconArrowRight size={20} />}
                onClick={handleGetStarted}
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                radius="md"
                variant="default"
                className={classes.ctaSecondary}
                leftSection={<IconPlayerPlay size={20} />}
                onClick={handleWatchDemo}
              >
                Watch Demo
              </Button>
            </Group>

            <Text size="sm" c="dimmed" mt="md" className={classes.trustSignal}>
              No credit card required • Free forever plan • Set up in 2 minutes
            </Text>
          </motion.div>

          <motion.div
            className={classes.visual}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <div className={classes.browserMockup}>
              <div className={classes.browserBar}>
                <div className={classes.browserDots}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className={classes.screenshotWrapper}>
                <div className={classes.screenshotPlaceholder}>
                  <Text c="dimmed" size="sm">
                    Dashboard Screenshot
                  </Text>
                  <Text c="dimmed" size="xs" mt="xs">
                    Replace with /images/dashboard-preview.png
                  </Text>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>

      <motion.div
        className={classes.scrollIndicator}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      >
        <Text size="xs" c="dimmed">
          Scroll to explore
        </Text>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 15l-5-5h10l-5 5z" />
        </svg>
      </motion.div>
    </section>
  );
}
