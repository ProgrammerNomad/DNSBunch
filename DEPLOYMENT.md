# DNSBunch Deployment Guide

## Frontend Deployment (Netlify)

### Prerequisites
1. GitHub repository with your DNSBunch code
2. Netlify account
3. Backend deployed (e.g., on Render.com)

### Steps to Deploy

#### 1. Prepare Your Repository
- Ensure your `netlify.toml` is in the `frontend/` directory
- Commit and push all changes to GitHub

#### 2. Connect to Netlify
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub and authorize
4. Select your DNSBunch repository

#### 3. Configure Build Settings
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/.next`

#### 4. Set Environment Variables
Go to Site Settings > Environment Variables and add:
```bash
NEXT_PUBLIC_API_URL=https://api2.dnsbunch.com
NEXT_PUBLIC_API_TIMEOUT=30000
NODE_ENV=production
```

#### 5. Deploy
- Click "Deploy site"
- Wait for build to complete
- Your site will be available at `https://your-site-name.netlify.app`

### Custom Domain (Optional)
1. Go to Site Settings > Domain management
2. Add your custom domain
3. Configure DNS records as instructed by Netlify

---

## Backend Deployment (Render.com)

### Steps to Deploy Backend

#### 1. Prepare Backend
- Ensure `render.yaml` exists in `backend/` directory
- Create `.env` file with production values

#### 2. Deploy to Render
1. Go to [Render](https://render.com)
2. Connect your GitHub repository
3. Create new Web Service
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment**: Python 3

#### 3. Set Environment Variables
Add these in Render dashboard:
```
FLASK_ENV=production
FLASK_DEBUG=False
CORS_ORIGINS=https://your-netlify-site.netlify.app
PORT=5000
```

#### 4. Update Frontend Config
Update your Netlify environment variables with the backend URL:
```bash
NEXT_PUBLIC_API_URL=https://api2.dnsbunch.com
```

---

## Testing Deployment

### 1. Check Backend Health
Visit: `https://api2.dnsbunch.com/`
Should return: `{"status": "healthy", "service": "DNSBunch API", "version": "1.0.0"}`

### 2. Test Frontend
1. Visit your Netlify site
2. Enter a domain name (e.g., "google.com")
3. Click "Analyze"
4. Verify results are displayed

### 3. Check API Connection
Open browser dev tools and verify:
- API requests are going to the correct backend URL
- No CORS errors
- Responses are received successfully

---

## Troubleshooting

### Common Issues

#### 1. Build Fails on Netlify
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

#### 2. API Connection Fails
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is running and accessible

#### 3. Environment Variables Not Working
- Frontend vars must start with `NEXT_PUBLIC_`
- Check spelling and case sensitivity
- Restart deployment after changing variables

#### 4. 404 Errors
- Verify `netlify.toml` redirects are correct
- Check that all routes are properly configured

---

## Production Checklist

### Before Going Live
- [ ] Backend environment variables set correctly
- [ ] Frontend API URL pointing to production backend
- [ ] CORS origins configured for production domain
- [ ] SSL certificates are active
- [ ] Error monitoring enabled
- [ ] Performance testing completed
- [ ] Security headers configured
- [ ] Custom domain configured (if applicable)

### After Deployment
- [ ] Test all DNS analysis features
- [ ] Verify error handling works
- [ ] Check mobile responsiveness
- [ ] Test with various domain names
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerting
