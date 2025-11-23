'use client';

import { Container, Text, Title } from '@mantine/core';
import { motion } from 'motion/react';
import classes from './styles/Benefits.module.css';

interface Benefit {
  headline: string;
  description: string;
  metric: string;
  imagePosition: 'left' | 'right';
}

const benefits: Benefit[] = [
  {
    headline: 'Reduce Product Lookup Time by 70%',
    description:
      'Stop wasting hours searching spreadsheets. Find any product in seconds with powerful search and filtering.',
    metric: '70% faster',
    imagePosition: 'right',
  },
  {
    headline: 'Never Lose Track of Products Across Projects',
    description:
      'Keep all your products organized in one place. Switch between projects instantly without losing context.',
    metric: '10,000+ products managed',
    imagePosition: 'left',
  },
  {
    headline: 'From 10 Products to 10,000+',
    description:
      'Start small and grow. NextStack SaaS Starter handles catalogs of any size without slowing down.',
    metric: 'Unlimited scaling',
    imagePosition: 'right',
  },
  {
    headline: 'Your Team, One Platform',
    description:
      'Everyone stays in sync. Real-time updates, shared projects, and seamless collaboration.',
    metric: '1,000+ teams',
    imagePosition: 'left',
  },
];

export function BenefitsSection() {
  return (
    <section className={classes.section}>
      <Container size="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={classes.header}
        >
          <Title order={2} className={classes.title}>
            Why Teams Choose NextStack SaaS Starter
          </Title>
        </motion.div>

        <div className={classes.benefits}>
          {benefits.map((benefit, index) => (
            <BenefitBlock key={index} {...benefit} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

interface BenefitBlockProps extends Benefit {
  index: number;
}

function BenefitBlock({ headline, description, metric, imagePosition, index }: BenefitBlockProps) {
  const isLeft = imagePosition === 'left';

  return (
    <motion.div
      className={classes.benefitBlock}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className={`${classes.benefitGrid} ${isLeft ? classes.imageLeft : classes.imageRight}`}>
        <div className={classes.benefitContent}>
          <Title order={3} className={classes.benefitHeadline}>
            {headline}
          </Title>
          <Text className={classes.benefitDescription} mt="md">
            {description}
          </Text>
          {metric && (
            <Text className={classes.metric} mt="lg" fw={700}>
              {metric}
            </Text>
          )}
        </div>
        <div className={classes.benefitVisual}>
          <div className={classes.visualPlaceholder}>
            <Text c="dimmed" size="sm">
              Visual placeholder
            </Text>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
