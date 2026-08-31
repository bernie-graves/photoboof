# Wedding Photobooth

A web-based photobooth application for Abby & Bernie's wedding. Users can capture photos using their mobile devices and view them in a shared gallery.

## Features

- **Mobile-Friendly**: Works on any device with a camera
- **Template System**: Admin-uploadable PNG overlay templates
- **Photo Gallery**: Browse and download all captured photos
- **4-Photo Sessions**: Classic photobooth experience with countdown
- **WebRTC Camera**: Access device cameras directly in the browser
- **Admin Panel**: Upload and manage templates

## Tech Stack

- **Backend**: Python + Flask + SQLAlchemy
- **Frontend**: React + Vite
- **Database**: PostgreSQL
- **File Storage**: AWS S3
- **Deployment**: Render

## Local Development

### Prerequisites

- Docker and Docker Compose
- AWS S3 credentials (for file storage)

### Setup

1. **Clone the repository**
   ```bash
   cd photoboof
   ```

2. **Configure AWS credentials**
   ```bash
   cp .env.example .env
   # Edit .env and add your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
   ```

3. **Start the application with Docker Compose**
   ```bash
   docker compose up --build
   ```

   This will:
   - Start a PostgreSQL database
   - Build and start the Flask application
   - Build the React frontend
   - Connect everything together

4. **Access the application**
   - Open http://localhost:5000 in your browser

5. **Stop the application**
   ```bash
   docker compose down
   ```

### Environment Variables

The application requires the following environment variables:

- **DATABASE_URL**: Automatically set by Docker Compose to connect to PostgreSQL
- **SECRET_KEY**: Automatically set for local development
- **ADMIN_PASSWORD**: Automatically set for local development
- **AWS_ACCESS_KEY_ID**: Set from your .env file (required for S3)
- **AWS_SECRET_ACCESS_KEY**: Set from your .env file (required for S3)
- **AWS_REGION**: Set to us-east-2 in docker-compose.yml
- **S3_BUCKET_NAME**: Set to photobooth-abby-bernie in docker-compose.yml

## Deployment to Render

### AWS S3 Setup (Required for Production)

Before deploying to Render, you need to set up AWS S3 to persist templates and photos across deployments:

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://photobooth-abby-bernie --region us-east-2
   ```

2. **Configure Bucket for Public Access**
   ```bash
   aws s3api put-bucket-acl --bucket photobooth-abby-bernie --acl public-read
   ```

3. **Configure CORS for S3 Bucket**
   ```bash
   aws s3api put-bucket-cors --bucket photobooth-abby-bernie --cors-configuration '{
     "CORSRules": [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedOrigins": ["*"],
         "ExposeHeaders": ["ETag"]
       }
     ]
   }'
   ```

4. **Create IAM User for Application Access**
   ```bash
   aws iam create-user --user-name photobooth-app
   ```

5. **Attach S3 Policy to IAM User**
   ```bash
   aws iam put-user-policy --user-name photobooth-app --policy-name PhotoboothS3Access --policy-document '{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::photobooth-abby-bernie",
           "arn:aws:s3:::photobooth-abby-bernie/*"
         ]
       }
     ]
   }'
   ```

6. **Create Access Key for IAM User**
   ```bash
   aws iam create-access-key --user-name photobooth-app
   ```
   **Important**: Save the `AccessKeyId` and `SecretAccessKey` from the output for Render environment variables.

7. **Create Directories in S3 Bucket**
   ```bash
   aws s3api put-object --bucket photobooth-abby-bernie --key templates/
   aws s3api put-object --bucket photobooth-abby-bernie --key uploads/
   ```

### Render Deployment

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render account**
   - Go to [render.com](https://render.com)
   - Create a new account

3. **Connect GitHub repository**
   - In Render dashboard, click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration

4. **Configure environment variables**
   - Render will automatically set up PostgreSQL database
   - Configure `ADMIN_PASSWORD` for security
   - Add AWS credentials from step 6 above:
     - `AWS_ACCESS_KEY_ID`: Your AWS access key
     - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
     - `AWS_REGION`: us-east-2 (or your preferred region)
     - `S3_BUCKET_NAME`: photobooth-abby-bernie

5. **Set up custom domain**
   - Add `photobooth.abbyandbernie.com` in Render dashboard
   - Configure DNS settings with your domain provider

## Project Structure

```
photoboof/
├── app.py                 # Flask application: API routes and database models
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── render.yaml            # Render deployment configuration
├── Dockerfile             # Container definition for Docker
├── docker-compose.yml     # Docker Compose orchestration for local development
├── .env.example           # Template for AWS credentials
├── s3_storage.py         # AWS S3 storage implementation
├── TEMPLATE_SPECS.md      # Dimensions and layout rules for overlay templates
└── react-frontend/        # React application
    ├── src/
    │   ├── components/    # React components (capture, compositing, gallery, admin)
    │   ├── App.jsx        # Main React app
    │   └── index.css      # Global styles
    ├── package.json       # Frontend dependencies
    ├── vite.config.js     # Vite configuration (proxies /api to Flask)
    └── dist/              # Production build served by Flask
```

Photos are composited against the selected template in the browser (canvas) and
posted to `/api/photos` as a base64 PNG; Flask stores the finished image and its
database record.

## Usage

### For Guests

1. Visit photobooth.abbyandbernie.com
2. Click "Start Photobooth"
3. Select a template
4. Allow camera access
5. Follow the countdown to capture 4 photos
6. Preview and save your photo
7. Download or share your photo
8. View all photos in the gallery

### For Admins

1. Visit photobooth.abbyandbernie.com/admin
2. Enter admin password
3. Upload PNG templates
4. Manage existing templates
5. View all captured photos

## Template Creation

Templates should be PNG files with transparent areas where photos will be placed. Required size: 1200x1800 pixels. See [TEMPLATE_SPECS.md](TEMPLATE_SPECS.md) for the exact photo cell coordinates and layout rules.

## Troubleshooting

### Docker Issues

**Docker daemon not running**
- Ensure Docker Desktop is running before starting the application
- Check that Docker has sufficient resources allocated

**Container fails to start**
- Check that port 5000 is not already in use
- Run `docker compose logs` to see error messages
- Ensure .env file contains valid AWS credentials

**Database connection issues**
- PostgreSQL container may need time to start up
- Check that both containers are running: `docker compose ps`
- The web container waits for PostgreSQL to be healthy before starting

### Camera not working
- Ensure you've granted camera permissions
- Try using a different browser (Chrome, Firefox, Safari)
- Check if your device has a working camera

### Templates not uploading
- Ensure file is in PNG format
- Check file size (should be under 5MB)
- Verify admin password is correct
- Check AWS credentials are configured correctly in environment variables
- Verify S3 bucket CORS configuration

### Photos not saving
- Check internet connection
- Verify server is running
- Check browser console for errors
- Ensure AWS S3 credentials are properly configured
- Verify S3 bucket permissions

### S3 Connection Issues
- Verify AWS credentials are correct
- Check that S3 bucket exists and is in the correct region
- Ensure IAM user has proper S3 permissions
- Check that bucket CORS configuration allows your domain

### Cost Considerations
- AWS S3 storage costs approximately $0.023/GB/month
- S3 request costs are minimal (~$0.0004 per 1,000 requests)
- For a typical wedding with ~1000 photos (~500MB), expect costs under $1/month
- Monitor AWS billing console for actual usage

## Future Enhancements

- [ ] Photo filters and effects
- [ ] QR code generation for sharing
- [ ] Guest email/phone collection
- [ ] Social media sharing
- [ ] Live slideshow of recent photos
- [ ] Statistics dashboard
- [ ] Raspberry Pi camera proxy for station mode

## License

This project is for personal use for Abby & Bernie's wedding.