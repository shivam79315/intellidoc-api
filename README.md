# IntelliDocs Backend

Backend API for **IntelliDocs** — an AI-powered document chat platform where users can upload PDFs, extract text, generate embeddings, store vectors in MongoDB, and chat with documents using semantic search + Groq LLM responses.

---

# Features

- User Authentication with HTTP-only Cookies
- Secure Session Management
- Upload PDF Documents
- Parse PDFs using `pdf-parse`
- Split Documents into Chunks
- Generate Embeddings using `Xenova/Transformers`
- Store Chunks + Embeddings in MongoDB
- Semantic Search for Relevant Context
- AI Chat using Groq API
- Chat History Management
- RESTful API Structure
- TypeScript + Express Architecture

---

# Tech Stack

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- MongoDB
- Mongoose

## Authentication

- HTTP-only Cookie Sessions
- bcryptjs (password hashing)

## AI / NLP

- Groq API (chat responses)
- Xenova Transformers (embeddings)

## File Handling

- Multer (file upload)
- pdf-parse (PDF text extraction)

---

# Project Structure

```bash
src/
│── config/            # Database, environment, external configs
│── controllers/       # Request handlers
│── middleware/        # Auth middleware / error handlers
│── models/            # MongoDB schemas
│── repositories/      # Database query layer
│── routes/            # API routes
│── services/          # Core business logic
│── utils/             # Helper utilities
│── index.ts           # Main server entry point



Installation
1. Clone Repository

git clone https://github.com/shivam79315/intellidoc-api.git
cd intellidocs-backend

2. Install Dependencies
npm install

3. Environment Variables
Create a `.env` file by copying values from `.env.example`:

```bash
cp .env.example .env

## Run Project

Development
npm run dev
