'use client';

import { Text, ThemeIcon, Title } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { motion } from 'motion/react';
import classes from './styles/Features.module.css';

interface FeatureCardProps {
  icon: Icon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div className={classes.card} whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
      <ThemeIcon size={60} radius="md" className={classes.iconWrapper}>
        <Icon size={32} />
      </ThemeIcon>
      <Title order={3} className={classes.cardTitle} mt="md">
        {title}
      </Title>
      <Text className={classes.cardDescription} mt="sm">
        {description}
      </Text>
    </motion.div>
  );
}
