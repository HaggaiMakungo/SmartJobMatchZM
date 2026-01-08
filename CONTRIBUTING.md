# Contributing to SmartJobMatchZM

Thank you for your interest in contributing to SmartJobMatchZM! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and be patient with questions
- Focus on constructive criticism
- Accept feedback gracefully
- Put the community and project first

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-job-matchingV2.git
   cd ai-job-matchingV2
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ai-job-matchingV2.git
   ```

4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. Set up your development environment (see README.md)

## Development Workflow

### Before Starting Work

1. Make sure your fork is up to date:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. Create a new branch from main:
   ```bash
   git checkout -b feature/my-new-feature
   ```

### While Working

1. Make your changes in logical, atomic commits
2. Write tests for new functionality
3. Ensure all tests pass
4. Update documentation as needed
5. Follow the coding standards below

### Submitting Changes

1. Push your branch to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```

2. Open a Pull Request on GitHub
3. Fill out the PR template completely
4. Wait for code review and address feedback

## Coding Standards

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints for function parameters and return values
- Maximum line length: 100 characters
- Use docstrings for all public functions and classes:
  ```python
  def calculate_match_score(cv: CV, job: Job) -> float:
      """
      Calculate match score between a CV and job posting.
      
      Args:
          cv: Candidate CV object
          job: Job posting object
          
      Returns:
          Match score between 0.0 and 1.0
      """
      pass
  ```

- Use meaningful variable names
- Keep functions focused on a single responsibility
- Format code with Black:
  ```bash
  black app/ --line-length 100
  ```

### TypeScript/JavaScript (Frontend)

- Follow ESLint rules
- Use TypeScript for type safety
- Use functional components with hooks
- Maximum line length: 100 characters
- Use meaningful component and variable names
- Document complex logic with comments
- Format code with Prettier:
  ```bash
  npm run format
  ```

### File Organization

- Place related code together
- Use clear, descriptive file names
- Keep files focused on a single concern
- Update imports when moving files

## Testing Guidelines

### Backend Tests

- Write unit tests for business logic
- Write integration tests for API endpoints
- Use pytest fixtures for common setup
- Test edge cases and error handling
- Aim for >80% code coverage

Example test structure:
```python
def test_match_scoring():
    """Test that match scoring calculates correctly."""
    # Arrange
    cv = create_test_cv()
    job = create_test_job()
    
    # Act
    score = calculate_match_score(cv, job)
    
    # Assert
    assert 0.0 <= score <= 1.0
    assert score > 0.5  # Should be a good match
```

### Frontend Tests

- Write component tests using React Testing Library
- Test user interactions
- Test error states
- Mock API calls appropriately

### Running Tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend/recruiter
npm test

# With coverage
pytest --cov=app tests/
```

## Commit Message Guidelines

Use conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(matching): add hybrid BM25+SBERT scoring

Implemented hybrid scoring algorithm that combines BM25 keyword
matching with SBERT semantic similarity for improved match quality.

Closes #123
```

```
fix(api): correct salary range filtering

Fixed issue where salary range filter was using wrong comparison
operator, causing incorrect job filtering.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. Ensure your code follows the coding standards
2. All tests pass
3. Documentation is updated
4. Branch is up to date with main
5. Commits are squashed if needed

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How were these changes tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added
- [ ] All tests passing
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, maintainer will merge
4. PR will be closed and changes deployed

## Project Structure

### Backend

- `app/api/v1/` - API endpoint definitions
- `app/models/` - Database models
- `app/schemas/` - Pydantic schemas for validation
- `app/services/` - Business logic layer
- `app/core/` - Configuration and security
- `ml/` - Machine learning training scripts
- `tests/` - Test suite

### Frontend (Recruiter)

- `src/components/` - Reusable React components
- `src/pages/` - Page-level components
- `src/lib/` - Utility functions
- `src/types/` - TypeScript type definitions

### Mobile App

- `app/` - Screen components
- `components/` - Reusable components
- `contexts/` - React context providers
- `services/` - API integration

## Areas for Contribution

### High Priority

- Improve test coverage
- Add multi-language support
- Enhance mobile app UI/UX
- Optimize database queries
- Improve documentation

### Good First Issues

Look for issues labeled `good-first-issue` - these are great starting points for new contributors.

### Feature Requests

- Video interview integration
- Skills assessment platform
- Advanced analytics
- Payment integration
- Employer verification

## Questions?

If you have questions:
1. Check existing documentation
2. Search closed issues
3. Open a new issue with the `question` label
4. Join our community chat (if available)

## Recognition

Contributors will be recognized in:
- GitHub contributor graph
- Release notes for significant contributions
- Project documentation

Thank you for contributing to SmartJobMatchZM!
