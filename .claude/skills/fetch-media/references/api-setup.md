# API Setup and Configuration

## Unsplash API Key

Unsplash requires an API key for access. Here's how to set it up:

### 1. Create Unsplash Account

Visit [unsplash.com](https://unsplash.com) and sign up for a free account.

### 2. Register Your Application

1. Go to [unsplash.com/oauth/applications](https://unsplash.com/oauth/applications)
2. Click "New Application"
3. Accept the API Terms
4. Fill in application details:
   - **Application name**: "Claude Media Fetcher" (or your preference)
   - **Description**: "Fetching images for educational/research purposes"
5. Submit the application

### 3. Get Your Access Key

After creating the application, you'll see:
- **Access Key** (this is what you need)
- **Secret Key** (not needed for basic usage)

### 4. Configure Environment Variable

Create a `.env` file in the skill directory:

```bash
cd .claude/skills/fetch-media
cp .env.example .env
```

Edit `.env` and add your key:

```bash
UNSPLASH_API_KEY=your_actual_access_key_here
```

### 5. Test Configuration

```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source unsplash \
  --query "nature" \
  --limit 1
```

If configured correctly, you should see one Unsplash result.

## Pixabay API Key

Pixabay requires an API key for access. Here's how to set it up:

### 1. Create Pixabay Account

Visit [pixabay.com](https://pixabay.com) and sign up for a free account.

### 2. Get Your API Key

1. Log in to your Pixabay account
2. Go to [pixabay.com/api/docs/](https://pixabay.com/api/docs/)
3. Your API key will be displayed at the top of the documentation page
   - Look for: "Your API key: xxxxxxxxxxxxxxxxx"
4. Copy the API key

Note: API key is automatically generated when you create an account.

### 3. Configure Environment Variable

Add your Pixabay API key to the `.env` file:

```bash
cd .claude/skills/fetch-media
# Edit .env and add your key
```

Add this line to `.env`:

```bash
PIXABAY_API_KEY=your_actual_api_key_here
```

### 4. Test Configuration

```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "nature" \
  --limit 1
```

If configured correctly, you should see one Pixabay result.

## Rate Limits

### Unsplash
- **Demo/Development**: 50 requests per hour
- **Production**: Higher limits available (apply through Unsplash dashboard)

### Pixabay
- **Standard**: 100 requests per minute
- **Maximum**: 5,000 requests per hour (for free accounts)

## Security Notes

- **Never commit** the `.env` file to version control
- **Never share** your API key publicly
- The `.gitignore` should exclude `.env` files
- Use `.env.example` as a template without real credentials

## Troubleshooting

### "Unsplash API key not found"

**Cause**: `.env` file missing or `UNSPLASH_API_KEY` not set

**Solution**:
```bash
# Check if .env exists
ls -la .claude/skills/fetch-media/.env

# If not, create it
cp .claude/skills/fetch-media/.env.example .claude/skills/fetch-media/.env

# Edit and add your key
nano .claude/skills/fetch-media/.env
```

### "Unauthorized" or "401" errors

**Cause**: Invalid or expired API key

**Solution**:
1. Verify your key is correct (check for typos)
2. Regenerate key in Unsplash dashboard if needed
3. Ensure key is properly formatted in `.env` (no quotes, spaces, or newlines)

### Rate limit exceeded

**Cause**: Too many requests in short period

**Solution**:
- Wait until the rate limit window resets (hourly)
- Consider applying for production access for higher limits
- Use `--limit` parameter to reduce number of requests

### Pixabay Troubleshooting

#### "Pixabay API key not found"

**Cause**: `.env` file missing or `PIXABAY_API_KEY` not set

**Solution**:
```bash
# Check if .env exists
ls -la .claude/skills/fetch-media/.env

# Edit and add your Pixabay key
nano .claude/skills/fetch-media/.env
```

#### "429 Too Many Requests"

**Cause**: Exceeded Pixabay rate limit (100 requests per minute)

**Solution**:
- Wait 60 seconds before making more requests
- The skill automatically implements rate limiting (0.6s between requests)
- Reduce `--limit` parameter to fetch fewer results
