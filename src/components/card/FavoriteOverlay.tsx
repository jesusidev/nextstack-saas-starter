'use client';

import { AnimatePresence, motion } from 'motion/react';

interface FavoriteOverlayProps {
  show: boolean;
  isFavorite: boolean;
}

export function FavoriteOverlay({ show, isFavorite }: FavoriteOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(250, 82, 82, 0.15) 0%, rgba(252, 146, 158, 0.15) 100%)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
            borderRadius: 'inherit',
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '1rem 2rem',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(250, 82, 82, 0.3)',
              border: '2px solid rgba(250, 82, 82, 0.2)',
              margin: '0 var(--mantine-spacing-xs) 0 var(--mantine-spacing-xs)',
            }}
          >
            <motion.div
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--mantine-color-red-6)',
                textAlign: 'center',
                letterSpacing: '0.02em',
              }}
            >
              {isFavorite ? '❤️ Favorited!' : '💔 Removed from favorites'}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
