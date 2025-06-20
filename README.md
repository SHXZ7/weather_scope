🌦️ WeatherScope
WeatherScope is a beautifully designed, feature-rich weather application built with Next.js and OpenWeatherMap API, allowing users to explore current conditions, hourly and daily forecasts, favorite cities, and even a fullscreen weather map of India.

<!-- Optional: Add a screenshot of your app -->

🚀 Features
🔍 City-based Weather Search with autocomplete suggestions

🌐 Live Weather Map of India powered by OpenWeatherMap

🕒 Current, Hourly, and 3-Day Forecasts

🎨 Theme Selector (Default, Ocean, Sunset, Forest, Rose)

🌘 Dark/Light Mode toggle with system preference detection

❤️ Favorite Cities bar with quick access & management

📍 Geolocation support to detect current location

📊 Detailed weather metrics (temp, wind, pressure, humidity, visibility, etc.)

💾 LocalStorage Persistence for theme and favorites

✨ Animated background effects based on weather & theme

📦 Tech Stack
Framework: Next.js

API: OpenWeatherMap

Icons: Lucide-react

Styling: Tailwind CSS + custom gradients & transitions

State Management: React Hooks & Context API

🛠️ Setup Instructions
Clone the Repository:

bash
Copy
Edit
git clone https://github.com/yourusername/weatherscope.git
cd weatherscope
Install Dependencies:

bash
Copy
Edit
npm install
Create Environment Variables:

In the root of your project, create a .env.local file:

env
Copy
Edit
NEXT_PUBLIC_WEATHER_API_KEY=your_openweathermap_api_key
Run the Application:

bash
Copy
Edit
npm run dev
Visit http://localhost:3000 in your browser.

🗺️ India Weather Map Integration
Click the floating Map Pin icon in the bottom-right corner to open a fullscreen interactive weather map for India, powered by OpenWeatherMap layers. Supports fullscreen toggle and keyboard Esc key to close.

📸 Preview
Optionally, add GIFs/screenshots here of:

Search bar in action

Dark/Light theme switch

Weather forecast cards

Fullscreen India map

📁 Project Structure Highlights
diff
Copy
Edit
- page.js          # Main component containing all UI logic
- public/
- styles/
- .env.local       # API Key for OpenWeatherMap
📜 License
MIT License. Free to use and customize.

👨‍💻 Author
Mohammed Shaaz
🎥 Video Editor | 📊 Aspiring Data Analyst & ML Enthusiast | 💻 Full-Stack Learner
📫 LinkedIn | 🌐 Portfolio
