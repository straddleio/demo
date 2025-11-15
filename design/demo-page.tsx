"use client";

import React from 'react';
import {
  RetroCard,
  RetroCardHeader,
  RetroCardTitle,
  RetroCardDescription,
  RetroCardContent,
  RetroButton,
  RetroBadge,
  RetroInput,
  RetroHeading,
  RetroDivider,
  RetroContainer,
  PixelText,
  AnimatedCounter,
  useTypewriter,
} from '@/components/ui/retro-components';

export default function RetroDesignDemo() {
  const typedText = useTypewriter("System initialized... Ready Player One", 50);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with CRT Effect */}
      <RetroContainer crt scanlines className="py-20 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <RetroHeading level={1} glow>
            Retro Gaming Design System
          </RetroHeading>
          <p className="mt-6 text-xl text-neutral-400 font-body max-w-2xl mx-auto">
            {typedText}<span className="animate-pulse">_</span>
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <RetroButton variant="primary" filled>
              Start Game
            </RetroButton>
            <RetroButton variant="secondary">
              Load Save
            </RetroButton>
            <RetroButton variant="accent">
              Options
            </RetroButton>
          </div>
        </div>
      </RetroContainer>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Stats Section */}
        <section className="mb-16">
          <RetroHeading level={2} variant="secondary" className="mb-8">
            Player Stats
          </RetroHeading>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <RetroCard variant="cyan" glow>
              <div className="text-center">
                <PixelText className="block text-xs mb-2">Level</PixelText>
                <AnimatedCounter value={42} className="text-4xl block" />
              </div>
            </RetroCard>
            
            <RetroCard variant="blue">
              <div className="text-center">
                <PixelText variant="secondary" className="block text-xs mb-2">
                  Experience
                </PixelText>
                <AnimatedCounter value={9001} className="text-4xl block" />
              </div>
            </RetroCard>
            
            <RetroCard variant="magenta">
              <div className="text-center">
                <PixelText variant="accent" className="block text-xs mb-2">
                  Achievements
                </PixelText>
                <AnimatedCounter value={28} suffix="/50" className="text-4xl block" />
              </div>
            </RetroCard>
            
            <RetroCard variant="gold">
              <div className="text-center">
                <PixelText variant="gold" className="block text-xs mb-2">
                  Gold Coins
                </PixelText>
                <AnimatedCounter value={1337} className="text-4xl block" />
              </div>
            </RetroCard>
          </div>
        </section>

        <RetroDivider />

        {/* Card Variants */}
        <section className="mb-16">
          <RetroHeading level={2} variant="primary" className="mb-8">
            Quest Board
          </RetroHeading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RetroCard variant="cyan">
              <RetroCardHeader>
                <div className="flex items-center justify-between">
                  <RetroCardTitle>Main Quest</RetroCardTitle>
                  <RetroBadge variant="primary">Active</RetroBadge>
                </div>
                <RetroCardDescription>
                  Complete the primary objective
                </RetroCardDescription>
              </RetroCardHeader>
              <RetroCardContent>
                <p className="text-neutral-300 font-body mb-4">
                  Travel to the Digital Fortress and retrieve the lost data fragments.
                  Beware of corrupted files and firewall defenses.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Progress</span>
                    <PixelText className="text-xs">3/5</PixelText>
                  </div>
                  <div className="w-full bg-background-dark border border-primary/30 h-2">
                    <div className="bg-primary h-full w-3/5 shadow-glow-cyan" />
                  </div>
                </div>
                <RetroButton variant="primary" className="w-full mt-4">
                  Continue Quest
                </RetroButton>
              </RetroCardContent>
            </RetroCard>

            <RetroCard variant="blue">
              <RetroCardHeader>
                <div className="flex items-center justify-between">
                  <RetroCardTitle>Side Quest</RetroCardTitle>
                  <RetroBadge variant="secondary">Optional</RetroBadge>
                </div>
                <RetroCardDescription>
                  Bonus objectives for extra rewards
                </RetroCardDescription>
              </RetroCardHeader>
              <RetroCardContent>
                <p className="text-neutral-300 font-body mb-4">
                  Help the local NPCs debug their legacy systems. Rewards include
                  rare items and bonus experience points.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Reward</span>
                    <PixelText variant="secondary" className="text-xs">+500 XP</PixelText>
                  </div>
                </div>
                <RetroButton variant="secondary" className="w-full mt-4">
                  Start Quest
                </RetroButton>
              </RetroCardContent>
            </RetroCard>

            <RetroCard variant="magenta">
              <RetroCardHeader>
                <div className="flex items-center justify-between">
                  <RetroCardTitle>Boss Battle</RetroCardTitle>
                  <RetroBadge variant="accent">⚠ Hard</RetroBadge>
                </div>
                <RetroCardDescription>
                  Face the ultimate challenge
                </RetroCardDescription>
              </RetroCardHeader>
              <RetroCardContent>
                <p className="text-neutral-300 font-body mb-4">
                  Confront the Megacorp AI in an epic showdown. Only the most
                  skilled players should attempt this mission.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Recommended Level</span>
                    <PixelText variant="accent" className="text-xs">45+</PixelText>
                  </div>
                </div>
                <RetroButton variant="accent" className="w-full" disabled>
                  Level Required
                </RetroButton>
              </RetroCardContent>
            </RetroCard>

            <RetroCard variant="gold">
              <RetroCardHeader>
                <div className="flex items-center justify-between">
                  <RetroCardTitle>Special Event</RetroCardTitle>
                  <RetroBadge variant="gold">Limited</RetroBadge>
                </div>
                <RetroCardDescription>
                  Time-limited opportunity
                </RetroCardDescription>
              </RetroCardHeader>
              <RetroCardContent>
                <p className="text-neutral-300 font-body mb-4">
                  The Annual Code Jam is here! Compete against other players
                  for exclusive rewards and legendary status.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Time Remaining</span>
                    <PixelText variant="gold" className="text-xs animate-pulse">
                      2:47:33
                    </PixelText>
                  </div>
                </div>
                <RetroButton variant="gold" className="w-full">
                  Join Event
                </RetroButton>
              </RetroCardContent>
            </RetroCard>
          </div>
        </section>

        <RetroDivider />

        {/* Typography Showcase */}
        <section className="mb-16">
          <RetroHeading level={2} variant="secondary" className="mb-8">
            Typography & Effects
          </RetroHeading>
          
          <div className="space-y-8">
            <div className="retro-card p-8">
              <RetroHeading level={1} glow>
                H1 with Glow
              </RetroHeading>
              <RetroHeading level={2} variant="secondary" className="mt-4">
                H2 Blue Variant
              </RetroHeading>
              <RetroHeading level={3} variant="accent" className="mt-4">
                H3 Magenta Variant
              </RetroHeading>
              <RetroHeading level={4} variant="gold" className="mt-4">
                H4 Gold Variant
              </RetroHeading>
            </div>

            <div className="retro-card p-8">
              <h3 className="text-xl font-pixel text-primary mb-4">Glitch Effect</h3>
              <RetroHeading level={2} glitch variant="accent">
                System Error
              </RetroHeading>
            </div>

            <div className="retro-card p-8">
              <h3 className="text-xl font-pixel text-primary mb-4">Text Variants</h3>
              <div className="space-y-3">
                <PixelText glow>Glowing Pixel Text</PixelText>
                <br />
                <PixelText variant="secondary">Blue Pixel Text</PixelText>
                <br />
                <PixelText variant="accent" glow>Magenta Glowing Text</PixelText>
                <br />
                <PixelText variant="gold">Gold Pixel Text</PixelText>
              </div>
            </div>
          </div>
        </section>

        <RetroDivider />

        {/* Buttons & Badges */}
        <section className="mb-16">
          <RetroHeading level={2} variant="primary" className="mb-8">
            UI Elements
          </RetroHeading>
          
          <div className="retro-card p-8 space-y-8">
            <div>
              <h3 className="text-lg font-pixel text-primary mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <RetroButton variant="primary" filled>
                  Primary Filled
                </RetroButton>
                <RetroButton variant="primary">
                  Primary Outline
                </RetroButton>
                <RetroButton variant="secondary">
                  Secondary
                </RetroButton>
                <RetroButton variant="accent">
                  Accent
                </RetroButton>
                <RetroButton variant="gold">
                  Gold
                </RetroButton>
                <RetroButton variant="primary" disabled>
                  Disabled
                </RetroButton>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-pixel text-primary mb-4">Badges</h3>
              <div className="flex flex-wrap gap-4">
                <RetroBadge variant="primary">Active</RetroBadge>
                <RetroBadge variant="secondary">Optional</RetroBadge>
                <RetroBadge variant="accent">Critical</RetroBadge>
                <RetroBadge variant="gold">Limited</RetroBadge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-pixel text-primary mb-4">Input Fields</h3>
              <div className="space-y-4 max-w-md">
                <RetroInput placeholder="Enter your username..." />
                <RetroInput placeholder="Enter your email..." type="email" />
                <RetroInput placeholder="Disabled input" disabled />
              </div>
            </div>
          </div>
        </section>

        <RetroDivider />

        {/* Special Effects */}
        <section className="mb-16">
          <RetroHeading level={2} variant="accent" className="mb-8">
            Special Effects
          </RetroHeading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RetroCard variant="cyan">
              <RetroCardHeader>
                <RetroCardTitle>Scanlines Effect</RetroCardTitle>
              </RetroCardHeader>
              <RetroCardContent>
                <div className="scanlines bg-background-dark p-6 rounded-pixel">
                  <p className="font-pixel text-primary text-sm">
                    Old CRT monitor effect with horizontal scanlines overlay
                  </p>
                </div>
              </RetroCardContent>
            </RetroCard>

            <RetroCard variant="blue">
              <RetroCardHeader>
                <RetroCardTitle>Grid Background</RetroCardTitle>
              </RetroCardHeader>
              <RetroCardContent>
                <div className="retro-grid bg-background-dark p-6 rounded-pixel min-h-[100px]">
                  <p className="font-pixel text-secondary text-sm">
                    Retro grid pattern like classic racing games
                  </p>
                </div>
              </RetroCardContent>
            </RetroCard>

            <RetroCard variant="magenta">
              <RetroCardHeader>
                <RetroCardTitle>Pulse Animation</RetroCardTitle>
              </RetroCardHeader>
              <RetroCardContent>
                <div className="animate-pulse-glow bg-background-dark border-2 border-accent p-6 rounded-pixel">
                  <p className="font-pixel text-accent text-sm">
                    Pulsing glow effect for attention-grabbing elements
                  </p>
                </div>
              </RetroCardContent>
            </RetroCard>

            <RetroCard variant="gold">
              <RetroCardHeader>
                <RetroCardTitle>Pixelated Image</RetroCardTitle>
              </RetroCardHeader>
              <RetroCardContent>
                <div className="bg-background-dark p-6 rounded-pixel">
                  <div className="w-32 h-32 bg-gold/20 border-2 border-gold pixelated mx-auto flex items-center justify-center">
                    <PixelText variant="gold">IMG</PixelText>
                  </div>
                  <p className="text-xs text-neutral-400 text-center mt-2 font-body">
                    Use .pixelated class for retro image rendering
                  </p>
                </div>
              </RetroCardContent>
            </RetroCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12">
          <PixelText variant="primary" className="text-sm">
            ⚡ Powered by Retro Design System ⚡
          </PixelText>
          <p className="text-neutral-500 text-xs font-body mt-2">
            Press START to continue
          </p>
        </footer>
      </div>
    </div>
  );
}
