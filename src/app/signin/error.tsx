'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LuRotateCcw } from 'react-icons/lu';
import { LuTriangle } from 'react-icons/lu';
export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center'>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='mb-8 text-yellow-400'
      >
        <LuTriangle size={80} />
      </motion.div>
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className='mb-4 text-3xl font-bold text-yellow-400'
      >
        Oops!
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className='mb-8 text-xl text-yellow-200'
      >
        Something went wrong
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className='mb-8 text-sm text-yellow-200'
      >
        Don&apos;t worry, we&apos;re on it. Try again in a moment.
      </motion.p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => reset()}
        className='focus:ring-opacity-50 flex w-full max-w-xs items-center justify-center rounded-full bg-yellow-400 px-6 py-3 font-bold text-black transition-colors duration-300 hover:bg-yellow-300 focus:ring-2 focus:ring-yellow-600 focus:outline-none'
      >
        <LuRotateCcw size={20} className='mr-2' />
        Try Again
      </motion.button>
    </div>
  );
}
