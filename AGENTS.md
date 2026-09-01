

## Setup Commands
- To run the DB and web server which serves the frontend `docker compose up --build`

## Project Structure
- The Flask API is now organized in the `api/` folder with separated concerns:
  - `api/routes/` - Flask Blueprints for API endpoints (templates, photos, static)
  - `api/services/` - Business logic (S3 storage)
  - `api/models.py` - Database models
  - `api/config.py` - Configuration
  - `api/app.py` - Application entry point

## Development Workflow
- Create feature branches from `main`
- Use pull requests for code review
- Update documentation for new features