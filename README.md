# 🌟 **Plagiarism Checker**
### Video Demo: [Link - todo](#)
### Live Demo: [Anti-Copy, Right?!?](https://anticopyright.netlify.app)
---
![Render](https://img.shields.io/endpoint?url=https://api.render.com/v1/services/your-render-service-id/status)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-netlify-badge/deploy-status)](https://app.netlify.com/sites/your-netlify-site/deploys)
![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4.svg)
![License](https://img.shields.io/github/license/your-github-username/your-repository-name)
![Python](https://img.shields.io/badge/python-3.8-blue)
![React](https://img.shields.io/badge/react-17.0.2-blue)
---

## **Synopsis** 
Thanks for checking out this project and also reading the README!  I will briefly outline the project, the problems I faced, the choices that were made and why.  


Let me start by saying, this might not be the first Plagiarism Checker out there at this point. It is, however, the only one out there available for anyone that was built by me for cs50...


Essentially, I was having a really difficult time even choosing a topic for this project.  Let alone nailing down the tech or title.  This is something that was in a list of responses from an AI prompt asking: "What should I do for my cs50 Final Project?".  After almost 6 months of trying to decide, the **Plagiarism Checker** was born.  We were able to use AI as one of the tech stacks so I continued to prompt with errors and warnings along the way to help troubleshoot.


### **Key Decisions**


#### Plagiarism Checker Backend Framework:


- Decision: I chose to use FastAPI for the backend because of its speed, scalability, and flexibility, even though I was less familiar with it compared to alternatives.
- Insight: I prioritized building on a strong, scalable platform for long-term benefits over immediate familiarity.


#### Switching to .env for Environment Variables:


- Decision: Transitioned sensitive data (like API keys) to environment variables using .env for security.
- Insight: Recognized the importance of hiding sensitive keys during deployment and asked for clarity on handling it with both local and hosted environments.


#### Deployment Hosting:


- Decision: Selected Render for hosting the backend and Netlify for the frontend.
- Insight: Leveraged my familiarity with Netlify for easy frontend hosting while exploring Render for backend scalability, acknowledging its free-tier benefits.


#### Handling Google API Limits:


- Decision: After hitting Google’s free-tier API limits, I decided to look into alternative search APIs (like Bing Web Search or SerpAPI).
- Insight: Anticipated the need for scalability and diversification of API resources early on to ensure long-term viability.


#### Improving Detection Sensitivity:


- Decision: Enhanced the app’s plagiarism detection by implementing token-based similarity and semantic similarity (Sentence-BERT), as well as adding advanced text normalization.
- Insight: Identified that 30% similarity was insufficient and drove the decision to combine fuzzy matching with more nuanced semantic analysis for better results.


#### Frontend-Backend Integration:


- Decision: Resolved frontend-to-backend communication issues by correctly pointing the frontend to the deployed backend URL, handling CORS, and debugging with test endpoints like /api-status.
- Insight: Ensured the app was functional across both environments and prioritized user experience by eliminating potential blockers.


#### Switching API Binding for Render:


- Decision: Modified the backend to bind to 0.0.0.0 instead of 127.0.0.1 and dynamically use the PORT environment variable to fix deployment issues on Render.
- Insight: Understood the importance of proper port binding and recognized Render’s requirements for making the service publicly accessible.




### **Key Observations**


#### User Experience Focus:


- When building the plagiarism checker, I highlighted the need for a flashy, clean UI to attract users like students and educators.


#### Real-Time Debugging:


- My descision to use /api-status as a test endpoint helped quickly verify the backend’s availability and functionality during debugging.


#### Testing Against Real-World Inputs:


- Testing the app with **Shakespeare’s - Sonnet 18** to gauge detection accuracy was a practical way to evaluate and refine sensitivity.


#### Emphasis on Scalability:


- By opting for scalable hosting and considering API alternatives early, I showed foresight in preparing the app for real-world usage.


#### Leveraging Tools:


- My decision to use Netlify and Render reflected smart use of familiar platforms while exploring new tools like Render for backend hosting.






### **What These Say About You** - chatGPT's reflection of our conversation when asked for a review. 😊😊😊
- **You’re strategic:** Balancing ease of use and long-term scalability was a recurring theme in your decisions.
- **You’re practical:** Testing with real-world scenarios (like Sonnet 18) and setting up debugging endpoints ensured progress at each step.
- **You’re innovative:** Suggestions like integrating ChatGPT and optimizing user experience reflect a creative mindset.



---

## **About the Project**
The **Plagiarism Checker** is a cutting-edge tool designed for students, educators, and professionals. It detects plagiarism with incredible accuracy by combining **fuzzy matching** and **semantic similarity analysis**. The app makes originality checks simple and effective.

### 🎯 **Key Features**
- 🔍 **Advanced Text Analysis**: Matches user input against web content for unmatched accuracy.
- 📂 **Multiple Input Methods**: Upload files or paste text directly.
- 📊 **Detailed Results**: Visualize flagged chunks, similarity scores, and matching sources.
- 🚦 **Real-Time API Status**: Know when the system is ready to go.

---

## **How It Works**

### 🖋 **Upload a File or Paste Text**
Provide the content to be checked for plagiarism. You can upload a file or just copy and paste the text in question. 

### ⚙️ **Processing**
- Extracts text from `.pdf`, `.docx`, or `.txt` files.
- Splits long text into manageable chunks.
- Matches chunks against web content using the **Google Custom Search API**.

### 📈 **Results**
- **Similarity Scores**: Displays scores for each chunk.
- **Highlighted Matches**: Snippets, links, and flagged chunks are clearly shown.

---

## **Built With**

### **Backend**
- 🚀 **FastAPI**: The foundation of the backend.
- 🧠 **Sentence-BERT**: For advanced semantic similarity.
- 🌐 **Google Custom Search API**: Powers web-based content comparisons.

### **Frontend**
- ⚛️ **React.js**: Creates a sleek and interactive user interface.
- 🎨 **Tailwind CSS**: For beautiful, responsive designs.
- 🌐 **Axios**: Handles efficient API communication.

### **Additional Tools**
- 📄 **PyPDF2**: Extracts text from PDF files.
- 📑 **python-docx**: Extracts text from DOCX files.
- 🧮 **RapidFuzz**: Delivers fast and accurate text matching.

---

## **Deployment**

🚀 This app is deployed on cloud platforms for scalability and accessibility:
- **Backend**: Hosted on [Render](https://render.com/).
- **Frontend**: Deployed using [Netlify](https://www.netlify.com/).

You can set it up on your own using the following guides:
- **Backend**: Render, AWS, or Heroku.
- **Frontend**: Netlify or Vercel.

---

## **License**

- 📜 This project is licensed under the MIT License. Feel free to use it, modify it, and share it under the terms of the license.
