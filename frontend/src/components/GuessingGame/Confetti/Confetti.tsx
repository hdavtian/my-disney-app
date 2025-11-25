/**
 * Confetti.tsx
 * Celebration confetti animation for perfect scores
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Confetti.scss";

interface ConfettiProps {
  trigger: boolean;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  delay: number;
}

const COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#FFE66D", // Yellow
  "#95E1D3", // Mint
  "#F38181", // Pink
  "#AA96DA", // Purple
  "#FCBAD3", // Light Pink
  "#A8D8EA", // Light Blue
];

export function Confetti({ trigger }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);

      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Percentage across screen
        y: -10, // Start above viewport
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.3, // Stagger the start
      }));

      setPieces(newPieces);

      // Clean up after animation completes
      const timeout = setTimeout(() => {
        setIsActive(false);
        setPieces([]);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [trigger]);

  if (!isActive) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
          }}
          initial={{
            y: piece.y,
            rotate: piece.rotation,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
