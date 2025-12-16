# Project Structure

## Root Layout
```
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Page title and tagline
│   │   ├── MainCard.tsx     # Central container with fixed height
│   │   ├── TabInterface.tsx # Mode switching tabs
│   │   ├── QRPreview.tsx    # QR display and download
│   │   └── panels/          # Mode-specific input panels
│   │       ├── StaticQRPanel.tsx
│   │       ├── DynamicQRPanel.tsx
│   │       └── EncryptedQRPanel.tsx
│   ├── utils/               # Core business logic
│   │   ├── qr-generator.ts  # generateStaticQR function
│   │   ├── totp.ts          # generateTOTP function
│   │   └── crypto.ts        # encryptPayload/decryptPayload
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # QRMode, QRResult, TOTPConfig, etc.
│   ├── hooks/               # Custom React hooks
│   │   └── useQRGenerator.ts # Main state management
│   └── App.tsx              # Root component
├── tests/                   # Test files
│   ├── unit/                # Component and function tests
│   └── properties/          # Property-based tests (fast-check)
└── public/                  # Static assets
```

## Component Architecture

### Layout Hierarchy
```
App
├── Header
├── MainCard
│   ├── TabInterface
│   ├── [Current Panel Component]
│   │   ├── StaticQRPanel
│   │   ├── DynamicQRPanel
│   │   └── EncryptedQRPanel
│   └── QRPreview
└── Footer
```

## Design Constraints

### Layout Rules
- **MainCard**: Fixed height container, no internal scrolling
- **Content Area**: Left-right split on desktop, vertical stack on mobile
- **QR Preview**: Fixed dimensions (300x300px) with responsive scaling
- **Tab Interface**: Consistent height across all modes to prevent layout shifts

### State Management
- **Single source of truth**: useQRGenerator hook manages all app state
- **Mode isolation**: Each panel manages its own input state
- **Shared QR result**: Common QRPreview component for all modes

### File Organization
- **Components**: One component per file, co-located styles
- **Utils**: Pure functions with comprehensive JSDoc
- **Types**: Centralized type definitions
- **Tests**: Mirror src structure in tests directory

## Naming Conventions
- **Components**: PascalCase (e.g., `StaticQRPanel.tsx`)
- **Utils**: camelCase (e.g., `generateStaticQR`)
- **Types**: PascalCase interfaces (e.g., `QRResult`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `QR_CONFIG`)
- **Test files**: `*.test.ts` or `*.spec.ts`