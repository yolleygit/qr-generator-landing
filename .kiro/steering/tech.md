# Technology Stack

## Frontend Framework
- **React 18** with TypeScript for type safety
- **Vite** as build tool for fast development and optimized builds
- **TailwindCSS** for responsive utility-first styling

## Core Libraries
- **qrcode**: QR code generation with PNG/SVG output support
- **otpauth**: RFC 6238 compliant TOTP implementation
- **WebCrypto API**: Browser-native AES-GCM encryption (no external crypto libs)

## Testing Framework
- **Jest** + **React Testing Library** for unit/integration tests
- **fast-check** for property-based testing (minimum 100 iterations per property)

## Key Technical Requirements
- **Security**: Mandatory WebCrypto API usage, no custom crypto implementations
- **Performance**: Input debouncing (300ms), React.memo optimization
- **Compatibility**: Google Authenticator format for TOTP QR codes
- **Standards**: AES-GCM + PBKDF2 (100k iterations) for encryption

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Code Quality
```bash
npm run lint         # ESLint check
npm run type-check   # TypeScript compilation check
```

## Architecture Patterns
- **Functional components** with React Hooks for state management
- **Modular functions** with JSDoc documentation for core QR operations
- **Error boundaries** for graceful error handling
- **Async/await** for all crypto and QR generation operations