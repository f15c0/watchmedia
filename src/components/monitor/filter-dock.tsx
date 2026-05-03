"use client";

import { FaNewspaper, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import { MdRadio } from 'react-icons/md';
import { PiTelevisionSimpleBold } from 'react-icons/pi';
import { TbWorld } from 'react-icons/tb';
import { Dock, DockIcon, DockItem, DockLabel } from '../../../components/motion-primitives/dock';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterDockProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { title: 'All Sources', value: 'ALL',       icon: <TbWorld className='h-full w-full' /> },
  { title: 'News',        value: 'NEWS',       icon: <FaNewspaper className='h-full w-full' /> },
  { title: 'Twitter',     value: 'TWITTER',    icon: <FaTwitter className='h-full w-full' /> },
  { title: 'Facebook',    value: 'FACEBOOK',   icon: <FaFacebook className='h-full w-full' /> },
  { title: 'Instagram',   value: 'INSTAGRAM',  icon: <FaInstagram className='h-full w-full' /> },
  { title: 'Radio',       value: 'RADIO',      icon: <MdRadio className='h-full w-full' /> },
  { title: 'TV',          value: 'TV',         icon: <PiTelevisionSimpleBold className='h-full w-full' /> },
];

function DockItems({ activeFilter, onFilterChange }: FilterDockProps) {
  return (
    <>
      {filters.map((item) => (
        <DockItem
          key={item.value}
          className={`aspect-square rounded-full transition-colors cursor-pointer ${
            activeFilter === item.value
              ? 'bg-sky-600 text-white shadow-md shadow-sky-400/40'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          onClick={() => onFilterChange(item.value)}
        >
          <DockLabel>{item.title}</DockLabel>
          <DockIcon>{item.icon}</DockIcon>
        </DockItem>
      ))}
    </>
  );
}

export function FilterDock({ activeFilter, onFilterChange }: FilterDockProps) {
  const activeLabel = filters.find((f) => f.value === activeFilter)?.title ?? '';

  return (
    <div className='sticky top-0 z-10 md:static md:z-auto -mx-4 md:mx-0 px-4 md:px-0 pt-3 pb-2 md:pt-0 md:pb-0 bg-white/90 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none border-b border-slate-100 md:border-none flex flex-col items-center w-[calc(100%+2rem)] md:w-full gap-1.5 md:gap-2 mb-0 md:mb-5'>

      {/* Mobile dock — smaller, tighter */}
      <div className="md:hidden">
        <Dock
          className='items-end pb-2 shadow-lg shadow-slate-200/60 border border-slate-100 gap-2 px-3'
          magnification={46}
          distance={60}
          panelHeight={42}
        >
          <DockItems activeFilter={activeFilter} onFilterChange={onFilterChange} />
        </Dock>
      </div>

      {/* Desktop dock */}
      <div className="hidden md:block">
        <Dock
          className='items-end pb-3 shadow-xl shadow-slate-200/80 border border-slate-100'
          magnification={62}
          distance={100}
        >
          <DockItems activeFilter={activeFilter} onFilterChange={onFilterChange} />
        </Dock>
      </div>

      {/* Active filter label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={activeFilter}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="text-[11px] font-semibold text-sky-600 tracking-wide"
        >
          {activeLabel}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
