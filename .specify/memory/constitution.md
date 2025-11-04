<!--
SYNC IMPACT REPORT
==================
Version Change: Initial → 1.0.0
Reason: Initial constitution creation for SUOLINGO project

Modified Principles: N/A (Initial creation)

Added Sections:
- Core Principles (5 principles: Technical Standards, Architecture, Cost Control, Security, Performance)
- Development Workflow
- Quality Gates
- Governance

Removed Sections: None

Templates Status:
- ✅ plan-template.md: Reviewed - compatible (Constitution Check section will reference these principles)
- ✅ spec-template.md: Reviewed - compatible (Requirements align with principles)
- ✅ tasks-template.md: Reviewed - compatible (Test coverage and task organization align)

Follow-up TODOs: None - All placeholders filled
-->

# SUOLINGO Constitution

## Core Principles

### I. Technical Standards (NON-NEGOTIABLE)

**Technology Stack**:
- React Native with Expo framework MUST be used for all mobile development
- TypeScript MUST be used with strict mode enabled
- Functional components with hooks MUST be used; class components are prohibited
- Offline-first architecture MUST be implemented for core features

**Test Coverage**:
- Minimum 70% test coverage is REQUIRED for all code
- Tests MUST be written before or alongside implementation
- Every new feature MUST include corresponding tests

**Rationale**: These technical standards ensure code quality, type safety, maintainability, and consistent development patterns across the project. The offline-first approach is critical for user experience in varied network conditions, especially for language learning scenarios.

### II. Architecture (NON-NEGOTIABLE)

**AI Service Layer**:
- AI services MUST be modular and independently deployable
- Each AI service MUST be capable of operating independently
- Every AI service MUST implement fallback mechanisms for failures
- Retry logic with exponential backoff MUST be implemented for all API calls

**Service Independence**:
- Services MUST NOT have direct dependencies on other AI services
- Service failures MUST NOT cascade to other services
- Each service MUST handle its own error states gracefully

**Rationale**: Modular architecture with fallback mechanisms ensures system resilience. Language learning features require high availability - if one AI service fails (e.g., voice generation), other features (e.g., text lessons) must continue functioning. This prevents single points of failure from disrupting the entire learning experience.

### III. Cost Control (NON-NEGOTIABLE)

**Cost Tracking**:
- Every AI API call MUST be tracked with cost metrics
- Cost tracking MUST include: service name, token count, estimated cost, timestamp, user ID
- Daily and monthly cost reports MUST be generated automatically

**Usage Limits**:
- Per-user daily limits MUST be enforced for AI-powered features
- Per-user monthly limits MUST be enforced
- Rate limiting MUST be implemented to prevent abuse
- Clear user notifications MUST be shown when approaching limits

**Cost Optimization**:
- Pre-generation and caching strategies MUST be implemented where applicable
- Content MUST be cached at multiple levels (device, CDN, database)
- Freemium model with clear tier boundaries MUST be enforced

**Rationale**: AI services are expensive and can quickly consume budget if not monitored. Cost tracking and limits protect business viability while pre-generation/caching optimizes user experience and reduces per-request costs. The freemium model requires strict enforcement to be sustainable.

### IV. Security (NON-NEGOTIABLE)

**API Key Management**:
- API keys MUST be stored and managed on backend servers only
- Client applications MUST NEVER contain API keys or secrets
- All API calls to external services MUST be proxied through backend

**Data Privacy**:
- User voice recordings and face data MUST comply with GDPR requirements
- Users MUST provide explicit consent for voice/face data collection
- Data retention policies MUST be documented and enforced
- Users MUST be able to request data deletion at any time

**Content Moderation**:
- All user-generated content MUST pass through content moderation
- AI-generated content MUST be validated for appropriateness
- Content flagging and reporting mechanisms MUST be implemented

**Rationale**: Language learning apps handle sensitive personal data (voice, face). GDPR compliance is legally required in Europe and builds user trust. Backend-only API keys prevent theft and abuse. Content moderation ensures safe learning environment for all users.

### V. Performance (NON-NEGOTIABLE)

**Load Time Requirements**:
- Initial app load MUST complete within 3 seconds on mid-range devices
- Subsequent screen transitions MUST feel instant (<300ms)
- Splash screen time MUST be minimized

**Loading Indicators**:
- All video loading operations MUST show progress indicators
- Progress indicators MUST show percentage completion when determinable
- Timeout handling MUST be implemented for all network operations

**Offline Mode**:
- Core learning features MUST function offline
- Previously accessed content MUST be cached for offline use
- Clear indicators MUST show when content is offline-available
- Sync mechanisms MUST handle offline-to-online transitions gracefully

**Rationale**: Performance directly impacts user retention in mobile apps. 3-second load time is industry standard for mobile app engagement. Progress indicators reduce perceived wait time. Offline mode is essential for language learners who may practice during commutes or in areas with poor connectivity.

## Development Workflow

### Code Review Requirements

- All code changes MUST go through pull request review
- At least one approval REQUIRED before merge
- All automated tests MUST pass before merge
- Test coverage MUST NOT decrease with new changes

### Branch Strategy

- Feature branches MUST follow naming: `feature/[issue-number]-brief-description`
- Bug fix branches MUST follow naming: `fix/[issue-number]-brief-description`
- Main branch MUST always be deployable
- No direct commits to main branch

### Commit Standards

- Commits MUST follow conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Commits MUST be atomic and focused on single concern

## Quality Gates

### Pre-Merge Gates

Before any code can be merged to main:

1. **Tests**: All tests MUST pass (unit, integration, E2E if applicable)
2. **Coverage**: Test coverage MUST be ≥70% and not decrease
3. **Type Safety**: No TypeScript errors in strict mode
4. **Linting**: All ESLint rules MUST pass
5. **Build**: Production build MUST complete successfully
6. **Constitution Compliance**: Changes MUST comply with all constitution principles

### Pre-Release Gates

Before any release to production:

1. **Performance Audit**: Load time MUST be ≤3 seconds on test devices
2. **Cost Audit**: AI cost projections MUST be within budget
3. **Security Scan**: No critical vulnerabilities in dependencies
4. **Offline Test**: Core features MUST work offline
5. **Device Matrix**: Testing on iOS and Android minimum supported versions
6. **Analytics**: Tracking MUST be verified for key user actions

## Governance

### Amendment Process

- Constitution changes require documentation of rationale
- Breaking changes require MAJOR version bump
- New principles or sections require MINOR version bump
- Clarifications or fixes require PATCH version bump
- All amendments MUST be communicated to team
- Migration plans MUST be provided for breaking changes

### Compliance Review

- All pull requests MUST verify constitution compliance
- Quarterly reviews of adherence to principles
- Complexity exceptions MUST be documented and justified
- Architecture Decision Records (ADRs) MUST reference constitution principles

### Version Control

- This constitution uses semantic versioning (MAJOR.MINOR.PATCH)
- Version history MUST be maintained in this file or linked documentation
- Changes MUST include sync impact reports for dependent templates

### Documentation

- See `.specify/templates/plan-template.md` for implementation planning workflow
- See `.specify/templates/spec-template.md` for feature specification format
- See `.specify/templates/tasks-template.md` for task breakdown format
- All development decisions MUST reference applicable constitution principles

**Version**: 1.0.0 | **Ratified**: 2025-10-27 | **Last Amended**: 2025-10-27
