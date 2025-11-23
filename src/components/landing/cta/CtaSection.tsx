'use client';

import { Button, Container, Group, Text, Title } from '@mantine/core';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAnalytics } from '~/hooks/analytics/useAnalytics';
import classes from './styles/Cta.module.css';

export function CtaSection() {
  const analytics = useAnalytics();

  const handleGetStarted = () => {
    analytics.trackUserAction({
      action: 'click',
      category: 'landing_page',
      label: 'cta_get_started',
    });
  };

  return (
    <section className={classes.section}>
      <Container size="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={classes.content}
        >
          <Title order={2} className={classes.title}>
            Ready to Organize Your Products?
          </Title>
          <Text className={classes.subtitle} mt="md">
            Join 1,000+ teams using NextStack SaaS Starter
          </Text>

          <Button
            component={Link}
            href="/sign-up"
            size="xl"
            radius="md"
            className={classes.ctaButton}
            rightSection={<IconArrowRight size={24} />}
            mt={32}
            onClick={handleGetStarted}
          >
            Get Started Free
          </Button>

          <Group justify="center" gap="xl" mt="lg" className={classes.trustSignals}>
            <Text size="sm" className={classes.trustSignal}>
              <IconCheck size={16} className={classes.checkIcon} />
              No credit card required
            </Text>
            <Text size="sm" className={classes.trustSignal}>
              <IconCheck size={16} className={classes.checkIcon} />
              Free forever plan
            </Text>
            <Text size="sm" className={classes.trustSignal}>
              <IconCheck size={16} className={classes.checkIcon} />
              Set up in 2 minutes
            </Text>
          </Group>
        </motion.div>
      </Container>
    </section>
  );
}
