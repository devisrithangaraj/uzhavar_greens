npx create-vite@latest temp-app --template react
Move-Item -Path temp-app\* -Destination . -Force
Move-Item -Path temp-app\.* -Destination . -Force
Remove-Item -Recurse -Force temp-app
npm install
npm install react-router-dom lucide-react framer-motion clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
