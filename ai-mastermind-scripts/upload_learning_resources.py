import json
import subprocess
import time
import os

NOTEBOOK_ID = "a77c6dfb-e91e-4ba8-a933-1c42deacf9bb"
JSON_FILE = "learning_resources.json"
# Use absolute path to nlm if possible, or relative from project root
NLM_PATH = os.path.join(".venv", "Scripts", "nlm.exe")

def main():
    if not os.path.exists(JSON_FILE):
        print(f"Error: {JSON_FILE} not found. Run export_learning_resources.ts first.")
        return

    with open(JSON_FILE, "r", encoding="utf-8") as f:
        resources = json.load(f)

    print(f"Found {len(resources)} resources to upload to Notebook {NOTEBOOK_ID}.")

    success_count = 0
    fail_count = 0
    consecutive_fail_count = 0

    for i, res in enumerate(resources):
        if consecutive_fail_count >= 3:
            print("\n!!! Aborting: Too many consecutive failures. Please check your configuration. !!!")
            break

        url = res.get("url")
        title = res.get("title", "Untitled")
        
        if not url:
            print(f"Skipping {title} (no URL)")
            continue

        print(f"[{i+1}/{len(resources)}] Adding: {title}")
        
        try:
            # Check if URL is valid (basic check)
            if not url.startswith("http"):
                print(f"  Skipping invalid URL: {url}")
                continue

            cmd = [NLM_PATH, "add", "url", NOTEBOOK_ID, url]
            # Use shell=True on Windows might be needed if nlm is a script, but exe should be fine
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
            
            if result.returncode == 0:
                print("  Success")
                success_count += 1
                consecutive_fail_count = 0
            else:
                print(f"  Failed: {result.stderr.strip()}")
                if "429" in result.stderr: # Rate limit
                    print("  Rate limit hit, waiting 10s...")
                    time.sleep(10)
                fail_count += 1
                consecutive_fail_count += 1
                
        except Exception as e:
            print(f"  Error executing command: {e}")
            fail_count += 1
        
        # Be nice to the API
        time.sleep(2)

    print(f"\nUpload complete. Success: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    main()
