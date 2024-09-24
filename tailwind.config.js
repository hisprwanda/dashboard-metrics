/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
	content: [
		"./src/**/*.{js,jsx,ts,tsx,html}",
		"./public/index.html", // Ensure HTML files are included
	  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
			
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: "#2C6693",		
  			destructive:"hsl(0, 61%, 57%)",
  			hoverDestructive:"hsl(0, 80%, 75%)",
  		
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}