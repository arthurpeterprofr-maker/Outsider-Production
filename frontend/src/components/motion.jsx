import { motion } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 32, className = "", ...rest }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 1, ease: EASE, delay }}
    {...rest}
  >
    {children}
  </motion.div>
);

const lineVariants = {
  hidden: { y: "110%" },
  show: ({ i, d }) => ({ y: "0%", transition: { duration: 1.1, ease: EASE, delay: i * 0.12 + d } }),
};

export const MaskLines = ({ lines, className = "", lineClassName = "", as = "h2", onLoad = false, delay = 0 }) => {
  const Tag = motion[as];
  const trigger = onLoad ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.1 } };
  return (
    <Tag className={className} initial="hidden" {...trigger}>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className="block overflow-hidden pb-[0.08em]">
          <motion.span className={`block ${lineClassName}`} variants={lineVariants} custom={{ i, d: delay }}>
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

export const Label = ({ children, className = "" }) => (
  <p className={`op-label flex items-center gap-3 ${className}`}>
    <span className="inline-block h-px w-8 bg-current opacity-60" />
    {children}
  </p>
);
