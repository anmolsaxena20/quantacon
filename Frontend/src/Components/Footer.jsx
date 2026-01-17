import React from "react";
import { Link, Navigate } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/80 backdrop-blur-xl text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-5">

        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-white text-xl font-bold">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              💪
            </div>
           Synopsis
          </div>
          <p className="mt-4 max-w-sm text-sm text-pink-400">
            Train smarter. Stay consistent. Transform your body with workouts,
            nutrition guidance, and progress tracking.
          </p>
        </div>
        <FooterColumn title="Product">
          <FooterLink to="/programs">Programs</FooterLink>
          <FooterLink to="/pricing">Pricing</FooterLink>
          <FooterLink to="/features">Features</FooterLink>
          <FooterLink to="/download">Download</FooterLink>
        </FooterColumn>

        <FooterColumn title="Company">
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/careers">Careers</FooterLink>
          <FooterLink to="/blog">Blog</FooterLink>
          <FooterLink to="/press">Press</FooterLink>
        </FooterColumn>

        <FooterColumn title="Support">
          <FooterLink to="/help">Help Center</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
        </FooterColumn>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-cyan-400 gap-4">
          <span>© 2026 SWEAT. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

/* Small reusable components */
function FooterColumn({ title, children }) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-4">{title}</h4>
      <ul className="space-y-3 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="hover:text-white transition"
      >
        {children}
      </Link>
    </li>
  );
}
