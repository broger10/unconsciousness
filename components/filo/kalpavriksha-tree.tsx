"use client";

import { motion } from "framer-motion";

interface KalpavrikshaTreeProps {
  className?: string;
  breathing?: boolean;
  windBlowing?: boolean;
  branchesClosing?: boolean;
  rootsMoving?: boolean;
  color?: string;
}

/**
 * Kalpavriksha — l'albero dei desideri della tradizione vedica e buddista.
 * SVG inline, stile incisione antica, stroke-only.
 * Può essere sostituito con illustrazione custom.
 */
export function KalpavrikshaTree({
  className = "",
  breathing = true,
  windBlowing = false,
  branchesClosing = false,
  rootsMoving = false,
  color = "#F0E6C8",
}: KalpavrikshaTreeProps) {
  const branchAnimation = branchesClosing
    ? { rotate: 12, scaleX: 0.6, transition: { duration: 2, ease: "easeInOut" as const } }
    : windBlowing
    ? {
        rotate: [0, 0.8, -0.6, 0.4, 0],
        transition: { duration: 3, ease: "easeInOut" as const, repeat: Infinity },
      }
    : {};

  const trunkAnimation = breathing && !branchesClosing
    ? {
        scaleY: [1, 1.006, 1],
        transition: { duration: 4, ease: "easeInOut" as const, repeat: Infinity },
      }
    : {};

  const rootAnimation = rootsMoving
    ? {
        x: [0, 1, -1, 0.5, 0],
        transition: { duration: 0.8, ease: "easeInOut" as const },
      }
    : {};

  return (
    <svg
      viewBox="0 0 400 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
    >
      {/* ─── Branches (top 40%) ─── */}
      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        animate={branchAnimation}
      >
        {/* Main branch left */}
        <path
          d="M200 240 C180 210, 140 180, 100 150 C80 138, 60 130, 45 120"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Sub-branch left upper */}
        <path
          d="M140 180 C125 165, 100 145, 80 125 C70 115, 55 105, 50 90"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Sub-branch left lower */}
        <path
          d="M160 200 C140 185, 110 170, 85 165 C70 162, 50 155, 35 145"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Twig left */}
        <path
          d="M100 150 C90 140, 75 125, 65 105"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Twig far left */}
        <path
          d="M80 125 C65 110, 45 95, 30 75"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Main branch right */}
        <path
          d="M200 240 C220 210, 260 180, 300 150 C320 138, 340 130, 355 120"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Sub-branch right upper */}
        <path
          d="M260 180 C275 165, 300 145, 320 125 C330 115, 345 105, 350 90"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Sub-branch right lower */}
        <path
          d="M240 200 C260 185, 290 170, 315 165 C330 162, 350 155, 365 145"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Twig right */}
        <path
          d="M300 150 C310 140, 325 125, 335 105"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Twig far right */}
        <path
          d="M320 125 C335 110, 355 95, 370 75"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Central upward branches */}
        <path
          d="M200 240 C195 200, 185 160, 170 120 C165 105, 155 85, 150 65"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M200 240 C205 200, 215 160, 230 120 C235 105, 245 85, 250 65"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Crown — small branches at top */}
        <path
          d="M170 120 C160 100, 145 80, 130 60"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M230 120 C240 100, 255 80, 270 60"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M200 240 C200 190, 200 140, 200 90 C200 70, 200 55, 200 40"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Leaf dots on branch tips */}
        <circle cx="45" cy="118" r="2.5" fill="currentColor" opacity="0.3" />
        <circle cx="50" cy="88" r="2" fill="currentColor" opacity="0.25" />
        <circle cx="30" cy="73" r="2" fill="currentColor" opacity="0.2" />
        <circle cx="65" cy="103" r="2" fill="currentColor" opacity="0.25" />
        <circle cx="35" cy="143" r="2" fill="currentColor" opacity="0.25" />
        <circle cx="355" cy="118" r="2.5" fill="currentColor" opacity="0.3" />
        <circle cx="350" cy="88" r="2" fill="currentColor" opacity="0.25" />
        <circle cx="370" cy="73" r="2" fill="currentColor" opacity="0.2" />
        <circle cx="335" cy="103" r="2" fill="currentColor" opacity="0.25" />
        <circle cx="365" cy="143" r="2" fill="currentColor" opacity="0.25" />
        <circle cx="150" cy="63" r="2" fill="currentColor" opacity="0.25" />
        <circle cx="250" cy="63" r="2" fill="currentColor" opacity="0.25" />
        <circle cx="130" cy="58" r="2" fill="currentColor" opacity="0.2" />
        <circle cx="270" cy="58" r="2" fill="currentColor" opacity="0.2" />
        <circle cx="200" cy="38" r="2.5" fill="currentColor" opacity="0.3" />
      </motion.g>

      {/* ─── Trunk (center) ─── */}
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        animate={trunkAnimation}
      >
        {/* Main trunk */}
        <path
          d="M196 380 C197 360, 198 340, 199 320 C199 300, 200 280, 200 260 C200 250, 200 245, 200 240"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Trunk texture — bark lines */}
        <path
          d="M197 370 C198 355, 199 340, 198 325"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.2"
        />
        <path
          d="M201 365 C201 350, 200 335, 201 315"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.2"
        />
        <path
          d="M199 380 C199 360, 200 345, 200 330"
          stroke="currentColor"
          strokeWidth="0.4"
          strokeLinecap="round"
          opacity="0.15"
        />
      </motion.g>

      {/* ─── Roots (bottom 40%) ─── */}
      <motion.g
        style={{ originX: "50%", originY: "0%" }}
        animate={rootAnimation}
      >
        {/* Main root left */}
        <path
          d="M196 380 C180 400, 150 430, 120 450 C100 462, 75 475, 50 490"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Sub-root left */}
        <path
          d="M150 430 C135 445, 110 465, 85 480 C70 488, 55 500, 40 515"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Fine root left */}
        <path
          d="M120 450 C105 465, 80 485, 60 500"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.4"
        />
        {/* Far left root */}
        <path
          d="M196 385 C170 410, 130 445, 95 470 C75 483, 55 500, 30 520"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Main root right */}
        <path
          d="M204 380 C220 400, 250 430, 280 450 C300 462, 325 475, 350 490"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Sub-root right */}
        <path
          d="M250 430 C265 445, 290 465, 315 480 C330 488, 345 500, 360 515"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Fine root right */}
        <path
          d="M280 450 C295 465, 320 485, 340 500"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.4"
        />
        {/* Far right root */}
        <path
          d="M204 385 C230 410, 270 445, 305 470 C325 483, 345 500, 370 520"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Central downward root */}
        <path
          d="M200 380 C200 410, 198 445, 195 480 C193 500, 190 520, 188 540"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M200 380 C200 410, 202 445, 205 480 C207 500, 210 520, 212 540"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Root tip details */}
        <circle cx="50" cy="492" r="1.5" fill="currentColor" opacity="0.2" />
        <circle cx="40" cy="517" r="1.5" fill="currentColor" opacity="0.2" />
        <circle cx="30" cy="522" r="1.5" fill="currentColor" opacity="0.2" />
        <circle cx="60" cy="502" r="1.5" fill="currentColor" opacity="0.2" />
        <circle cx="350" cy="492" r="1.5" fill="currentColor" opacity="0.2" />
        <circle cx="360" cy="517" r="1.5" fill="currentColor" opacity="0.2" />
        <circle cx="370" cy="522" r="1.5" fill="currentColor" opacity="0.2" />
        <circle cx="340" cy="502" r="1.5" fill="currentColor" opacity="0.2" />
      </motion.g>

      {/* ─── Outer ring — subtle circle ─── */}
      <circle
        cx="200"
        cy="300"
        r="280"
        stroke="currentColor"
        strokeWidth="0.3"
        fill="none"
        opacity="0.1"
      />
    </svg>
  );
}
