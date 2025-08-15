# ScamGuard AI - Real-time Fraud Detection System

## Overview

ScamGuard AI is a browser-based real-time scam and fraud detection system that monitors live conversations through microphone input. The application uses speech-to-text conversion and AI-powered analysis to identify potential scam patterns and provide instant alerts to users. Built as a full-stack web application, it combines modern React frontend with Express.js backend, utilizing Google's Gemini AI for intelligent scam detection.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Components**: Shadcn/UI component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and theming support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Speech Recognition**: Browser Web Speech API for real-time audio transcription

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for session management and conversation analysis
- **Data Storage**: In-memory storage with interfaces designed for future database integration
- **AI Integration**: Google Gemini AI API for scam pattern detection and analysis

### Core Features
- **Real-time Audio Processing**: Continuous microphone listening with multilingual speech-to-text conversion
- **Session Management**: Track monitoring sessions with start/stop functionality and comprehensive statistics
- **Advanced Scam Detection Engine**: AI-powered analysis supporting Hindi and English with specialized Indian fraud pattern recognition
- **Comprehensive Fraud Coverage**: Detects banking fraud, OTP/CVV theft, lottery scams, tech support fraud, identity theft, and emergency scams
- **Instant Alert System**: Real-time notifications with detailed scam analysis and prevention guidance
- **Demo Testing Mode**: Built-in test scenarios for various fraud types including Hindi examples
- **Privacy Protection**: Local processing with user consent for microphone access

### Data Models
The application uses a well-defined schema with three main entities:
- **Sessions**: Track monitoring periods with timestamps and activity status
- **Conversations**: Store transcribed audio segments with speaker identification
- **Scam Detections**: Record detected fraud patterns with confidence scores and analysis

### AI Analysis Pipeline
- **Multilingual Processing**: Support for Hindi, English, Bengali, Tamil, Telugu, Marathi, and Gujarati
- **Comprehensive Fraud Detection**: Identifies banking fraud, OTP/CVV theft, KBC lottery scams, tech support fraud, government impersonation, and emergency scams
- **Pattern Recognition**: Advanced Gemini AI analysis trained on Hindi scam examples and Indian fraud patterns
- **Confidence Scoring**: Rate detection certainty from 0-100% with detailed pattern analysis
- **Alert Generation**: Instant notifications with specific scam type identification and prevention guidance

## External Dependencies

### AI Services
- **Google Gemini AI**: Primary scam detection engine using the `@google/genai` SDK
- **Alternative Support**: Framework supports Google API key fallback for flexibility

### Database Integration
- **Drizzle ORM**: Type-safe database toolkit configured for PostgreSQL
- **Neon Database**: Cloud PostgreSQL provider via `@neondatabase/serverless`
- **Migration System**: Database schema management through Drizzle Kit

### UI and Styling
- **Radix UI**: Comprehensive primitive components for accessibility and interaction
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Modern icon library for consistent visual elements

### Development Tools
- **Vite**: Fast build tool with hot module replacement and development server
- **TypeScript**: Static type checking across frontend, backend, and shared modules
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment optimization for cloud-based coding

### Browser APIs
- **Web Speech API**: Native browser speech recognition with Hindi language support (Chrome/Edge required)
- **MediaDevices API**: Microphone access with improved permission handling and fallback options
- **Notifications API**: Enhanced browser notifications for scam alerts with detailed analysis

The architecture emphasizes privacy, performance, and user experience while maintaining flexibility for future enhancements and database integration.