// "use client";

// import { motion } from "framer-motion";

// export function AnimatedBackground() {
//   return (
//     <div className="absolute inset-0 overflow-hidden pointer-events-none">
//       {/* Floating orbs */}
//       <motion.div
//         className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
//         animate={{
//           x: [0, 100, 0],
//           y: [0, -50, 0],
//         }}
//         transition={{
//           duration: 20,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       />
//       <motion.div
//         className="absolute top-40 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
//         animate={{
//           x: [0, -80, 0],
//           y: [0, 60, 0],
//         }}
//         transition={{
//           duration: 25,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       />
//       <motion.div
//         className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"
//         animate={{
//           x: [0, 120, 0],
//           y: [0, -80, 0],
//         }}
//         transition={{
//           duration: 30,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       />
      
//       {/* Floating particles */}
//       {Array.from({ length: 20 }).map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute w-2 h-2 bg-blue-500/30 rounded-full"
//           style={{
//             left: `${Math.random() * 100}%`,
//             top: `${Math.random() * 100}%`,
//           }}
//           animate={{
//             y: [0, -100, 0],
//             opacity: [0, 1, 0],
//           }}
//           transition={{
//             duration: 3 + Math.random() * 2,
//             repeat: Infinity,
//             delay: Math.random() * 2,
//           }}
//         />
//       ))}
//     </div>
//   );
// }


// "use client";

// export function AnimatedBackground() {
//   return (
//     <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-br -z-10 from-[#010409] via-[#0a0f1a] to-[#0f172a]">
//       {/* Subtle grid pattern */}
//       <div
//         className="absolute inset-0 opacity-[0.07]"
//         style={{
//           backgroundImage:
//             "linear-gradient(to right, #00ffff10 1px, transparent 1px), linear-gradient(to bottom, #00ffff10 1px, transparent 1px)",
//           backgroundSize: "40px 40px",
//         }}
//       />

//       {/* Central glow */}
//       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[160px]" />

//       {/* Subtle vignette (dark edges) */}
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#000_100%)]" />
//     </div>
//   );
// }


"use client";

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 transition-colors duration-700">
      {/* Background gradient changes with theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-[#e5e7eb] to-[#d1d5db] dark:from-[#010409] dark:via-[#0a0f1a] dark:to-[#0f172a]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.07] transition-opacity"
        style={{
          backgroundImage:
            "linear-gradient(to right, #00ffff10 1px, transparent 1px), linear-gradient(to bottom, #00ffff10 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Central glow (only in dark mode) */}
      <div className="absolute left-1/2 top-1/2 hidden dark:block -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[160px]" />

      {/* Subtle vignette (dark edges only in dark mode) */}
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_center,transparent_40%,#000_100%)]" />
    </div>
  );
}


