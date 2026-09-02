

## Setup Commands
- To run the DB and web server which serves the frontend `docker compose up --build`
- To run tests: `pytest tests/ -v`
- To run tests with coverage: `pytest tests/ --cov=api --cov-report=html`

## Project Structure
- The Flask API is now organized in the `api/` folder with separated concerns:
  - `api/routes/` - Flask Blueprints for API endpoints (templates, photos, static)
  - `api/services/` - Business logic (S3 storage)
  - `api/models.py` - Database models
  - `api/config.py` - Configuration
  - `api/app.py` - Application entry point
- Tests are organized in the `tests/` directory:
  - `tests/conftest.py` - Pytest fixtures and configuration
  - `tests/test_templates.py` - Templates API tests
  - `tests/test_photos.py` - Photos API tests
  - `tests/test_s3_storage.py` - S3 storage service tests

## Development Workflow
- Create feature branches from `main`
- Use pull requests for code review
- Update documentation for new features
- Run tests before committing: `pytest tests/ -v`
- Ensure test coverage stays above 70% (currently at 78%)
- CI runs automatically on push/PR to main/develop branches
- Branch protection requires tests to pass before merging