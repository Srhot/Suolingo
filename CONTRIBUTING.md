# Contributing to SUOLINGO

Thank you for your interest in contributing to SUOLINGO! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment (OS, React Native version, etc.)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach (optional)

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/Srhot/Suolingo.git
   cd Suolingo
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Write clear, commented code
   - Test your changes thoroughly

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: Add pronunciation feedback visualization"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📋 Code Style Guidelines

### TypeScript
- Use strict TypeScript types
- Avoid `any` types
- Document complex functions with JSDoc

### React Native
- Use functional components with hooks
- Follow React best practices
- Keep components small and focused

### File Structure
- Place screens in `src/screens/`
- Place services in `src/services/`
- Place types in `src/types/`
- Keep files organized by feature

### Naming Conventions
- **Components**: PascalCase (e.g., `AvatarScreen.tsx`)
- **Services**: PascalCase (e.g., `DeepgramService.ts`)
- **Utilities**: camelCase (e.g., `storage.ts`)
- **Types**: PascalCase (e.g., `Avatar.ts`)

## 🧪 Testing

Before submitting a PR:
- ✅ Test on both iOS and Android (if possible)
- ✅ Run `npm run lint` - no errors
- ✅ Run `npx tsc` - no type errors
- ✅ Test all affected features

## 🎯 Priority Areas for Contributions

We especially welcome contributions in:
- **New Learning Modes**: Additional interactive learning scenarios
- **Language Support**: Adding support for more languages
- **UI/UX Improvements**: Better design and user experience
- **Performance**: Optimization and speed improvements
- **Documentation**: Improving guides and examples
- **Bug Fixes**: Fixing existing issues

## 📦 Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. Run the app:
   ```bash
   npx expo start
   ```

## 🔑 API Keys (For Contributors)

You'll need API keys for:
- **Deepgram**: Speech-to-Text (https://deepgram.com)
- **ElevenLabs**: Text-to-Speech (https://elevenlabs.io)
- **A2E**: Avatar lip-sync (https://a2e.ai)
- **Gemini**: AI conversation (https://ai.google.dev)

Free tiers are available for development!

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution, no matter how small, is valuable. Thank you for helping make SUOLINGO better!

---

**Questions?** Feel free to create an issue or reach out via LinkedIn.
