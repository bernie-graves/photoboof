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
- **Database**: SQLite (development) / PostgreSQL (production)
- **Deployment**: Render

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm

### Setup

1. **Clone the repository**
   ```bash
   cd photoboof
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up React frontend**
   ```bash
   cd react-frontend
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   # Copy .env file and configure as needed
   # The .env file already has default values for development
   ```

5. **Build React for production**
   ```bash
   cd react-frontend
   npm run build
   cd ..
   ```

6. **Run the Flask application**
   ```bash
   python app.py
   ```

7. **Access the application**
   - Open http://localhost:5000 in your browser

## Deployment to Render

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

5. **Set up custom domain**
   - Add `photobooth.abbyandbernie.com` in Render dashboard
   - Configure DNS settings with your domain provider

## Project Structure

```
photoboof/
├── app.py                  # Main Flask application
├── config.py               # Configuration settings
├── camera_proxy.py         # Raspberry Pi camera service (optional)
├── templates.py            # Template compositing logic
├── storage.py              # File storage management
├── requirements.txt        # Python dependencies
├── render.yaml            # Render deployment configuration
├── .env                   # Environment variables
├── templates/             # PNG overlay templates
├── uploads/               # Final composite images
├── temp/                  # Temporary captured photos
└── react-frontend/        # React application
    ├── src/
    │   ├── components/    # React components
    │   ├── App.jsx       # Main React app
    │   └── index.css     # Global styles
    ├── package.json      # Frontend dependencies
    └── vite.config.js    # Vite configuration
```

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

Templates should be PNG files with transparent areas where photos will be placed. Recommended size: 1200x1800 pixels (4x6 ratio).

## Troubleshooting

### Camera not working
- Ensure you've granted camera permissions
- Try using a different browser (Chrome, Firefox, Safari)
- Check if your device has a working camera

### Templates not uploading
- Ensure file is in PNG format
- Check file size (should be under 5MB)
- Verify admin password is correct

### Photos not saving
- Check internet connection
- Verify server is running
- Check browser console for errors

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