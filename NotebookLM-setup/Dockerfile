FROM python:3.11-slim

WORKDIR /app

# Install the notebooklm-mcp-cli package, fastapi, and uvicorn
RUN pip install --no-cache-dir notebooklm-mcp-cli fastapi uvicorn

# Copy the authentication cookies and bridge script
COPY cookies.json /app/cookies.json
COPY bridge.py /app/bridge.py

# Pre-authenticate using the cookies.json during build, so the cache is set.
# This will write the profile data to /root/.notebooklm-mcp-cli
RUN nlm login --profile jordanborden --manual --file /app/cookies.json && \
    nlm login switch jordanborden

# Expose port (Cloud Run sets the PORT env var)
EXPOSE 8080

# Run the FastAPI bridge
CMD ["python", "bridge.py"]
