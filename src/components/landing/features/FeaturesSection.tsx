'use client';

import { Container, SimpleGrid, Text, Title } from '@mantine/core';
import {
  IconChartBar,
  IconFolders,
  IconPackages,
  IconPhoto,
  IconSearch,
  IconUsers,
} from '@tabler/icons-react';
import { motion } from 'motion/react';
import { FeatureCard } from './FeatureCard';
import classes from './styles/Features.module.css';

const features = [
  {
    icon: IconPackages,
    title: 'Organize Your Inventory',
    description: 'Create a searchable product catalog with images, details, and custom categories.',
  },
  {
    icon: IconFolders,
    title: 'Multiple Projects Support',
    description:
      'Organize products across different projects. Toggle status, search, and filter instantly.',
  },
  {
    icon: IconUsers,
    title: 'Collaborate Seamlessly',
    description: 'Invite team members, assign roles, and work together in real-time.',
  },
  {
    icon: IconSearch,
    title: 'Find Products Instantly',
    description:
      'Powerful client-side search across products and projects with real-time filtering.',
  },
  {
    icon: IconPhoto,
    title: 'Upload Product Images',
    description: 'Direct-to-S3 uploads for fast, scalable image management.',
  },
  {
    icon: IconChartBar,
    title: 'Track Performance',
    description: 'Built-in analytics to understand product usage and team activity.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function FeaturesSection() {
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
            Everything You Need to Manage Products
          </Title>
          <Text className={classes.subtitle} mt="md">
            Powerful features designed for teams of all sizes
          </Text>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt={50}>
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </Container>
    </section>
  );
}
