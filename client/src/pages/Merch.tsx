import React from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Merch() {
  return (
    <Layout>
      <header className="mb-8 pt-4">
        <h1 className="text-4xl md:text-5xl font-display text-white">
          MERCH <span className="text-primary text-glow">SHOP</span>
        </h1>
        <p className="text-muted-foreground mt-2">Rep the grind. Get the gear.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full rounded-3xl flex flex-col items-center justify-center p-8 md:p-12 text-center mb-8"
      >
        <div className="w-32 h-32 mb-6">
          <img src="/logo.png" alt="Untamed Fit" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-4">EXCLUSIVE GEAR</h2>
        <p className="text-silver max-w-xl mb-8">
          Rep the Untamed movement. Shop premium fitness apparel, accessories, and merch designed by Kevin Gilliam for athletes who refuse to be tamed.
        </p>
        <a
          href="https://untamed-fitness-training.printify.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Button size="lg" className="bg-accent text-white hover:bg-accent/80 px-12 rounded-full font-bold tracking-widest uppercase h-14">
            SHOP NOW
          </Button>
        </a>
      </motion.div>

      <div className="glass-panel rounded-3xl p-8 md:p-12 text-center border border-primary/20">
        <h3 className="text-2xl font-display font-bold text-white mb-4">PREMIUM MEMBERS GET EXCLUSIVE BENEFITS</h3>
        <ul className="text-silver max-w-2xl mx-auto space-y-3 mb-8 text-lg">
          <li className="flex items-center justify-center gap-3">
            <span className="text-primary text-2xl">✓</span> Early access to new drops
          </li>
          <li className="flex items-center justify-center gap-3">
            <span className="text-primary text-2xl">✓</span> Exclusive member-only designs
          </li>
          <li className="flex items-center justify-center gap-3">
            <span className="text-primary text-2xl">✓</span> Free shipping on all orders
          </li>
          <li className="flex items-center justify-center gap-3">
            <span className="text-primary text-2xl">✓</span> VIP merch drops
          </li>
        </ul>
      </div>
    </Layout>
  );
}
