'use client';

import { Avatar, Card, Container, Group, SimpleGrid, Text, Title } from '@mantine/core';
import { motion } from 'motion/react';
import classes from './styles/SocialProof.module.css';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'NextStack SaaS Starter transformed how we manage inventory across projects. Game changer!',
    author: 'Sarah J.',
    role: 'Product Manager',
    company: 'TechCorp',
  },
  {
    quote: 'The search functionality alone saved us hours every week. Highly recommend!',
    author: 'Michael R.',
    role: 'Operations Lead',
    company: 'StartupCo',
  },
  {
    quote: 'Simple, powerful, and exactly what we needed. Best investment we made.',
    author: 'Jessica L.',
    role: 'Team Lead',
    company: 'Digital Agency',
  },
];

const stats = [
  { value: '1,000+', label: 'Teams' },
  { value: '50,000+', label: 'Products Managed' },
  { value: '99.9%', label: 'Uptime' },
];

export function SocialProof() {
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
            Loved by Teams Worldwide
          </Title>
        </motion.div>

        <div className={classes.statsContainer}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={classes.stat}
            >
              <Text className={classes.statValue}>{stat.value}</Text>
              <Text className={classes.statLabel}>{stat.label}</Text>
            </motion.div>
          ))}
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt={60}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.author} {...testimonial} index={index} />
          ))}
        </SimpleGrid>
      </Container>
    </section>
  );
}

interface TestimonialCardProps extends Testimonial {
  index: number;
}

function TestimonialCard({ quote, author, role, company, avatar, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={classes.testimonialCard} padding="lg">
        <Text className={classes.quote}>"{quote}"</Text>
        <Group mt="lg" gap="sm">
          <Avatar src={avatar} radius="xl" size="md" color="blue">
            {author[0]}
          </Avatar>
          <div>
            <Text fw={600} size="sm">
              {author}
            </Text>
            <Text size="xs" c="dimmed">
              {role} at {company}
            </Text>
          </div>
        </Group>
      </Card>
    </motion.div>
  );
}
