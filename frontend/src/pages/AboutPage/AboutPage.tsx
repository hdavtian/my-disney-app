import "./AboutPage.scss";
import { motion } from "framer-motion";
import { VideoSlider } from "../../components/VideoSlider";
import { video_content } from "../../types/video.types";

// Static video data for About page
const aboutPageVideos: video_content[] = [
  {
    youtube_url: "https://www.youtube.com/watch?v=V6JKLQj50ro",
    title: "Disney App Demo - Part 1",
    description:
      "Overview of the Disney App architecture and features, showcasing the modern React frontend with Redux state management, SCSS styling, and cinematic design patterns.",
  },
  {
    youtube_url: "https://www.youtube.com/watch?v=d5vAGeplOGE",
    title: "Disney App Demo - Part 2",
    description:
      "Deep dive into the technical implementation, covering the Spring Boot backend, PostgreSQL database, Azure cloud hosting, and full-stack integration.",
  },
];

export const AboutPage = () => {
  return (
    <motion.div
      className="page-container about-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <h1>About this Demo</h1>
        <p>
          A modern Disney character catalog showcasing clean architecture and
          cinematic design.
        </p>
      </div>

      <div className="about-content">
        {/* Video Showcase Section */}
        <div className="content-section video-section">
          <h2>Project Showcase</h2>
          <p className="section-intro">
            Watch these videos to see the Disney App in action and learn about
            the architecture and technical decisions behind this project.
          </p>
          <VideoSlider videos={aboutPageVideos} />
        </div>

        {/* Technology Stack Section */}
        <div className="content-section">
          <h2>Welcome to the Disney App Demo</h2>
          <p>
            This is a demo website to showcase the follwing web technologies,
            architecture and patterns. It really has been a lot of fun to
            create.
            <br></br>Harma Davtian - 2025
          </p>

          <div className="tech-features-grid">
            {/* Left Column: Technology Stack */}
            <div className="tech-column">
              <h3>Technology Stack</h3>

              <h4>Front-End</h4>
              <ul>
                <li>SPA: React 19/TypeScript</li>
                <li>State Manegement: Redux Toolkit</li>
                <li>Style: SCSS + Bootstrap</li>
                <li>Animation: Framer Motion</li>
                <li className="new-content">Build Tool: Vite 7.2</li>
                <li className="new-content">Routing: React Router</li>
                <li>LazyLoaded images (.webp)</li>
                <li>LocalStorage/Cache</li>
              </ul>

              <h4>Back-End</h4>
              <ul>
                <li>Java 21</li>
                <li>Spring Boot 3.3</li>
                <li>JPA (ORM)</li>
                <li>Lombok (Code Generation)</li>
                <li>Flyway Migrations</li>
                <li className="new-content">OpenAPI/Swagger</li>
                <li>Rest API</li>
                <li className="new-content">Maven</li>
              </ul>

              <h4>Database</h4>
              <ul>
                <li>PostgreSQL 16 (Neon)</li>
                <li className="new-content">pgvector (AI Embeddings)</li>
              </ul>

              <h4>Cloud Hosting</h4>
              <ul>
                <li>Azure Static Web App (Frontend)</li>
                <li>Azure Container App (Backend)</li>
                <li>Azure Blob Storage (Images)</li>
                <li>Application Insights</li>
                <li className="new-content">Custom Domains + SSL</li>
                <li className="new-content">CDN</li>
              </ul>

              <h4>DevOps</h4>
              <ul>
                <li>MonoRepo Structure</li>
                <li>GitHub</li>
                <li>GitHub Actions (CI/CD)</li>
                <li className="new-content">Docker</li>
                <li className="new-content">Azure CLI</li>
              </ul>

              <h4>APIs & Integrations</h4>
              <ul>
                <li>Google Analytics 4</li>
                <li className="new-content">YouTube Data API</li>
                <li className="new-content">Google Gemini 2.5 (RAG)</li>
              </ul>

              <h4>Development Tools</h4>
              <ul>
                <li>Frontend IDE: VS Code</li>
                <li>Backend IDE: IntelliJ IDEA</li>
                <li className="new-content">Package Managers: npm, Maven</li>
                <li className="new-content">Storybook (Component Docs)</li>
              </ul>
            </div>

            {/* Right Column: Website Features */}
            <div className="features-column">
              <h3>Website Features</h3>

              <h4 className="new-content">Character Catalog</h4>
              <ul>
                <li className="new-content">180+ Disney Characters</li>
                <li className="new-content">Character Detail Pages</li>
                <li className="new-content">Favorites System</li>
                <li className="new-content">Grid/List View Modes</li>
              </ul>

              <h4 className="new-content">Movie Collection</h4>
              <ul>
                <li className="new-content">830+ Disney Movies</li>
                <li className="new-content">Movie Detail Pages</li>
                <li className="new-content">Cast & Character Links</li>
                <li className="new-content">Batch Fetch API</li>
              </ul>

              <h4 className="new-content">Disney Parks</h4>
              <ul>
                <li className="new-content">12 Parks Worldwide</li>
                <li className="new-content">334 Attractions</li>
                <li className="new-content">Filter by Type/Thrill</li>
                <li className="new-content">Park Detail Pages</li>
              </ul>

              <h4 className="new-content">Interactive Games</h4>
              <ul>
                <li className="new-content">Character Quiz</li>
                <li className="new-content">Guessing Game (3 Modes)</li>
                <li className="new-content">Progressive Hints</li>
                <li className="new-content">Score Tracking</li>
              </ul>

              <h4 className="new-content">Search & Discovery</h4>
              <ul>
                <li className="new-content">Unified Search</li>
                <li className="new-content">Smart Highlighting</li>
                <li className="new-content">Multi-Category Filter</li>
                <li className="new-content">AI-Powered RAG</li>
              </ul>

              <h4 className="new-content">UI/UX</h4>
              <ul>
                <li className="new-content">Cinematic Design</li>
                <li className="new-content">Dynamic Carousels</li>
                <li className="new-content">Responsive Layout</li>
                <li className="new-content">Theme System</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h3>Coming Soon</h3>
          <p>
            Additional content including project walkthroughs and technical
            deep-dives will be added here.
          </p>
          {/* Future: YouTube video embeds and project links will go here */}
        </div>
      </div>
    </motion.div>
  );
};
