import { RiGamepadLine } from 'react-icons/ri';
import { FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-darker border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
              <RiGamepadLine className="text-white text-lg" />
            </div>
            <span className="text-white font-bold text-lg">
              Games<span className="gradient-text">Hub</span>
            </span>
          </div>

          <p className="text-muted text-sm">© 2024 GamesHub. All rights reserved.</p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
              <button key={i}
                className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-glow hover:border-glow/50 transition-all">
                <Icon className="text-base" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}