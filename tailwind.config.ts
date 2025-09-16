import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				navy: {
					DEFAULT: 'hsl(var(--navy))',
					dark: 'hsl(var(--navy-dark))'
				},
				amber: {
					neon: 'hsl(var(--amber-neon))',
					glow: 'hsl(var(--amber-glow))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translate3d(0, 20px, 0)' },
					'100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' }
				},
				'fade-in-fast': {
					'0%': { opacity: '0', transform: 'translate3d(0, 10px, 0)' },
					'100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' }
				},
				'slide-up-fast': {
					'0%': { transform: 'translate3d(0, 15px, 0)', opacity: '0' },
					'100%': { transform: 'translate3d(0, 0, 0)', opacity: '1' }
				},
				'scale-in-fast': {
					'0%': { transform: 'scale3d(0.95, 0.95, 1)', opacity: '0' },
					'100%': { transform: 'scale3d(1, 1, 1)', opacity: '1' }
				},
				'glow': {
					'0%, 100%': { textShadow: '0 0 20px hsl(var(--amber-neon) / 0.5)' },
					'50%': { textShadow: '0 0 30px hsl(var(--amber-neon) / 0.8)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.15s ease-out',
				'accordion-up': 'accordion-up 0.15s ease-out',
				'fade-in': 'fade-in 0.4s ease-out',
				'fade-in-fast': 'fade-in-fast 0.3s ease-out',
				'slide-up-fast': 'slide-up-fast 0.25s ease-out',
				'scale-in-fast': 'scale-in-fast 0.2s ease-out',
				'glow': 'glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
