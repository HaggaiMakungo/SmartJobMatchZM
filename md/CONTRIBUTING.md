# Contributing to SmartJobMatchZM

First off, thank you for considering contributing to SmartJobMatchZM! It's people like you that make this platform better for the Zambian job market.

## 🌟 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## 🚀 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected
- **Include screenshots** if relevant
- **Include your environment details** (OS, Python version, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Follow the project structure** and coding standards
3. **Write tests** for any new functionality
4. **Update documentation** as needed
5. **Ensure tests pass** before submitting
6. **Write clear commit messages**

## 💻 Development Process

### Setting Up Development Environment

1. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/SmartJobMatchZM.git
cd SmartJobMatchZM
```

2. Add upstream remote:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/SmartJobMatchZM.git
```

3. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

### Backend Development

- Follow **PEP 8** style guide
- Use **type hints** for all functions
- Write **docstrings** for all public methods
- Add **tests** for new features

### Frontend Development

- Follow **ESLint** configuration
- Use **TypeScript** when possible
- Write **component tests**
- Follow **React best practices**

### Commit Message Guidelines

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(matching): add semantic similarity scoring
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app  # With coverage
```

### Frontend Tests
```bash
cd frontend/jobmatch
npm test
npm test -- --coverage
```

## 📋 Project-Specific Guidelines

### Matching Algorithm Changes

If you're modifying the matching algorithm:
1. Understand the CAMSS formula
2. Test with real job data
3. Validate against test users
4. Document algorithm changes
5. Consider performance implications

### Database Schema Changes

For database modifications:
1. Create Alembic migrations
2. Test both upgrade and downgrade
3. Update model documentation
4. Consider backward compatibility

### API Changes

When modifying APIs:
1. Update OpenAPI documentation
2. Maintain backward compatibility when possible
3. Version breaking changes
4. Update API tests
5. Document in CHANGELOG

## 🔍 Code Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be in the next release!

## 📚 Documentation

- Keep README.md up to date
- Update API documentation for endpoint changes
- Add inline comments for complex logic
- Update CHANGELOG.md for significant changes

## 🎯 Priority Areas

We especially welcome contributions in:

- Improving matching algorithm accuracy
- Adding more job categories
- UI/UX enhancements
- Performance optimizations
- Test coverage improvements
- Documentation improvements

## ❓ Questions?

Feel free to open an issue with the `question` label if you need help or clarification.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for helping make SmartJobMatchZM better! 🇿🇲
