'use client';

import {
  ActionIcon,
  Divider,
  Group,
  NavLink,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import {
  IconFolder,
  IconLayoutDashboard,
  IconList,
  IconPackages,
  IconPlus,
  IconSearch,
  IconWorld,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ModalCreateProject from '~/components/modal/CreateProject';
import { UserButton } from '~/components/userButton';
import { useEvent } from '~/hooks/use-event';
import { api } from '~/utils/trpc';
import classes from './styles/LoggedIn.module.css';

const links = [
  { icon: IconLayoutDashboard, label: 'Dashboard', link: '/dashboard' },
  {
    icon: IconPackages,
    label: 'Products',
    childrenLinks: [
      { label: 'All Products', link: '/products', icon: IconList },
      { label: 'Public Products', link: '/products?show=all', icon: IconWorld },
    ],
  },
];

type linkType = {
  label: string;
  link: string;
  icon?: React.ComponentType<{ size?: number | string; stroke?: number }>;
  childrenLinks?: linkType[];
};

export function LoggedInNavbar() {
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const { dispatch: dispatchSearchEvent } = useEvent('project:search');

  const onCreateProjectClick = () => {
    open();
  };

  const { data: projectsData } = api.project.projects.useQuery();
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }
    const query = searchQuery.toLowerCase();
    return projects.filter((project) => project.name.toLowerCase().includes(query));
  }, [projects, searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      dispatchSearchEvent({
        query: debouncedQuery,
        resultCount: filteredProjects.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filteredProjects.length, dispatchSearchEvent]);

  const renderNavLink = (link: linkType) => (
    <NavLink
      key={link.label}
      className={classes.mainLink}
      label={link.label}
      component={Link}
      href={link.link}
      leftSection={link.icon ? <link.icon size="1rem" stroke={1.5} /> : null}
    />
  );

  const mainLinks = links.map((link) => {
    if (link.childrenLinks) {
      return (
        <NavLink
          key={link.label}
          label={link.label}
          leftSection={link.icon ? <link.icon size="1rem" stroke={1.5} /> : null}
        >
          {link.childrenLinks.map((childLink) => renderNavLink(childLink))}
        </NavLink>
      );
    }
    return renderNavLink(link);
  });

  const projectLinks = filteredProjects.map((project) => (
    <NavLink
      key={project.id}
      component={Link}
      href={`/projects/${project.id}`}
      label={project.name}
      leftSection={<IconFolder size="1rem" stroke={1.5} />}
    />
  ));

  return (
    <>
      <ModalCreateProject opened={opened} close={close} />

      {/* Mobile User Controls - Only visible on mobile */}
      <Group justify="center" mb="md" hiddenFrom="sm">
        <UserButton variant="sidebar" />
      </Group>

      <Divider mb="md" hiddenFrom="sm" />

      <TextInput
        placeholder="Search projects..."
        size="xs"
        leftSection={<IconSearch size="1rem" stroke={1.5} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        mb="md"
        aria-label="Search projects"
      />

      <Stack gap="md">
        <section>{mainLinks}</section>

        <section>
          <Group mb="xs" justify="space-between">
            <Text size="xs" fw={500} c="dimmed" tt="uppercase">
              Projects
            </Text>
            <Tooltip label="Create Project" withArrow position="right">
              <ActionIcon variant="default" size={18} onClick={onCreateProjectClick}>
                <IconPlus size="0.8rem" stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {filteredProjects.length === 0 && searchQuery.trim() && (
            <Text size="xs" c="dimmed" ta="center" py="sm">
              No projects found matching "{searchQuery}"
            </Text>
          )}

          {filteredProjects.length === 0 && !searchQuery.trim() && (
            <Text size="xs" c="dimmed" ta="center" py="sm">
              No projects yet
            </Text>
          )}

          {filteredProjects.length > 0 && (
            <div className={classes.projectsScrollContainer}>{projectLinks}</div>
          )}
        </section>
      </Stack>
    </>
  );
}
